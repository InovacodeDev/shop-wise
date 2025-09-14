import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './authenticated-request.interface';
import { RequestPasswordDto } from './dto/request-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetExperimentalPasswordDto } from './dto/set-experimental-password.dto';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { ValidateResetTokenDto } from './dto/validate-reset-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { signJwt } from './jwt.util';
import { OauthService } from './oauth.service';
import { PassportJwtAuthGuard } from './passport-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly oauth: OauthService,
    ) {}

    // Client sends Google ID token (from Google Sign-In or One Tap)
    @Post('oauth/google-idtoken')
    async googleIdToken(@Body() body: { idToken: string }, @Res({ passthrough: true }) res: Response) {
        // Narrow the dynamic import into a small explicit interface to avoid
        // unsafe-* eslint complaints while still performing the runtime import.
        type GoogleAuthModule = {
            OAuth2Client: new (clientId?: string) => {
                verifyIdToken(opts: { idToken: string; audience?: string }): Promise<{ getPayload(): unknown }>;
            };
        };

        const googleAuth = (await import('google-auth-library')) as unknown as GoogleAuthModule;
        const OAuth2Client = googleAuth.OAuth2Client;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID ?? '');
        const ticket = await client.verifyIdToken({ idToken: body.idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payloadRaw = ticket.getPayload();
        const payload = (payloadRaw as { email?: string; name?: string; picture?: string } | null) ?? null;
        if (!payload) throw new Error('Invalid Google token');
        const profile = { email: payload.email, displayName: payload.name, photoURL: payload.picture };
        const user = await this.oauth.upsertUser(profile);
        if (!user) throw new Error('Failed to upsert user');
        const u = user as { _id: string; email?: string };
        const token = signJwt({ uid: u._id, email: u.email });
        // Create a refresh token and return it as HttpOnly cookie
        try {
            const refresh = await this.auth.createRefreshTokenForUid(u._id);

            // For serverless environments, return tokens instead of setting cookies
            if (process.env.NODE_ENV === 'production' || process.env.SERVERLESS === 'true') {
                return { token, uid: u._id, refreshToken: refresh };
            }

            // For development, set secure HttpOnly cookie for refresh token and return token+uid only
            res.cookie('refreshToken', refresh, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            return { token, uid: u._id };
        } catch {
            return { token, uid: u._id };
        }
    }

    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        return this.auth.signUp(dto);
    }

    @Post('signin')
    async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.signIn(dto.email, dto.password, dto.totp);
        // result: { token, uid, refresh }
        const refreshVal = (result as { refresh?: string }).refresh;

        // For serverless environments, return tokens instead of setting cookies
        if (process.env.NODE_ENV === 'production' || process.env.SERVERLESS === 'true') {
            return {
                token: result.token,
                uid: result.uid,
                refreshToken: refreshVal,
            };
        }

        // For development, still use cookies
        if (refreshVal) {
            // Set secure HttpOnly cookie for refresh token
            res.cookie('refreshToken', refreshVal, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
        }
        return result;
    }

    @Post('request-password')
    async requestPassword(@Body() dto: RequestPasswordDto) {
        return this.auth.requestPasswordReset(dto.email);
    }

    @Post('validate-reset-token')
    async validateResetToken(@Body() dto: ValidateResetTokenDto) {
        return this.auth.validateResetToken(dto.token);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.auth.resetPassword(dto.token, dto.newPassword);
    }

    @Post('verify-email')
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.auth.verifyEmail(dto.token);
    }

    @Post('refresh')
    async refresh(@Req() req: Request) {
        // Try to get refresh token from header first (for serverless), then from cookie
        const authHeader = req.headers['authorization'];
        const headerToken = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;
        const cookieToken = (req as Request & { cookies?: Record<string, unknown> }).cookies?.refreshToken as
            | string
            | undefined;
        const token = headerToken || cookieToken;

        if (!token) throw new Error('No refresh token provided');
        return this.auth.refreshToken(String(token));
    }

    @Post('revoke')
    @UseGuards(PassportJwtAuthGuard)
    async revoke(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
        if (!req.user) throw new Error('Unauthenticated');
        await this.auth.revokeRefreshToken(req.user.uid);
        res.clearCookie('refreshToken', { path: '/' });
        return { ok: true };
    }

    @Get('me')
    @UseGuards(PassportJwtAuthGuard)
    me(@Req() req: AuthenticatedRequest) {
        if (!req.user) throw new Error('Unauthenticated');
        return { user: req.user };
    }

    @Get('2fa/generate')
    async generate2fa(@Query('uid') uid: string) {
        return this.auth.generate2faSecret(uid);
    }

    @Post('2fa/enable')
    async enable2fa(@Body() body: { uid: string; token: string }) {
        return this.auth.enable2fa(body.uid, body.token);
    }

    @Post('2fa/disable')
    async disable2fa(@Body() body: { uid: string }) {
        return this.auth.disable2fa(body.uid);
    }

    @Delete('data')
    @UseGuards(PassportJwtAuthGuard)
    async deleteAllUserData(@Req() req: AuthenticatedRequest) {
        if (!req.user) throw new Error('Unauthenticated');
        return await this.auth.deleteAllUserData(req.user.uid);
    }

    @Delete('account')
    @UseGuards(PassportJwtAuthGuard)
    async deleteUserAccountAndData(@Req() req: AuthenticatedRequest) {
        if (!req.user) throw new Error('Unauthenticated');
        return await this.auth.deleteUserAccountAndData(req.user.uid);
    }

    @Post('admin/set-experimental-password')
    async setExperimentalPassword(@Body() dto: SetExperimentalPasswordDto) {
        return this.auth.setExperimentalPassword(dto.email, dto.password);
    }
}

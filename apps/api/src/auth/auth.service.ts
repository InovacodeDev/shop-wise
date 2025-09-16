/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { FamiliesService } from '@/families/families.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import argon2 from 'argon2';
import { createHmac, randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { TokenMetricsService } from './';
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS, PASSWORD_RESET_TOKEN_EXPIRY_MS } from './constants';
import { SignUpDto } from './dto/signup.dto';
import { signJwt } from './jwt.util';
import { MailService } from './mail.service';
import { hashPassword, verifyPassword } from './password.util';
import { generateTotpSecret, verifyTotp } from './totp.util';

type LeanUser = {
    _id: string;
    email?: string | undefined | null;
    displayName?: string | undefined | null;
    passwordHash?: string | undefined | null;
    totpEnabled?: boolean | undefined;
    totpSecret?: string | null | undefined;
    totpTempSecret?: string | null | undefined;
    refreshTokenHash?: string | null | undefined;
    emailVerified?: boolean | undefined;
    emailVerificationToken?: string | null | undefined;
    emailVerificationTokenExpiresAt?: Date | string | null | undefined;
    passwordResetToken?: string | null | undefined;
    passwordResetExpiresAt?: Date | string | null | undefined;
    [k: string]: unknown;
};

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        private readonly usersService: UsersService,
        private readonly familiesService: FamiliesService,
        private readonly mailService?: MailService,
        private readonly metrics?: TokenMetricsService,
    ) {}

    private safeToString(v: unknown) {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string') return v;
        // Only stringify primitive values to avoid '[object Object]' warnings
        if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint' || typeof v === 'symbol') {
            return String(v);
        }
        return '';
    }

    async signUp(dto: SignUpDto) {
        const existing = await this.userModel.findOne({ email: dto.email }).lean<LeanUser>().exec();
        if (existing) throw new BadRequestException('Email already in use');

        const uid = randomUUID();
        const passwordHash = await hashPassword(dto.password);
        const now = new Date();

        const emailVerificationToken = randomUUID();
        const emailVerificationTokenHash = await (argon2 as any).hash(emailVerificationToken);
        const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';
        const emailHmac = createHmac('sha256', hmacSecret).update(emailVerificationToken).digest('hex');
        const emailHmacPrefix = emailHmac.slice(0, 8);
        const doc = {
            _id: uid,
            email: dto.email,
            displayName: dto.displayName || dto.email.split('@')[0],
            passwordHash,
            createdAt: now,
            updatedAt: now,
            emailVerified: false,
            emailVerificationTokenHash,
            emailVerificationTokenExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
            emailVerificationTokenHmacPrefix: emailHmacPrefix,
        };

        const user = await this.userModel.create(doc as unknown as UserDocument);
        const family = await this.familiesService.create(
            {
                familyName: `${doc.displayName}'s Family`,
            },
            user._id,
        );
        await this.usersService.create({ email: dto.email, displayName: doc.displayName }, user._id);
        await this.usersService.update(user._id, { familyId: family._id.toString() });

        if (this.mailService) {
            // Send localized, templated verification email using FRONTEND_URL/verify-email
            this.mailService.sendEmailVerification(dto.email, emailVerificationToken).catch(() => null);
        }

        return { uid, email: dto.email, emailVerificationToken };
    }

    async signIn(email: string, password: string, totp?: string) {
        const user = await this.userModel.findOne({ email }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException('User not found');
        if (!user.passwordHash) throw new BadRequestException('No password set for this account');

        const storedPasswordHash = String(user.passwordHash);
        let isValid = false;
        let shouldUpdatePassword = false;

        // Check if the stored password is experimental (has EXP- prefix)
        if (storedPasswordHash.startsWith('EXP-')) {
            // Extract the actual password from the stored hash (remove EXP- prefix)
            const storedActualPassword = storedPasswordHash.substring(4);

            // Compare the user's input password with the stored actual password
            isValid = password === storedActualPassword;
            shouldUpdatePassword = isValid; // Only update if login is successful
        } else {
            // Normal password verification with Argon2 hash
            isValid = await verifyPassword(password, storedPasswordHash);
        }

        if (!isValid) throw new BadRequestException('Invalid credentials');

        // If 2FA enabled, verify totp
        if (user.totpEnabled) {
            if (!totp) throw new BadRequestException('Two-factor token required');
            const valid = verifyTotp(totp, String(user.totpSecret));
            if (!valid) throw new BadRequestException('Invalid two-factor token');
        }

        // If this was an experimental password, update it to use proper hashing
        if (shouldUpdatePassword) {
            const newPasswordHash = await hashPassword(password);
            await this.userModel.updateOne({ _id: user._id }, { $set: { passwordHash: newPasswordHash } }).exec();
        }

        const token = signJwt({ uid: user._id, email: this.safeToString(user.email) || undefined });
        // create a hashed refresh token and store hash
        const refresh = randomUUID();
        const refreshHash = await (argon2 as any).hash(refresh);
        await this.userModel.updateOne({ _id: user._id }, { $set: { refreshTokenHash: refreshHash } }).exec();
        return { token, uid: user.uid, refresh };
    }

    async requestPasswordReset(email: string) {
        const user = await this.userModel.findOne({ email }).lean<LeanUser>().exec();
        if (!user) return true; // don't reveal

        const token = randomUUID();
        const tokenHash = await (argon2 as any).hash(token);
        const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';
        const tokenHmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
        const tokenHmacPrefix = tokenHmac.slice(0, 8);
        await this.userModel
            .updateOne(
                { email },
                {
                    $set: {
                        passwordResetTokenHash: tokenHash,
                        passwordResetTokenHmacPrefix: tokenHmacPrefix,
                        passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS),
                    },
                },
            )
            .exec();
        // send reset email if configured
        if (this.mailService) {
            const resetUrl = `${process.env.APP_URL || 'http://localhost:9000'}/auth/reset-password?token=${token}`;
            this.mailService
                .sendMail({
                    to: email,
                    subject: 'Password reset',
                    text: `Reset your password: ${resetUrl}`,
                    html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
                })
                .catch(() => null);
        }
        return { ok: true, token };
    }

    async resetPassword(token: string, newPassword: string) {
        // Compute hmac prefix to narrow candidates
        const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';
        const tokenHmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
        const prefix = tokenHmac.slice(0, 8);

        // Find user candidates by prefix
        const all = (await this.userModel
            .find({ passwordResetTokenHmacPrefix: prefix })
            .lean<LeanUser>()
            .exec()) as unknown as LeanUser[];
        let userToUse: LeanUser | null = null;
        for (const u of all) {
            if (!u.passwordResetTokenHash) continue;
            try {
                const start = Date.now();
                /* eslint-disable @typescript-eslint/no-unsafe-call */
                const ok = Boolean(await (argon2 as any).verify(this.safeToString(u.passwordResetTokenHash), token));
                const duration = Date.now() - start;
                try {
                    this.metrics?.recordLookup(Number(duration), Boolean(ok));
                } catch {
                    /* ignore metrics errors */
                }
                if (ok) {
                    userToUse = u;
                    break;
                }
            } catch {
                // ignore verification errors for this entry
            }
        }
        if (!userToUse) throw new BadRequestException('Invalid token');
        if (userToUse.passwordResetExpiresAt && new Date(userToUse.passwordResetExpiresAt) < new Date())
            throw new BadRequestException('Token expired');

        const passwordHash = await hashPassword(newPassword);
        await this.userModel
            .updateOne(
                { _id: userToUse._id },
                { $set: { passwordHash }, $unset: { passwordResetTokenHash: '', passwordResetExpiresAt: '' } },
            )
            .exec();
        return true;
    }

    async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
        // Compute hmac prefix to narrow candidates
        const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';
        const tokenHmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
        const prefix = tokenHmac.slice(0, 8);

        // Find user candidates by prefix
        const all = (await this.userModel
            .find({ passwordResetTokenHmacPrefix: prefix })
            .lean<LeanUser>()
            .exec()) as unknown as LeanUser[];
        let userToUse: LeanUser | null = null;
        for (const u of all) {
            if (!u.passwordResetTokenHash) continue;
            try {
                const start = Date.now();
                /* eslint-disable @typescript-eslint/no-unsafe-call */
                const ok = Boolean(await (argon2 as any).verify(this.safeToString(u.passwordResetTokenHash), token));
                const duration = Date.now() - start;
                try {
                    this.metrics?.recordLookup(Number(duration), Boolean(ok));
                } catch {
                    /* ignore metrics errors */
                }
                if (ok) {
                    userToUse = u;
                    break;
                }
            } catch {
                // ignore verification errors for this entry
            }
        }
        if (!userToUse) return { valid: false };
        if (userToUse.passwordResetExpiresAt && new Date(userToUse.passwordResetExpiresAt) < new Date())
            return { valid: false };

        return { valid: true, email: this.safeToString(userToUse.email) || undefined };
    }

    async verifyEmail(token: string) {
        // Compute hmac prefix to narrow candidates
        const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';
        const tokenHmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
        const prefix = tokenHmac.slice(0, 8);

        // Find user candidates by prefix
        const all = (await this.userModel
            .find({ emailVerificationTokenHmacPrefix: prefix })
            .lean<LeanUser>()
            .exec()) as unknown as LeanUser[];
        let userToUse: LeanUser | null = null;
        for (const u of all) {
            if (!u.emailVerificationTokenHash) continue;
            try {
                const start = Date.now();
                /* eslint-disable @typescript-eslint/no-unsafe-call */
                const ok = Boolean(
                    await (argon2 as any).verify(this.safeToString(u.emailVerificationTokenHash), token),
                );
                const duration = Date.now() - start;
                try {
                    this.metrics?.recordLookup(Number(duration), Boolean(ok));
                } catch {
                    /* ignore metrics errors */
                }
                if (ok) {
                    userToUse = u;
                    break;
                }
            } catch {
                // ignore verification errors for this entry
            }
        }
        if (!userToUse) throw new BadRequestException('Invalid token');
        if (
            userToUse.emailVerificationTokenExpiresAt &&
            new Date(userToUse.emailVerificationTokenExpiresAt) < new Date()
        )
            throw new BadRequestException('Token expired');

        await this.userModel
            .updateOne(
                { _id: userToUse._id },
                {
                    $set: { emailVerified: true },
                    $unset: { emailVerificationTokenHash: '', emailVerificationTokenExpiresAt: '' },
                },
            )
            .exec();
        return true;
    }

    // 2FA setup: return secret and otpauth_url
    async generate2faSecret(uid: string) {
        const user = await this.userModel.findOne({ _id: uid }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException('User not found');
        const secret = generateTotpSecret(user.email || user._id);
        await this.userModel.updateOne({ _id: user._id }, { $set: { totpTempSecret: secret.base32 } }).exec();
        return { otpauth_url: secret.otpauth_url, base32: secret.base32 };
    }

    async enable2fa(uid: string, token: string) {
        const user = await this.userModel.findOne({ _id: uid }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException('User not found');
        if (!user.totpTempSecret) throw new BadRequestException('No pending 2FA setup');
        const ok = verifyTotp(token, String(user.totpTempSecret));
        if (!ok) throw new BadRequestException('Invalid token');
        await this.userModel
            .updateOne(
                { _id: user._id },
                { $set: { totpEnabled: true, totpSecret: user.totpTempSecret }, $unset: { totpTempSecret: '' } },
            )
            .exec();
        return true;
    }

    async disable2fa(uid: string) {
        await this.userModel.updateOne({ uid }, { $unset: { totpSecret: '', totpEnabled: '' } }).exec();
        return true;
    }

    async refreshToken(token: string) {
        const user = await this.userModel
            .findOne({ refreshTokenHash: { $exists: true } })
            .lean<LeanUser>()
            .exec();
        if (!user) throw new BadRequestException('Invalid refresh token');
        if (!user.refreshTokenHash) throw new BadRequestException('Invalid refresh token');
        const ok = Boolean(await argon2.verify(String(user.refreshTokenHash), token));
        if (!ok) throw new BadRequestException('Invalid refresh token');
        // rotate
        const newRefresh = randomUUID();
        const newHash = String(await argon2.hash(newRefresh));
        await this.userModel.updateOne({ _id: user._id }, { $set: { refreshTokenHash: newHash } }).exec();
        const newJwt = signJwt({ uid: user._id, email: this.safeToString(user.email) || undefined });
        return { token: newJwt, refresh: newRefresh };
    }

    /** Create and store a refresh token for an existing user id (uid) and return the raw refresh token. */
    async createRefreshTokenForUid(uid: string) {
        const user = await this.userModel.findOne({ _id: uid }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException('User not found');
        const refresh = randomUUID();
        const refreshHash = String(await argon2.hash(refresh));
        await this.userModel.updateOne({ _id: user._id }, { $set: { refreshTokenHash: refreshHash } }).exec();
        return refresh;
    }

    async revokeRefreshToken(uid: string) {
        await this.userModel.updateOne({ _id: uid }, { $unset: { refreshTokenHash: '' } }).exec();
        return true;
    }

    /**
     * Delete all user data except the user account itself.
     * If user owns a family with other members, transfer ownership to the first member.
     */
    async deleteAllUserData(userId: string): Promise<{ message: string; transferredFamilyTo?: string }> {
        const user = await this.userModel.findOne({ _id: userId }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException(`User with ID "${userId}" not found`);

        let transferredFamilyTo: string | undefined;

        // Handle family ownership transfer if user owns a family
        if (user.familyId) {
            const family = await this.familiesService.findOne(user.familyId as string);
            if (family && family.ownerId === userId) {
                // Find other family members
                const familyMembers = await this.userModel
                    .find({ familyId: user.familyId, _id: { $ne: userId } })
                    .lean<LeanUser>()
                    .exec();

                if (Array.isArray(familyMembers) && familyMembers.length > 0) {
                    // Transfer ownership to the first member found
                    const newOwner = familyMembers[0] as LeanUser;
                    await this.userModel
                        .updateOne({ _id: user.familyId }, { $set: { ownerId: newOwner._id, updatedAt: new Date() } })
                        .exec();
                    transferredFamilyTo = String(newOwner._id);
                }
            }
        }

        // Remove user from family
        await this.userModel
            .updateOne({ _id: userId }, { $unset: { familyId: '' }, $set: { updatedAt: new Date() } })
            .exec();

        const result: { message: string; transferredFamilyTo?: string } = {
            message: 'All user data deleted successfully',
        };

        if (transferredFamilyTo) {
            result.transferredFamilyTo = transferredFamilyTo;
        }

        return result;
    }

    /**
     * Delete user account and all associated data.
     * Revokes all sessions and handles family ownership transfer.
     */
    async deleteUserAccountAndData(userId: string): Promise<{ message: string; transferredFamilyTo?: string }> {
        // First delete all user data (this handles family ownership transfer)
        const dataDeleteResult = await this.deleteAllUserData(userId);

        // Revoke all user sessions
        await this.revokeRefreshToken(userId);

        // Finally, delete the user account
        await this.userModel.deleteOne({ _id: userId }).exec();

        return {
            message: 'User account and all data deleted successfully',
            transferredFamilyTo: dataDeleteResult.transferredFamilyTo,
        };
    }

    /**
     * Reset user password to allow temporary access with EXP- prefix
     * This allows administrators to set a temporary unencrypted password that will be properly hashed on first login
     */
    async setExperimentalPassword(email: string, temporaryPassword: string): Promise<{ message: string }> {
        const user = await this.userModel.findOne({ email }).lean<LeanUser>().exec();
        if (!user) throw new NotFoundException('User not found');

        // Store the password with EXP- prefix in plain text
        // This will be detected during signIn and properly hashed after first login
        const experimentalPassword = `EXP-${temporaryPassword}`;

        await this.userModel
            .updateOne(
                { email },
                {
                    $set: {
                        passwordHash: experimentalPassword,
                        // Clear any existing password reset tokens
                        passwordResetTokenHash: null,
                        passwordResetTokenHmacPrefix: null,
                        passwordResetExpiresAt: null,
                        updatedAt: new Date(),
                    },
                },
            )
            .exec();

        return {
            message: `Experimental password set for ${email}. User can now login with '${temporaryPassword}' and the password will be properly secured on first login.`,
        };
    }

    /**
     * Get user by email for administrative purposes
     */
    async getUserByEmail(email: string): Promise<{ exists: boolean; emailVerified?: boolean; totpEnabled?: boolean }> {
        const user = await this.userModel.findOne({ email }).lean<LeanUser>().exec();
        if (!user) return { exists: false };

        return {
            exists: true,
            emailVerified: user.emailVerified,
            totpEnabled: user.totpEnabled,
        };
    }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile as GoogleProfile, Strategy as GoogleStrategyBase } from 'passport-google-oauth20';

import { signJwt } from './jwt.util';
import { OauthService } from './oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
    constructor(private readonly oauthService: OauthService) {
        // Provide safe defaults to `super()` so the Passport strategy never
        // throws during class instantiation even if env vars are absent.
        // The strategy will short-circuit in `validate()` when not configured.
        super({
            clientID: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/oauth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(_accessToken: string, _refreshToken: string, profile: GoogleProfile) {
        // Define a narrow local shape and cast from unknown to avoid unsafe member access
        // while keeping the code type-safe for our usage.
        type LocalProfile = {
            emails?: Array<{ value?: string }>;
            displayName?: string;
            username?: string;
            photos?: Array<{ value?: string }>;
        };

        const p = profile as unknown as LocalProfile;
        const email = Array.isArray(p.emails) ? p.emails[0]?.value : undefined;
        const displayName = typeof p.displayName === 'string' ? p.displayName : p.username;
        const photoURL = Array.isArray(p.photos) ? p.photos[0]?.value : undefined;

        const userProfile = { email, displayName, photoURL } as {
            email?: string;
            displayName?: string;
            photoURL?: string;
        };
        // If the strategy wasn't configured, avoid attempting to upsert users.
        if (!process.env.GOOGLE_CLIENT_ID) return null;

        const user = await this.oauthService.upsertUser(userProfile);
        if (!user) return null;
        const u = user as { _id: string; email?: string };
        const token = signJwt({ uid: u._id, email: u.email });
        // Return both user and token for callers/tests that expect them
        return { user, token };
    }
}

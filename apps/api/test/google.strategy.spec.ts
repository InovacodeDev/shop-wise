import { GoogleStrategy } from '../src/auth/google.strategy';
import { OauthService } from '../src/auth/oauth.service';

describe('GoogleStrategy', () => {
    it('returns a user and token when oauth upsert succeeds', async () => {
        process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-secret';
        const fakeUser: { uid: string; email?: string; _id: string } = { uid: 'u1', email: 'a@b.com', _id: 'u1' };
        const oauth: Partial<OauthService> = {
            upsertUser: jest.fn(() => Promise.resolve(fakeUser)),
        };
        const strat = new GoogleStrategy(oauth as OauthService);
        const profile = {
            emails: [{ value: 'a@b.com' }],
            displayName: 'User',
            photos: [{ value: 'u.jpg' }],
        } as unknown as import('passport-google-oauth20').Profile;
        const res = await strat.validate('access', 'refresh', profile);
        expect(res).toBeTruthy();
        if (res) {
            expect(res.user).toBeDefined();
            expect(res.token).toBeDefined();
        }
    });
});

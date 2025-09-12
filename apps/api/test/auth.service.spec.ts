/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/require-await,@typescript-eslint/no-unsafe-argument */
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

import { AuthService } from '../src/auth/auth.service';
import * as totpUtil from '../src/auth/totp.util';

describe('AuthService', () => {
    let service: AuthService;

    const store = new Map<string, any>();

    const fakeModel = {
        findOne: jest.fn((_query: Record<string, unknown>) => {
            const query = _query;
            const entries = Array.from(store.values());
            // handle queries like { email } or { uid } or { passwordResetToken } or { _id }
            const key = Object.keys(query)[0];
            const val = (query as any)[key];
            const found = entries.find((e: any) => {
                if (key === 'refreshTokenHash') return !!e.refreshTokenHash;
                if (key === '_id') return e._id === val || e.uid === val;
                return e[key] === val;
            });
            return {
                lean: () => ({ exec: async () => (found ? { ...found } : null) }),
                exec: async () => (found ? { ...found } : null),
            };
        }),
        find: jest.fn(() => {
            const entries = Array.from(store.values());
            // ignore query for simplicity in tests
            return {
                lean: () => ({ exec: async () => entries.map((e: any) => ({ ...e })) }),
                exec: async () => entries.map((e: any) => ({ ...e })),
            };
        }),
        create: jest.fn(async (doc: any) => {
            const uid = (doc._id ?? doc.uid) as string;
            store.set(uid, { ...doc, _id: uid });
            return { ...doc };
        }),
        updateOne: jest.fn((query: Record<string, any>, payload: any) => ({
            exec: async () => {
                const key = Object.keys(query)[0];
                const val = query[key];
                const found = Array.from(store.values()).find((e: any) => e[key] === val);
                if (!found) return { matchedCount: 0 };
                const set = payload.$set ?? {};
                const unset = payload.$unset ?? {};
                Object.assign(found, set);
                for (const u of Object.keys(unset)) delete found[u];
                return { matchedCount: 1 };
            },
        })),
    } as any;

    const fakeUsersService = {
        create: jest.fn(async (_body: any, uid?: string) => ({ uid })),
        update: jest.fn(async (uid?: string, patch?: any) => {
            const found = Array.from(store.values()).find((s: any) => s._id === uid || s.uid === uid);
            if (found && patch) Object.assign(found, patch);
            return found || null;
        }),
    } as any;
    const fakeFamiliesService = {
        create: jest.fn(async (body: any, uid?: string) => ({ _id: `fam-${uid || '1'}` })),
    } as any;
    const fakeMailService = { sendMail: jest.fn(async () => true) } as any;

    beforeEach(() => {
        store.clear();
        jest.clearAllMocks();
        service = new AuthService(fakeModel, fakeUsersService, fakeFamiliesService, fakeMailService);
    });

    it('signs up a new user and triggers email', async () => {
        const email = `u${randomUUID()}@example.test`;
        const res = await service.signUp({ email, password: 'p@ssw0rd', displayName: 'Tester' } as any);
        expect(res).toHaveProperty('uid');
        expect(res).toHaveProperty('emailVerificationToken');
        expect(fakeUsersService.create).toHaveBeenCalled();
        expect(fakeMailService.sendMail).toHaveBeenCalled();
    });

    it('signs in an existing user with password', async () => {
        const email = `u${randomUUID()}@example.test`;
        const uid = `u-${randomUUID()}`;
        const password = 'secret';

        const passwordHash = await argon2.hash(password);
        store.set(uid, { uid, email, passwordHash });

        const out = await service.signIn(email, password);
        expect(out).toHaveProperty('token');
        expect(out).toHaveProperty('refresh');
        expect((fakeModel.updateOne as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    it('requestPasswordReset and resetPassword flow', async () => {
        const email = `u${randomUUID()}@example.test`;
        const uid = `u-${randomUUID()}`;
        store.set(uid, { uid, email });

        const req = (await service.requestPasswordReset(email)) as any;
        expect(req).toHaveProperty('ok');
        expect((fakeModel.updateOne as jest.Mock).mock.calls.length).toBeGreaterThan(0);

        const saved = Array.from(store.values()).find((s: any) => s.email === email);
        expect(saved.passwordResetTokenHash).toBeDefined();

        const resetRes = await service.resetPassword(req.token, 'newpass');
        expect(resetRes).toBe(true);
    });

    it('verifyEmail flow works', async () => {
        const email = `u${randomUUID()}@example.test`;
        const uid = `u-${randomUUID()}`;
        const token = 'tok-123';
        const tokenHash = await argon2.hash(token);
        store.set(uid, {
            uid,
            email,
            emailVerificationTokenHash: tokenHash,
            emailVerificationTokenExpiresAt: new Date(Date.now() + 10000),
        });
        const res = await service.verifyEmail(token);
        expect(res).toBe(true);
    });

    it('2FA generation and disable flow', async () => {
        const email = `u${randomUUID()}@example.test`;
        const uid = `u-${randomUUID()}`;
        store.set(uid, { uid, email });
        const out = await service.generate2faSecret(uid);
        expect(out).toHaveProperty('base32');

        // enabling with invalid token should throw
        await expect(service.enable2fa(uid, 'badtoken')).rejects.toBeTruthy();

        // simulate temp secret and mock verifyTotp to accept
        const rec = Array.from(store.values()).find((r: any) => r.uid === uid);
        rec.totpTempSecret = 'ABCD';
        jest.spyOn(totpUtil, 'verifyTotp').mockImplementation(() => true);
        const ok = await service.enable2fa(uid, 'sometoken');
        expect(ok).toBe(true);

        const disabled = await service.disable2fa(uid);
        expect(disabled).toBe(true);
    });
});

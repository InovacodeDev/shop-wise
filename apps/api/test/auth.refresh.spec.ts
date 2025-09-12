import * as argon2 from 'argon2';
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/require-await,@typescript-eslint/no-unsafe-argument */
import { randomUUID } from 'crypto';

import { AuthService } from '../src/auth/auth.service';

describe('AuthService refresh token flows', () => {
    let service: AuthService;
    const store = new Map<string, any>();

    const fakeModel = {
        findOne: jest.fn((query: Record<string, unknown>) => {
            const key = Object.keys(query)[0];
            const val = (query as any)[key];
            const entry = Array.from(store.values()).find((e: any) => {
                if (key === 'refreshTokenHash') return !!e.refreshTokenHash;
                if (key === '_id') return e._id === val || e.uid === val;
                return e[key] === val;
            });
            return {
                lean: () => ({ exec: async () => (entry ? { ...entry } : null) }),
                exec: async () => (entry ? { ...entry } : null),
            };
        }),
        updateOne: jest.fn((query: Record<string, unknown>, payload: any) => ({
            exec: async () => {
                const key = Object.keys(query)[0];
                const val = (query as any)[key];
                const found = Array.from(store.values()).find((e: any) => e[key] === val);
                if (!found) return { matchedCount: 0 };
                const set = payload.$set ?? {};
                Object.assign(found, set);
                return { matchedCount: 1 };
            },
        })),
    } as any;

    const fakeUsersService = {
        create: jest.fn(async (_b: any, uid?: string) => ({ uid })),
        update: jest.fn(async (uid?: string, patch?: any) => {
            const found = Array.from(store.values()).find((s: any) => s._id === uid || s.uid === uid);
            if (found && patch) Object.assign(found, patch);
            return found || null;
        }),
    } as any;
    const fakeFamiliesService = {
        create: jest.fn(async (body: any, uid?: string) => ({ _id: `fam-${uid || '1'}` })),
    } as any;

    beforeEach(() => {
        store.clear();
        jest.clearAllMocks();
        service = new AuthService(fakeModel, fakeUsersService, fakeFamiliesService);
    });

    it('refreshToken validates and rotates tokens', async () => {
        const uid = `u-${randomUUID()}`;
        const raw = 'refresh-raw';
        const hashed = await argon2.hash(raw);
        store.set(uid, { uid, refreshTokenHash: hashed, email: 'a@b.test' });

        const out = await service.refreshToken(raw);
        expect(out).toHaveProperty('token');
        expect(out).toHaveProperty('refresh');
        expect((fakeModel.updateOne as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    it('createRefreshTokenForUid sets a refresh token for existing uid', async () => {
        const uid = `u-${randomUUID()}`;
        store.set(uid, { uid, email: 'b@b.test' });
        const refresh = await service.createRefreshTokenForUid(uid);
        expect(typeof refresh).toBe('string');
        expect((fakeModel.updateOne as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    it('revokeRefreshToken unsets the stored refresh hash', async () => {
        const uid = `u-${randomUUID()}`;
        store.set(uid, { uid, email: 'c@c.test', refreshTokenHash: 'h' });
        const ok = await service.revokeRefreshToken(uid);
        expect(ok).toBe(true);
        expect((fakeModel.updateOne as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });
});

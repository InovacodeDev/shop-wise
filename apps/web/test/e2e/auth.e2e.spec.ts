import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { describe, it } from 'vitest';

// This E2E test is opt-in. Set RUN_E2E=true to enable it (local dev only).
if (process.env.RUN_E2E !== 'true') {
    // noop test to keep test runner happy
    describe.skip('e2e auth (skipped)', () => {
        it('skipped', () => {});
    });
} else {
    describe('e2e auth', () => {
        const baseURL = process.env.VITE_API_URL || 'http://localhost:9001';
        const jar = new CookieJar();
        const client = wrapper(axios.create({ baseURL, jar, withCredentials: true }));

        it('signup -> signin -> refresh -> revoke', async () => {
            const unique = Date.now();
            const email = `e2e+${unique}@example.com`;
            const password = 'P@ssw0rd!123';

            // Signup
            await client.post('/auth/signup', { email, password });

            // Signin
            const signinResp = await client.post('/auth/signin', { email, password });
            const token = signinResp.data?.token;
            if (!token) throw new Error('No token returned on signin');

            // Use token for a protected endpoint
            const me = await client.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
            if (!me.data?.user?.uid) throw new Error('me endpoint did not return user');

            // Refresh using cookie (server should have set refresh cookie)
            const refreshResp = await client.post('/auth/refresh');
            if (!refreshResp.data?.token) throw new Error('refresh did not return token');

            // Revoke
            await client.post('/auth/revoke', {}, { headers: { Authorization: `Bearer ${refreshResp.data.token}` } });
        });
    });
}

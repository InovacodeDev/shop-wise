import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './use-auth';
import { apiService } from '../services/api';
import * as analytics from '../services/analytics-service';

const TestComponent = () => {
    const { user, profile, loading } = useAuth();
    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="uid">{user?._id ?? 'u123'}</div>
            <div data-testid="email">{profile?.email ?? 'test@example.com'}</div>
        </div>
    );
};

describe('use-auth bootstrap', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('loads user via getMe and getUser', async () => {
        const fakeMe = { uid: 'u123' };
        const fakeUser = { uid: 'u123', email: 'test@example.com', displayName: 'Test' };
        vi.spyOn(apiService, 'getMe').mockResolvedValueOnce({ user: fakeMe } as any);
        vi.spyOn(apiService, 'getUser').mockResolvedValueOnce(fakeUser as any);
        const identifySpy = vi.spyOn(analytics, 'identifyUser');

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByTestId('loading').textContent).toBe('false'));
        expect(getByTestId('uid').textContent).toBe('u123');
        expect(getByTestId('email').textContent).toBe('test@example.com');
        expect(identifySpy).toHaveBeenCalledWith('u123');
    });
});

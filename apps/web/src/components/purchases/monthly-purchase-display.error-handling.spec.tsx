import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MonthlyPurchaseDisplay } from './monthly-purchase-display';
import { useAuth } from '@/hooks/use-auth';
import { getPurchasesByMonth } from '@/services/purchaseApiService';
import { toast } from '@/hooks/use-toast';
import type { MonthlyPurchaseGroup, Purchase } from '@/types/api';

// Mock dependencies
vi.mock('@/hooks/use-auth');
vi.mock('@/services/purchaseApiService');
vi.mock('@/hooks/use-toast');

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
    useLingui: () => ({
        t: (str: any) => {
            if (typeof str === 'string') {
                return str.replace(/`([^`]+)`/g, '$1');
            }
            return String(str);
        },
    }),
    Plural: ({ value, one, other }: any) => (
        <span>{value === 1 ? String(one).replace('#', String(value)) : String(other).replace('#', String(value))}</span>
    ),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children, variant, ...props }: any) => <div data-testid="alert" data-variant={variant} {...props}>{children}</div>,
    AlertDescription: ({ children, ...props }: any) => <div data-testid="alert-description" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, ...props }: any) => (
        <button data-testid="button" onClick={onClick} disabled={disabled} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ ...props }: any) => <div data-testid="skeleton" {...props} />,
}));

vi.mock('@/components/ui/empty-state', () => ({
    EmptyState: ({ title, description, ...props }: any) => (
        <div data-testid="empty-state" {...props}>
            <div data-testid="empty-state-title">{title}</div>
            <div data-testid="empty-state-description">{description}</div>
        </div>
    ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon, className }: any) => (
        <span data-testid="icon" className={className}>
            {icon?.iconName || 'icon'}
        </span>
    ),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetPurchasesByMonth = vi.mocked(getPurchasesByMonth);
const mockToast = vi.mocked(toast);

describe('MonthlyPurchaseDisplay - Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            profile: {
                familyId: 'family-1',
                uid: 'user-1',
                email: 'test@example.com',
            },
        } as any);
    });

    describe('Network Errors', () => {
        it('should display network error message', async () => {
            const networkError = new Error('Network connection failed. Please check your internet connection');
            (networkError as any).isRetryable = true;
            mockGetPurchasesByMonth.mockRejectedValue(networkError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
                expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'destructive');
            });

            expect(screen.getByTestId('alert-description')).toHaveTextContent(
                'No internet connection. Please check your network and try again.'
            );
        });

        it('should show retry button for network errors', async () => {
            const networkError = new Error('Network connection failed');
            (networkError as any).isRetryable = true;
            mockGetPurchasesByMonth.mockRejectedValue(networkError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });

            expect(screen.getByTestId('button')).toHaveTextContent('Retry');
            expect(screen.getByTestId('button')).not.toBeDisabled();
        });
    });

    describe('Authentication Errors', () => {
        it('should display authentication error message for 401', async () => {
            const authError = new Error('Authentication required to access purchase data');
            (authError as any).status = 401;
            mockGetPurchasesByMonth.mockRejectedValue(authError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert-description')).toHaveTextContent(
                    'Please log in again to access your purchase history.'
                );
            });
        });

        it('should display authentication error message for 403', async () => {
            const authError = new Error('Authentication required to access purchase data');
            (authError as any).status = 403;
            mockGetPurchasesByMonth.mockRejectedValue(authError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert-description')).toHaveTextContent(
                    'Please log in again to access your purchase history.'
                );
            });
        });
    });

    describe('Not Found Errors', () => {
        it('should display family not found error message', async () => {
            const notFoundError = new Error('Family not found');
            (notFoundError as any).status = 404;
            mockGetPurchasesByMonth.mockRejectedValue(notFoundError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert-description')).toHaveTextContent(
                    'Family not found. Please check your account settings.'
                );
            });
        });
    });

    describe('Retry Functionality', () => {
        it('should show retry count after failed attempts', async () => {
            const error = new Error('Server error');
            (error as any).isRetryable = true;
            mockGetPurchasesByMonth.mockRejectedValue(error);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });

            // Click retry button
            fireEvent.click(screen.getByTestId('button'));

            await waitFor(() => {
                expect(screen.getByText('Retry attempt: 1')).toBeInTheDocument();
            });
        });

        it('should show retrying state when retry is in progress', async () => {
            const error = new Error('Server error');
            (error as any).isRetryable = true;
            mockGetPurchasesByMonth.mockRejectedValue(error);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });

            // Click retry button
            fireEvent.click(screen.getByTestId('button'));

            // Should show retrying state immediately
            expect(screen.getByTestId('button')).toHaveTextContent('Retrying...');
            expect(screen.getByTestId('button')).toBeDisabled();
        });

        it('should implement exponential backoff for retries', async () => {
            const error = new Error('Server error');
            (error as any).isRetryable = true;
            mockGetPurchasesByMonth.mockRejectedValue(error);

            // Mock setTimeout to track delays
            const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
                fn();
                return 0 as any;
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });

            // First retry (should have no delay)
            fireEvent.click(screen.getByTestId('button'));
            await waitFor(() => {
                expect(screen.getByText('Retry attempt: 1')).toBeInTheDocument();
            });

            // Second retry (should have 1000ms delay)
            fireEvent.click(screen.getByTestId('button'));
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

            setTimeoutSpy.mockRestore();
        });
    });

    describe('Fallback Mode', () => {
        it('should attempt fallback to flat list when monthly grouping fails', async () => {
            const monthlyError = new Error('Monthly grouping failed');
            (monthlyError as any).status = 500;
            mockGetPurchasesByMonth.mockRejectedValue(monthlyError);

            // Mock dynamic import for fallback
            const mockGetPurchases = vi.fn().mockResolvedValue([
                {
                    _id: 'purchase-1',
                    familyId: 'family-1',
                    storeName: 'Test Store',
                    date: '2024-01-15T10:00:00.000Z',
                    totalAmount: 100,
                    items: [],
                } as Purchase,
            ]);

            vi.doMock('@/services/purchaseApiService', async () => ({
                ...(await vi.importActual('@/services/purchaseApiService')),
                getPurchases: mockGetPurchases,
            }));

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(mockToast).toHaveBeenCalledWith({
                    title: 'Fallback Mode Active',
                    description: 'Monthly grouping is temporarily unavailable. Showing all purchases in a single list.',
                    variant: 'default',
                });
            });
        });

        it('should show fallback mode indicator', async () => {
            const monthlyError = new Error('Monthly grouping failed');
            (monthlyError as any).status = 500;
            mockGetPurchasesByMonth.mockRejectedValue(monthlyError);

            // Mock successful fallback
            const mockGetPurchases = vi.fn().mockResolvedValue([
                {
                    _id: 'purchase-1',
                    familyId: 'family-1',
                    storeName: 'Test Store',
                    date: '2024-01-15T10:00:00.000Z',
                    totalAmount: 100,
                    items: [],
                } as Purchase,
            ]);

            vi.doMock('@/services/purchaseApiService', async () => ({
                ...(await vi.importActual('@/services/purchaseApiService')),
                getPurchases: mockGetPurchases,
            }));

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByText('Monthly grouping is temporarily unavailable. Showing all purchases in a single list.')).toBeInTheDocument();
            });
        });

        it('should not attempt fallback for auth errors', async () => {
            const authError = new Error('Authentication required');
            (authError as any).status = 401;
            mockGetPurchasesByMonth.mockRejectedValue(authError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Should not show fallback mode indicator
            expect(screen.queryByText('Monthly grouping is temporarily unavailable')).not.toBeInTheDocument();
        });

        it('should not attempt fallback for network errors', async () => {
            const networkError = new Error('Network connection failed');
            mockGetPurchasesByMonth.mockRejectedValue(networkError);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Should not show fallback mode indicator
            expect(screen.queryByText('Monthly grouping is temporarily unavailable')).not.toBeInTheDocument();
        });
    });

    describe('Error Callbacks', () => {
        it('should call onError callback when error occurs', async () => {
            const onError = vi.fn();
            const error = new Error('Test error');
            mockGetPurchasesByMonth.mockRejectedValue(error);

            render(<MonthlyPurchaseDisplay onError={onError} />);

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error);
            });
        });

        it('should not call onError callback for successful fallback', async () => {
            const onError = vi.fn();
            const monthlyError = new Error('Monthly grouping failed');
            (monthlyError as any).status = 500;
            mockGetPurchasesByMonth.mockRejectedValue(monthlyError);

            // Mock successful fallback
            const mockGetPurchases = vi.fn().mockResolvedValue([]);
            vi.doMock('@/services/purchaseApiService', async () => ({
                ...(await vi.importActual('@/services/purchaseApiService')),
                getPurchases: mockGetPurchases,
            }));

            render(<MonthlyPurchaseDisplay onError={onError} />);

            await waitFor(() => {
                expect(mockToast).toHaveBeenCalled();
            });

            // Should not call onError for successful fallback
            expect(onError).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing familyId gracefully', async () => {
            mockUseAuth.mockReturnValue({
                profile: {
                    uid: 'user-1',
                    email: 'test@example.com',
                    // familyId is missing
                },
            } as any);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            expect(screen.getByTestId('alert-description')).toHaveTextContent(
                'Family ID is required to load purchases.'
            );
        });

        it('should handle concurrent error and success scenarios', async () => {
            let callCount = 0;
            mockGetPurchasesByMonth.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('First call fails'));
                }
                return Promise.resolve([]);
            });

            render(<MonthlyPurchaseDisplay />);

            // First call should show error
            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Retry should succeed
            fireEvent.click(screen.getByTestId('button'));

            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
            });
        });

        it('should handle rapid successive retry clicks', async () => {
            const error = new Error('Server error');
            mockGetPurchasesByMonth.mockRejectedValue(error);

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });

            const retryButton = screen.getByTestId('button');

            // Click multiple times rapidly
            fireEvent.click(retryButton);
            fireEvent.click(retryButton);
            fireEvent.click(retryButton);

            // Should only increment retry count once per actual retry
            await waitFor(() => {
                expect(screen.getByText('Retry attempt: 1')).toBeInTheDocument();
            });
        });
    });
});
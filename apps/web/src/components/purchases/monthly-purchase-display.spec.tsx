import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MonthlyPurchaseDisplay } from './monthly-purchase-display';
import { useAuth } from '@/hooks/use-auth';
import { getPurchasesByMonth } from '@/services/purchaseApiService';
import type { MonthlyPurchaseGroup } from '@/types/api';

// Mock dependencies
vi.mock('@/hooks/use-auth');
vi.mock('@/services/purchaseApiService');
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}));

// Mock Lingui with proper string handling
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

// Mock all UI components
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, ...props }: any) => <div data-testid="accordion" {...props}>{children}</div>,
    AccordionContent: ({ children, ...props }: any) => <div data-testid="accordion-content" {...props}>{children}</div>,
    AccordionItem: ({ children, ...props }: any) => <div data-testid="accordion-item" {...props}>{children}</div>,
    AccordionTrigger: ({ children, ...props }: any) => <button data-testid="accordion-trigger" {...props}>{children}</button>,
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

vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>,
    AlertDescription: ({ children, ...props }: any) => <div data-testid="alert-description" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button data-testid="button" onClick={onClick} {...props}>{children}</button>,
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon }: any) => <span data-testid="icon">{icon?.iconName || 'icon'}</span>,
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetPurchasesByMonth = vi.mocked(getPurchasesByMonth);

describe('MonthlyPurchaseDisplay', () => {
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

    it('should render loading state initially', () => {
        mockGetPurchasesByMonth.mockImplementation(() => new Promise<MonthlyPurchaseGroup[]>(() => {})); // Never resolves

        render(<MonthlyPurchaseDisplay />);

        // Should render skeleton elements when loading
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });

    it('should render empty state when no purchases exist', async () => {
        mockGetPurchasesByMonth.mockResolvedValue([]);

        render(<MonthlyPurchaseDisplay />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });

        expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No Purchases Found');
        expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Start adding purchases to see your monthly spending history here.');
    });

    it('should render error state when API call fails', async () => {
        const errorMessage = 'Failed to fetch monthly purchases: Network error';
        mockGetPurchasesByMonth.mockRejectedValue(new Error(errorMessage));

        render(<MonthlyPurchaseDisplay />);

        await waitFor(() => {
            expect(screen.getByTestId('alert')).toBeInTheDocument();
        });

        expect(screen.getByTestId('alert-description')).toBeInTheDocument();
        expect(screen.getByTestId('button')).toHaveTextContent('Retry');
    });

    it('should use provided familyId prop', async () => {
        mockGetPurchasesByMonth.mockResolvedValue([]);

        render(<MonthlyPurchaseDisplay familyId="custom-family-id" />);

        await waitFor(() => {
            expect(mockGetPurchasesByMonth).toHaveBeenCalledWith('custom-family-id');
        });
    });

    it('should call onDataLoaded callback when data is fetched', async () => {
        const onDataLoaded = vi.fn();
        const mockData: MonthlyPurchaseGroup[] = [];
        mockGetPurchasesByMonth.mockResolvedValue(mockData);

        render(<MonthlyPurchaseDisplay onDataLoaded={onDataLoaded} />);

        await waitFor(() => {
            expect(onDataLoaded).toHaveBeenCalledWith(mockData);
        });
    });

    it('should call onError callback when error occurs', async () => {
        const onError = vi.fn();
        const error = new Error('Test error');
        mockGetPurchasesByMonth.mockRejectedValue(error);

        render(<MonthlyPurchaseDisplay onError={onError} />);

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(error);
        });
    });
});
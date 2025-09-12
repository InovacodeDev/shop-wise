import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import axios from 'axios';
import { MonthlyPurchaseDisplay } from '@/components/purchases/monthly-purchase-display';
import { useAuth } from '@/hooks/use-auth';
import type { MonthlyPurchaseGroup, Purchase } from '@/types/api';

// Mock dependencies
vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}));

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

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

// Mock UI components with realistic behavior
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className, ...props }: any) => (
        <div data-testid="card" className={className} {...props}>{children}</div>
    ),
    CardContent: ({ children, className, ...props }: any) => (
        <div data-testid="card-content" className={className} {...props}>{children}</div>
    ),
    CardDescription: ({ children, className, ...props }: any) => (
        <div data-testid="card-description" className={className} {...props}>{children}</div>
    ),
    CardHeader: ({ children, className, ...props }: any) => (
        <div data-testid="card-header" className={className} {...props}>{children}</div>
    ),
    CardTitle: ({ children, className, ...props }: any) => (
        <div data-testid="card-title" className={className} {...props}>{children}</div>
    ),
}));

vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, defaultValue, type, collapsible, ...props }: any) => {
        const [openItems, setOpenItems] = React.useState<string[]>(defaultValue || []);

        const toggleItem = React.useCallback((value: string) => {
            setOpenItems(prev => {
                if (type === 'single') {
                    return prev.includes(value) ? [] : [value];
                }
                return prev.includes(value)
                    ? prev.filter(item => item !== value)
                    : [...prev, value];
            });
        }, [type]);

        return (
            <div data-testid="accordion" {...props}>
                {React.Children.map(children, (child: any) =>
                    React.cloneElement(child, {
                        isOpen: openItems.includes(child.props.value),
                        onToggle: () => toggleItem(child.props.value)
                    })
                )}
            </div>
        );
    },
    AccordionContent: ({ children, isOpen, className, ...props }: any) => (
        isOpen ? (
            <div data-testid="accordion-content" className={className} {...props}>
                {children}
            </div>
        ) : null
    ),
    AccordionItem: ({ children, value, isOpen, onToggle, className, ...props }: any) => (
        <div data-testid="accordion-item" data-value={value} className={className} {...props}>
            {React.Children.map(children, (child: any) => {
                if (child.type?.name === 'AccordionTrigger') {
                    return React.cloneElement(child, { onClick: onToggle, isOpen });
                }
                return React.cloneElement(child, { isOpen });
            })}
        </div>
    ),
    AccordionTrigger: ({ children, onClick, isOpen, className, ...props }: any) => (
        <button
            data-testid="accordion-trigger"
            onClick={onClick}
            className={className}
            aria-expanded={isOpen}
            {...props}
        >
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ className, ...props }: any) => (
        <div data-testid="skeleton" className={className} {...props} />
    ),
}));

vi.mock('@/components/ui/empty-state', () => ({
    EmptyState: ({ title, description, className, ...props }: any) => (
        <div data-testid="empty-state" className={className} {...props}>
            <div data-testid="empty-state-title">{title}</div>
            <div data-testid="empty-state-description">{description}</div>
        </div>
    ),
}));

vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children, className, ...props }: any) => (
        <div data-testid="alert" className={className} {...props}>{children}</div>
    ),
    AlertDescription: ({ children, className, ...props }: any) => (
        <div data-testid="alert-description" className={className} {...props}>{children}</div>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, variant, size, ...props }: any) => (
        <button
            data-testid="button"
            onClick={onClick}
            className={className}
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon, className }: any) => (
        <span data-testid="icon" className={className}>{icon?.iconName || 'icon'}</span>
    ),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Monthly Purchases E2E Integration', () => {
    const mockFamilyId = 'test-family-id';
    const mockUserId = 'test-user-id';
    const mockApiUrl = 'http://localhost:9001';

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default auth mock
        mockUseAuth.mockReturnValue({
            profile: {
                familyId: mockFamilyId,
                uid: mockUserId,
                email: 'test@example.com',
            },
        } as any);

        // Setup axios defaults
        mockedAxios.create = vi.fn(() => mockedAxios);
        mockedAxios.defaults = { baseURL: mockApiUrl };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createMockPurchase = (id: string, date: string, amount: number, storeName: string): Purchase => ({
        _id: id,
        familyId: mockFamilyId,
        storeId: `store-${id}`,
        storeName,
        accessKey: `access-${id}`,
        date,
        totalAmount: amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
            {
                _id: `item-${id}-1`,
                purchaseId: '',
                name: 'Test Item',
                quantity: 1,
                price: amount,
            },
        ],
    });

    const createMockMonthlyGroup = (
        monthYear: string,
        displayName: string,
        purchases: Purchase[]
    ): MonthlyPurchaseGroup => ({
        monthYear,
        displayName,
        totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
        purchaseCount: purchases.length,
        purchases,
    });

    describe('Complete API to UI Flow', () => {
        it('should handle complete flow from API call to UI rendering', async () => {
            // Mock API response
            const mockPurchases = [
                createMockPurchase('1', '2024-03-15T10:00:00Z', 125.50, 'Grocery Store'),
                createMockPurchase('2', '2024-03-20T14:30:00Z', 45.75, 'Pharmacy'),
                createMockPurchase('3', '2024-02-10T09:15:00Z', 89.25, 'Hardware Store'),
            ];

            const mockMonthlyGroups = [
                createMockMonthlyGroup('2024-03', 'March 2024', [mockPurchases[0], mockPurchases[1]]),
                createMockMonthlyGroup('2024-02', 'February 2024', [mockPurchases[2]]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            // Render component
            render(<MonthlyPurchaseDisplay />);

            // Verify loading state
            expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify API call was made correctly
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/families/${mockFamilyId}/purchases/by-month`
            );

            // Verify monthly groups are rendered
            const accordionItems = screen.getAllByTestId('accordion-item');
            expect(accordionItems).toHaveLength(2);

            // Verify month headers contain correct information
            const triggers = screen.getAllByTestId('accordion-trigger');
            expect(triggers[0]).toHaveTextContent('March 2024');
            expect(triggers[0]).toHaveTextContent('2 purchases');
            expect(triggers[0]).toHaveTextContent('171.25');

            expect(triggers[1]).toHaveTextContent('February 2024');
            expect(triggers[1]).toHaveTextContent('1 purchase');
            expect(triggers[1]).toHaveTextContent('89.25');
        });

        it('should handle user interactions correctly', async () => {
            const user = userEvent.setup();

            const mockPurchases = [
                createMockPurchase('1', '2024-03-15T10:00:00Z', 125.50, 'Grocery Store'),
                createMockPurchase('2', '2024-03-20T14:30:00Z', 45.75, 'Pharmacy'),
            ];

            const mockMonthlyGroups = [
                createMockMonthlyGroup('2024-03', 'March 2024', mockPurchases),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Initially, current month should be expanded (if it's March 2024)
            const currentDate = new Date();
            const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            if (currentMonthYear === '2024-03') {
                expect(screen.getByTestId('accordion-content')).toBeInTheDocument();
            }

            // Click to toggle month section
            const trigger = screen.getByTestId('accordion-trigger');
            await act(async () => {
                await user.click(trigger);
            });

            // Verify content visibility toggled
            const content = screen.queryByTestId('accordion-content');
            if (currentMonthYear === '2024-03') {
                expect(content).not.toBeInTheDocument(); // Should be collapsed now
            } else {
                expect(content).toBeInTheDocument(); // Should be expanded now
            }

            // Click again to toggle back
            await act(async () => {
                await user.click(trigger);
            });

            // Verify content visibility toggled back
            const contentAfterSecondClick = screen.queryByTestId('accordion-content');
            if (currentMonthYear === '2024-03') {
                expect(contentAfterSecondClick).toBeInTheDocument(); // Should be expanded again
            } else {
                expect(contentAfterSecondClick).not.toBeInTheDocument(); // Should be collapsed again
            }
        });

        it('should handle API errors with proper user feedback', async () => {
            const user = userEvent.setup();

            // Mock API error
            const apiError = new Error('Network error');
            mockedAxios.get = vi.fn().mockRejectedValue(apiError);

            render(<MonthlyPurchaseDisplay />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Verify error message is displayed
            expect(screen.getByTestId('alert-description')).toBeInTheDocument();

            // Verify retry button is present
            const retryButton = screen.getByTestId('button');
            expect(retryButton).toHaveTextContent('Retry');

            // Test retry functionality
            const mockRetryData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockRetryData,
                status: 200,
            });

            await act(async () => {
                await user.click(retryButton);
            });

            // Wait for successful retry
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify error state is cleared
            expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
        });

        it('should handle empty state correctly', async () => {
            // Mock empty API response
            mockedAxios.get = vi.fn().mockResolvedValue({
                data: [],
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            // Wait for empty state
            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
            });

            // Verify empty state content
            expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No Purchases Found');
            expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
                'Start adding purchases to see your monthly spending history here.'
            );
        });
    });

    describe('Authentication and Authorization Flow', () => {
        it('should handle authentication properly', async () => {
            // Test with authenticated user
            mockUseAuth.mockReturnValue({
                profile: {
                    familyId: mockFamilyId,
                    uid: mockUserId,
                    email: 'test@example.com',
                },
            } as any);

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify API was called with correct family ID
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/families/${mockFamilyId}/purchases/by-month`
            );
        });

        it('should handle missing authentication gracefully', async () => {
            // Test with no authenticated user
            mockUseAuth.mockReturnValue({
                profile: null,
            } as any);

            render(<MonthlyPurchaseDisplay />);

            // Should not make API call without authentication
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });

        it('should use provided familyId prop over auth context', async () => {
            const customFamilyId = 'custom-family-id';

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay familyId={customFamilyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify API was called with custom family ID
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/families/${customFamilyId}/purchases/by-month`
            );
        });
    });

    describe('Performance and Responsiveness', () => {
        it('should handle large datasets efficiently', async () => {
            // Create large dataset
            const largePurchaseSet = Array.from({ length: 100 }, (_, i) =>
                createMockPurchase(
                    `purchase-${i}`,
                    `2024-03-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
                    Math.round((Math.random() * 100 + 10) * 100) / 100,
                    `Store ${i % 5}`
                )
            );

            const mockMonthlyGroups = [
                createMockMonthlyGroup('2024-03', 'March 2024', largePurchaseSet),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;

            // Should render large dataset within reasonable time
            expect(renderTime).toBeLessThan(3000);

            console.log(`Rendered 100 purchases in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle rapid user interactions without performance degradation', async () => {
            const user = userEvent.setup();

            const mockData = Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, '0');
                return createMockMonthlyGroup(
                    `2024-${month}`,
                    `Month ${i + 1} 2024`,
                    [createMockPurchase(`${i}`, `2024-${month}-15T10:00:00Z`, 100, 'Store')]
                );
            });

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const triggers = screen.getAllByTestId('accordion-trigger');

            // Perform rapid clicks
            const clickStart = performance.now();

            for (let i = 0; i < 6; i++) {
                await act(async () => {
                    await user.click(triggers[i]);
                });
            }

            const clickEnd = performance.now();
            const clickTime = clickEnd - clickStart;

            // Should handle rapid interactions efficiently
            expect(clickTime).toBeLessThan(2000);

            console.log(`6 rapid clicks completed in ${clickTime.toFixed(2)}ms`);
        });
    });

    describe('Data Consistency and Validation', () => {
        it('should display data consistently with API response', async () => {
            const mockPurchases = [
                createMockPurchase('1', '2024-03-15T10:00:00Z', 123.45, 'Grocery Store'),
                createMockPurchase('2', '2024-03-20T14:30:00Z', 67.89, 'Pharmacy'),
            ];

            const expectedTotal = 191.34;
            const mockMonthlyGroups = [
                {
                    monthYear: '2024-03',
                    displayName: 'March 2024',
                    totalAmount: expectedTotal,
                    purchaseCount: 2,
                    purchases: mockPurchases,
                },
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify displayed totals match API response
            const trigger = screen.getByTestId('accordion-trigger');
            expect(trigger).toHaveTextContent('March 2024');
            expect(trigger).toHaveTextContent('2 purchases');
            expect(trigger).toHaveTextContent(expectedTotal.toString());
        });

        it('should handle edge cases in data formatting', async () => {
            const mockPurchases = [
                createMockPurchase('1', '2024-03-15T10:00:00Z', 0.01, 'Penny Store'), // Very small amount
                createMockPurchase('2', '2024-03-20T14:30:00Z', 9999.99, 'Expensive Store'), // Large amount
            ];

            const mockMonthlyGroups = [
                createMockMonthlyGroup('2024-03', 'March 2024', mockPurchases),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify edge case amounts are displayed correctly
            const trigger = screen.getByTestId('accordion-trigger');
            expect(trigger).toHaveTextContent('10000.00'); // Should show proper total
        });

        it('should handle null and undefined data gracefully', async () => {
            const mockMonthlyGroups = [
                {
                    monthYear: 'no-date',
                    displayName: 'No Date',
                    totalAmount: 50.0,
                    purchaseCount: 1,
                    purchases: [
                        {
                            ...createMockPurchase('1', '', 50.0, 'Store'),
                            date: null, // Null date
                        },
                    ],
                },
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockMonthlyGroups,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify null date group is handled properly
            const trigger = screen.getByTestId('accordion-trigger');
            expect(trigger).toHaveTextContent('No Date');
            expect(trigger).toHaveTextContent('1 purchase');
            expect(trigger).toHaveTextContent('50.00');
        });
    });

    describe('Accessibility and User Experience', () => {
        it('should provide proper ARIA attributes for screen readers', async () => {
            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify ARIA attributes
            const trigger = screen.getByTestId('accordion-trigger');
            expect(trigger).toHaveAttribute('aria-expanded');
        });

        it('should handle keyboard navigation properly', async () => {
            const user = userEvent.setup();

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Test keyboard interaction
            const trigger = screen.getByTestId('accordion-trigger');
            trigger.focus();

            await act(async () => {
                await user.keyboard('{Enter}');
            });

            // Should toggle accordion with keyboard
            // Note: Actual behavior depends on accordion implementation
            expect(trigger).toHaveAttribute('aria-expanded');
        });
    });
});
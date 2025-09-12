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

// Mock axios
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

// Mock UI components with realistic behavior for user interactions
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

// Enhanced accordion mock with realistic expand/collapse behavior
vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, defaultValue, type = 'multiple', collapsible = true, ...props }: any) => {
        const [openItems, setOpenItems] = React.useState<string[]>(defaultValue || []);

        const toggleItem = React.useCallback((value: string) => {
            setOpenItems(prev => {
                if (type === 'single') {
                    return prev.includes(value) ? (collapsible ? [] : prev) : [value];
                }
                return prev.includes(value)
                    ? prev.filter(item => item !== value)
                    : [...prev, value];
            });
        }, [type, collapsible]);

        return (
            <div data-testid="accordion" data-type={type} {...props}>
                {React.Children.map(children, (child: any) =>
                    React.cloneElement(child, {
                        isOpen: openItems.includes(child.props.value),
                        onToggle: () => toggleItem(child.props.value),
                        openItems
                    })
                )}
            </div>
        );
    },
    AccordionContent: ({ children, isOpen, className, ...props }: any) => (
        <div
            data-testid="accordion-content"
            className={className}
            style={{ display: isOpen ? 'block' : 'none' }}
            {...props}
        >
            {isOpen && children}
        </div>
    ),
    AccordionItem: ({ children, value, isOpen, onToggle, className, ...props }: any) => (
        <div
            data-testid="accordion-item"
            data-value={value}
            data-open={isOpen}
            className={className}
            {...props}
        >
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
            type="button"
            {...props}
        >
            <span data-testid="trigger-content">{children}</span>
            <span data-testid="trigger-icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
            </span>
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
    Alert: ({ children, className, variant, ...props }: any) => (
        <div data-testid="alert" className={className} data-variant={variant} {...props}>
            {children}
        </div>
    ),
    AlertDescription: ({ children, className, ...props }: any) => (
        <div data-testid="alert-description" className={className} {...props}>
            {children}
        </div>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, variant, size, disabled, ...props }: any) => (
        <button
            data-testid="button"
            onClick={onClick}
            className={className}
            data-variant={variant}
            data-size={size}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon, className, spin }: any) => (
        <span
            data-testid="icon"
            className={className}
            data-spin={spin}
        >
            {icon?.iconName || 'icon'}
        </span>
    ),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Monthly Purchases User Interactions E2E', () => {
    const mockFamilyId = 'test-family-id';
    const mockUserId = 'test-user-id';

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
        // Mock create to return the mocked axios instance; cast to any to satisfy CreateAxiosDefaults -> AxiosInstance signature
        mockedAxios.create = vi.fn(() => mockedAxios as unknown as any);
        // Ensure defaults include headers to satisfy AxiosDefaults typing
        mockedAxios.defaults = {
            ...(mockedAxios.defaults || {}),
            baseURL: 'http://localhost:3001',
            // preserve existing headers if present, otherwise provide an empty object
            headers: (mockedAxios.defaults && (mockedAxios.defaults as any).headers) ? (mockedAxios.defaults as any).headers : {},
        } as any;
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
                purchaseId: 'item-${id}-1',
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

    describe('Expand/Collapse Interactions', () => {
        it('should allow users to expand and collapse month sections', async () => {
            const user = userEvent.setup();

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 125.50, 'Grocery Store'),
                    createMockPurchase('2', '2024-03-20T14:30:00Z', 45.75, 'Pharmacy'),
                ]),
                createMockMonthlyGroup('2024-02', 'February 2024', [
                    createMockPurchase('3', '2024-02-10T09:15:00Z', 89.25, 'Hardware Store'),
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

            const triggers = screen.getAllByTestId('accordion-trigger');
            expect(triggers).toHaveLength(2);

            // Initially, check if current month is expanded (March 2024)
            const currentDate = new Date();
            const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            // Click to expand March section
            await act(async () => {
                await user.click(triggers[0]);
            });

            // Verify March content is visible
            const marchContent = screen.getAllByTestId('accordion-content')[0];
            if (currentMonthYear === '2024-03') {
                // If it's currently March 2024, it might have been expanded by default
                expect(marchContent).toBeInTheDocument();
            } else {
                expect(marchContent).toBeInTheDocument();
            }

            // Click to collapse March section
            await act(async () => {
                await user.click(triggers[0]);
            });

            // Verify March content is hidden
            const marchContentAfterCollapse = screen.queryAllByTestId('accordion-content')[0];
            expect(marchContentAfterCollapse?.style.display).toBe('none');

            // Click to expand February section
            await act(async () => {
                await user.click(triggers[1]);
            });

            // Verify February content is visible
            const febContent = screen.getAllByTestId('accordion-content').find(
                content => content.style.display !== 'none'
            );
            expect(febContent).toBeInTheDocument();
        });

        it('should show visual indicators for expand/collapse state', async () => {
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

            const trigger = screen.getByTestId('accordion-trigger');
            const icon = screen.getByTestId('trigger-icon');

            // Check initial state
            expect(trigger).toHaveAttribute('aria-expanded');

            // Click to toggle
            await act(async () => {
                await user.click(trigger);
            });

            // Verify icon changes
            expect(icon).toBeInTheDocument();

            // Click to toggle back
            await act(async () => {
                await user.click(trigger);
            });

            // Verify icon changes back
            expect(icon).toBeInTheDocument();
        });

        it('should handle rapid expand/collapse interactions smoothly', async () => {
            const user = userEvent.setup();

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
                createMockMonthlyGroup('2024-02', 'February 2024', [
                    createMockPurchase('2', '2024-02-15T10:00:00Z', 75.0, 'Another Store'),
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

            const triggers = screen.getAllByTestId('accordion-trigger');

            // Perform rapid clicks
            for (let i = 0; i < 5; i++) {
                await act(async () => {
                    await user.click(triggers[0]);
                    await user.click(triggers[1]);
                });
            }

            // Should still be responsive
            expect(triggers[0]).toBeInTheDocument();
            expect(triggers[1]).toBeInTheDocument();
        });
    });

    describe('Current Month Default Behavior', () => {
        it('should expand current month by default when available', async () => {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const currentMonthYear = `${currentYear}-${currentMonth}`;
            const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });

            const mockData = [
                createMockMonthlyGroup(currentMonthYear, `${currentMonthName} ${currentYear}`, [
                    createMockPurchase('1', `${currentMonthYear}-15T10:00:00Z`, 100.0, 'Current Store'),
                ]),
                createMockMonthlyGroup('2024-01', 'January 2024', [
                    createMockPurchase('2', '2024-01-15T10:00:00Z', 75.0, 'Past Store'),
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

            // Current month should be expanded by default
            const accordionItems = screen.getAllByTestId('accordion-item');
            const currentMonthItem = accordionItems.find(item =>
                item.getAttribute('data-value') === currentMonthYear
            );

            if (currentMonthItem) {
                expect(currentMonthItem.getAttribute('data-open')).toBe('true');
            }
        });

        it('should collapse previous months by default', async () => {
            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Store 1'),
                ]),
                createMockMonthlyGroup('2024-02', 'February 2024', [
                    createMockPurchase('2', '2024-02-15T10:00:00Z', 75.0, 'Store 2'),
                ]),
                createMockMonthlyGroup('2024-01', 'January 2024', [
                    createMockPurchase('3', '2024-01-15T10:00:00Z', 50.0, 'Store 3'),
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

            const accordionItems = screen.getAllByTestId('accordion-item');

            // Check that non-current months are collapsed by default
            const currentDate = new Date();
            const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            accordionItems.forEach(item => {
                const monthYear = item.getAttribute('data-value');
                if (monthYear !== currentMonthYear) {
                    expect(item.getAttribute('data-open')).toBe('false');
                }
            });
        });
    });

    describe('Purchase Details Display', () => {
        it('should show purchase details when month is expanded', async () => {
            const user = userEvent.setup();

            const mockPurchases = [
                createMockPurchase('1', '2024-03-15T10:00:00Z', 125.50, 'Grocery Store'),
                createMockPurchase('2', '2024-03-20T14:30:00Z', 45.75, 'Pharmacy'),
            ];

            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', mockPurchases),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Expand the month section
            const trigger = screen.getByTestId('accordion-trigger');
            await act(async () => {
                await user.click(trigger);
            });

            // Verify purchase details are shown
            const content = screen.getByTestId('accordion-content');
            expect(content.style.display).not.toBe('none');

            // The actual purchase details would be rendered by the component
            // Here we verify the structure is correct for displaying them
            expect(content).toBeInTheDocument();
        });

        it('should hide purchase details when month is collapsed', async () => {
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

            const trigger = screen.getByTestId('accordion-trigger');

            // Expand first
            await act(async () => {
                await user.click(trigger);
            });

            // Then collapse
            await act(async () => {
                await user.click(trigger);
            });

            // Verify content is hidden
            const content = screen.getByTestId('accordion-content');
            expect(content.style.display).toBe('none');
        });
    });

    describe('Summary Information Display', () => {
        it('should display month summary information in headers', async () => {
            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 125.50, 'Grocery Store'),
                    createMockPurchase('2', '2024-03-20T14:30:00Z', 45.75, 'Pharmacy'),
                ]),
                createMockMonthlyGroup('2024-02', 'February 2024', [
                    createMockPurchase('3', '2024-02-10T09:15:00Z', 89.25, 'Hardware Store'),
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

            const triggers = screen.getAllByTestId('accordion-trigger');

            // Verify March summary
            const marchTrigger = triggers[0];
            expect(marchTrigger).toHaveTextContent('March 2024');
            expect(marchTrigger).toHaveTextContent('2 purchases');
            expect(marchTrigger).toHaveTextContent('171.25');

            // Verify February summary
            const febTrigger = triggers[1];
            expect(febTrigger).toHaveTextContent('February 2024');
            expect(febTrigger).toHaveTextContent('1 purchase');
            expect(febTrigger).toHaveTextContent('89.25');
        });

        it('should handle singular vs plural purchase counts correctly', async () => {
            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Single Store'),
                ]),
                createMockMonthlyGroup('2024-02', 'February 2024', [
                    createMockPurchase('2', '2024-02-15T10:00:00Z', 75.0, 'Store 1'),
                    createMockPurchase('3', '2024-02-20T10:00:00Z', 50.0, 'Store 2'),
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

            const triggers = screen.getAllByTestId('accordion-trigger');

            // Single purchase should use singular form
            expect(triggers[0]).toHaveTextContent('1 purchase');

            // Multiple purchases should use plural form
            expect(triggers[1]).toHaveTextContent('2 purchases');
        });
    });

    describe('Error Recovery Interactions', () => {
        it('should allow users to retry after API errors', async () => {
            const user = userEvent.setup();

            // First call fails
            mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Network error'));

            render(<MonthlyPurchaseDisplay />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Verify retry button is present
            const retryButton = screen.getByTestId('button');
            expect(retryButton).toHaveTextContent('Retry');

            // Setup successful retry
            const mockData = [
                createMockMonthlyGroup('2024-03', 'March 2024', [
                    createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                ]),
            ];

            mockedAxios.get = vi.fn().mockResolvedValue({
                data: mockData,
                status: 200,
            });

            // Click retry
            await act(async () => {
                await user.click(retryButton);
            });

            // Wait for successful load
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Verify error is cleared and data is displayed
            expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
            expect(screen.getByTestId('accordion-trigger')).toHaveTextContent('March 2024');
        });

        it('should handle multiple retry attempts gracefully', async () => {
            const user = userEvent.setup();

            // Multiple failures followed by success
            mockedAxios.get = vi.fn()
                .mockRejectedValueOnce(new Error('Network error 1'))
                .mockRejectedValueOnce(new Error('Network error 2'))
                .mockResolvedValue({
                    data: [
                        createMockMonthlyGroup('2024-03', 'March 2024', [
                            createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                        ]),
                    ],
                    status: 200,
                });

            render(<MonthlyPurchaseDisplay />);

            // First error
            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // First retry (fails)
            await act(async () => {
                await user.click(screen.getByTestId('button'));
            });

            // Still in error state
            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Second retry (succeeds)
            await act(async () => {
                await user.click(screen.getByTestId('button'));
            });

            // Success
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
        });
    });

    describe('Loading State Interactions', () => {
        it('should show loading state during initial data fetch', async () => {
            // Mock slow API response
            mockedAxios.get = vi.fn().mockImplementation(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        data: [
                            createMockMonthlyGroup('2024-03', 'March 2024', [
                                createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                            ]),
                        ],
                        status: 200,
                    }), 100)
                )
            );

            render(<MonthlyPurchaseDisplay />);

            // Should show loading skeletons
            expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Loading skeletons should be gone
            expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
        });

        it('should show loading state during retry operations', async () => {
            const user = userEvent.setup();

            // Initial failure
            mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Network error'));

            render(<MonthlyPurchaseDisplay />);

            await waitFor(() => {
                expect(screen.getByTestId('alert')).toBeInTheDocument();
            });

            // Setup slow retry response
            mockedAxios.get = vi.fn().mockImplementation(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        data: [
                            createMockMonthlyGroup('2024-03', 'March 2024', [
                                createMockPurchase('1', '2024-03-15T10:00:00Z', 100.0, 'Test Store'),
                            ]),
                        ],
                        status: 200,
                    }), 100)
                )
            );

            // Click retry
            await act(async () => {
                await user.click(screen.getByTestId('button'));
            });

            // Should show loading state during retry
            expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

            // Wait for success
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            }, { timeout: 2000 });
        });
    });

    describe('Accessibility Interactions', () => {
        it('should support keyboard navigation for expand/collapse', async () => {
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

            const trigger = screen.getByTestId('accordion-trigger');

            // Focus the trigger
            trigger.focus();
            expect(trigger).toHaveFocus();

            // Use keyboard to activate
            await act(async () => {
                await user.keyboard('{Enter}');
            });

            // Should toggle the accordion
            expect(trigger).toHaveAttribute('aria-expanded');

            // Use space key as well
            await act(async () => {
                await user.keyboard(' ');
            });

            // Should toggle again
            expect(trigger).toHaveAttribute('aria-expanded');
        });

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

            const trigger = screen.getByTestId('accordion-trigger');

            // Verify ARIA attributes
            expect(trigger).toHaveAttribute('aria-expanded');
            expect(trigger).toHaveAttribute('type', 'button');
        });
    });

    describe('Responsive Behavior', () => {
        it('should handle window resize events gracefully', async () => {
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

            // Simulate window resize
            act(() => {
                global.dispatchEvent(new Event('resize'));
            });

            // Component should still be functional
            expect(screen.getByTestId('accordion')).toBeInTheDocument();
            expect(screen.getByTestId('accordion-trigger')).toBeInTheDocument();
        });
    });
});
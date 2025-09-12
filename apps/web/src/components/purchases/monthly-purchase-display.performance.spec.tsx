import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MonthlyPurchaseDisplay } from './monthly-purchase-display';
import { useAuth } from '@/hooks/use-auth';
import { getPurchasesByMonth } from '@/services/purchaseApiService';
import type { MonthlyPurchaseGroup, Purchase } from '@/types/api';

// Mock dependencies
vi.mock('@/hooks/use-auth');
vi.mock('@/services/purchaseApiService');
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}));

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

// Mock UI components with performance tracking
const createMockComponent = (name: string) => {
    return ({ children, ...props }: any) => {
        const renderStart = performance.now();
        React.useEffect(() => {
            const renderEnd = performance.now();
            if (renderEnd - renderStart > 100) {
                console.warn(`${name} took ${renderEnd - renderStart}ms to render`);
            }
        });
        return <div data-testid={name.toLowerCase()} {...props}>{children}</div>;
    };
};

vi.mock('@/components/ui/card', () => ({
    Card: createMockComponent('Card'),
    CardContent: createMockComponent('CardContent'),
    CardDescription: createMockComponent('CardDescription'),
    CardHeader: createMockComponent('CardHeader'),
    CardTitle: createMockComponent('CardTitle'),
}));

vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, defaultValue, ...props }: any) => {
        const [openItems, setOpenItems] = React.useState<string[]>(defaultValue || []);
        
        const toggleItem = (value: string) => {
            setOpenItems(prev => 
                prev.includes(value) 
                    ? prev.filter(item => item !== value)
                    : [...prev, value]
            );
        };
        
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
    AccordionContent: ({ children, isOpen, ...props }: any) => (
        isOpen ? <div data-testid="accordion-content" {...props}>{children}</div> : null
    ),
    AccordionItem: ({ children, value, isOpen, onToggle, ...props }: any) => (
        <div data-testid="accordion-item" data-value={value} {...props}>
            {React.Children.map(children, (child: any) => 
                child.type.name === 'AccordionTrigger' 
                    ? React.cloneElement(child, { onClick: onToggle })
                    : React.cloneElement(child, { isOpen })
            )}
        </div>
    ),
    AccordionTrigger: ({ children, onClick, ...props }: any) => (
        <button data-testid="accordion-trigger" onClick={onClick} {...props}>{children}</button>
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

vi.mock('@/components/ui/alert', () => ({
    Alert: createMockComponent('Alert'),
    AlertDescription: createMockComponent('AlertDescription'),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button data-testid="button" onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon }: any) => <span data-testid="icon">{icon?.iconName || 'icon'}</span>,
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetPurchasesByMonth = vi.mocked(getPurchasesByMonth);

describe('MonthlyPurchaseDisplay Performance Tests', () => {
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

    const generateMockPurchases = (count: number): Purchase[] => {
        return Array.from({ length: count }, (_, i) => ({
            _id: `purchase-${i}`,
            familyId: 'family-1',
            purchasedBy: 'user-1',
            storeId: `store-${i % 5}`,
            storeName: `Store ${i % 5}`,
            accessKey: `access-${i}`,
            date: new Date(2024, 0, (i % 30) + 1), // Spread across January 2024
            totalAmount: Math.round((Math.random() * 100 + 10) * 100) / 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [],
        }));
    };

    const generateMockMonthlyGroups = (monthCount: number, purchasesPerMonth: number): MonthlyPurchaseGroup[] => {
        return Array.from({ length: monthCount }, (_, monthIndex) => {
            const year = 2024 - Math.floor(monthIndex / 12);
            const month = 12 - (monthIndex % 12);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const purchases = generateMockPurchases(purchasesPerMonth);
            const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
            
            return {
                monthYear: monthKey,
                displayName: `${monthNames[month - 1]} ${year}`,
                totalAmount: Math.round(totalAmount * 100) / 100,
                purchaseCount: purchasesPerMonth,
                purchases,
            };
        });
    };

    describe('Large Dataset Rendering Performance', () => {
        it('should render 12 months with 100 purchases each efficiently', async () => {
            const mockData = generateMockMonthlyGroups(12, 100);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(12);
            
            console.log(`Rendered 12 months with 1,200 total purchases in ${renderTime.toFixed(2)}ms`);
        });

        it('should render 24 months with 50 purchases each efficiently', async () => {
            const mockData = generateMockMonthlyGroups(24, 50);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(24);
            
            console.log(`Rendered 24 months with 1,200 total purchases in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle 60 months with 20 purchases each', async () => {
            const mockData = generateMockMonthlyGroups(60, 20);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(60);
            
            console.log(`Rendered 60 months with 1,200 total purchases in ${renderTime.toFixed(2)}ms`);
        });
    });

    describe('Expand/Collapse Performance', () => {
        it('should handle rapid expand/collapse operations efficiently', async () => {
            const mockData = generateMockMonthlyGroups(12, 50);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const triggers = screen.getAllByTestId('accordion-trigger');
            expect(triggers).toHaveLength(12);

            // Measure time for rapid expand/collapse operations
            const operationStart = performance.now();
            
            // Expand all months
            for (const trigger of triggers) {
                await act(async () => {
                    await user.click(trigger);
                });
            }
            
            // Collapse all months
            for (const trigger of triggers) {
                await act(async () => {
                    await user.click(trigger);
                });
            }
            
            const operationEnd = performance.now();
            const operationTime = operationEnd - operationStart;
            
            expect(operationTime).toBeLessThan(3000); // Should complete within 3 seconds
            
            console.log(`Completed 24 expand/collapse operations in ${operationTime.toFixed(2)}ms`);
        });

        it('should maintain performance with large purchase lists when expanding', async () => {
            const mockData = generateMockMonthlyGroups(6, 200); // 6 months with 200 purchases each
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const firstTrigger = screen.getAllByTestId('accordion-trigger')[0];
            
            // Measure time to expand a month with 200 purchases
            const expandStart = performance.now();
            
            await act(async () => {
                await user.click(firstTrigger);
            });
            
            const expandEnd = performance.now();
            const expandTime = expandEnd - expandStart;
            
            expect(expandTime).toBeLessThan(1000); // Should expand within 1 second
            
            console.log(`Expanded month with 200 purchases in ${expandTime.toFixed(2)}ms`);
        });
    });

    describe('Memory Management', () => {
        it('should not cause memory leaks with frequent re-renders', async () => {
            const mockData = generateMockMonthlyGroups(12, 50);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const { rerender, unmount } = render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Force multiple re-renders
            for (let i = 0; i < 10; i++) {
                rerender(<MonthlyPurchaseDisplay key={i} />);
                await waitFor(() => {
                    expect(screen.getByTestId('accordion')).toBeInTheDocument();
                });
            }

            // Clean unmount should not throw errors
            expect(() => unmount()).not.toThrow();
        });

        it('should handle component unmounting during data loading', async () => {
            // Create a promise that never resolves to simulate slow loading
            const neverResolvingPromise = new Promise<MonthlyPurchaseGroup[]>(() => {});
            mockGetPurchasesByMonth.mockReturnValue(neverResolvingPromise);

            const { unmount } = render(<MonthlyPurchaseDisplay />);
            
            // Unmount while still loading
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Data Processing Performance', () => {
        it('should efficiently calculate summary statistics for large datasets', async () => {
            const mockData = generateMockMonthlyGroups(36, 100); // 3 years of data
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const processingStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const processingEnd = performance.now();
            const processingTime = processingEnd - processingStart;
            
            expect(processingTime).toBeLessThan(2000); // Should process within 2 seconds
            
            // Verify summary calculations are present
            expect(screen.getByText(/Purchase History Summary/)).toBeInTheDocument();
            
            console.log(`Processed summary for 36 months with 3,600 purchases in ${processingTime.toFixed(2)}ms`);
        });

        it('should handle edge cases in data processing efficiently', async () => {
            const mockData: MonthlyPurchaseGroup[] = [
                // Month with many small purchases
                {
                    monthYear: '2024-01',
                    displayName: 'January 2024',
                    totalAmount: 1000.00,
                    purchaseCount: 1000,
                    purchases: generateMockPurchases(1000),
                },
                // Month with few large purchases
                {
                    monthYear: '2024-02',
                    displayName: 'February 2024',
                    totalAmount: 1000.00,
                    purchaseCount: 5,
                    purchases: Array.from({ length: 5 }, (_, i) => ({
                        _id: `large-purchase-${i}`,
                        familyId: 'family-1',
                        purchasedBy: 'user-1',
                        storeId: 'store-1',
                        storeName: 'Store 1',
                        accessKey: `access-${i}`,
                        date: new Date(2024, 1, i + 1),
                        totalAmount: 200.00,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        items: [],
                    })),
                },
                // Empty month (edge case)
                {
                    monthYear: '2024-03',
                    displayName: 'March 2024',
                    totalAmount: 0,
                    purchaseCount: 0,
                    purchases: [],
                },
            ];
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const processingStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const processingEnd = performance.now();
            const processingTime = processingEnd - processingStart;
            
            expect(processingTime).toBeLessThan(1500); // Should handle edge cases quickly
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(3);
            
            console.log(`Processed edge cases in ${processingTime.toFixed(2)}ms`);
        });
    });
});
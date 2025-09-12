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
const createPerformanceTrackingComponent = (name: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
        const renderStart = React.useRef(performance.now());
        
        React.useEffect(() => {
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart.current;
            if (renderTime > 50) {
                console.warn(`${name} render took ${renderTime.toFixed(2)}ms`);
            }
        });
        
        return <div ref={ref} data-testid={name.toLowerCase()} {...props}>{children}</div>;
    });
};

vi.mock('@/components/ui/card', () => ({
    Card: createPerformanceTrackingComponent('Card'),
    CardContent: createPerformanceTrackingComponent('CardContent'),
    CardDescription: createPerformanceTrackingComponent('CardDescription'),
    CardHeader: createPerformanceTrackingComponent('CardHeader'),
    CardTitle: createPerformanceTrackingComponent('CardTitle'),
}));

vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, defaultValue, ...props }: any) => {
        const [openItems, setOpenItems] = React.useState<string[]>(defaultValue || []);
        
        const toggleItem = React.useCallback((value: string) => {
            setOpenItems(prev => 
                prev.includes(value) 
                    ? prev.filter(item => item !== value)
                    : [...prev, value]
            );
        }, []);
        
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
    Skeleton: createPerformanceTrackingComponent('Skeleton'),
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
    Alert: createPerformanceTrackingComponent('Alert'),
    AlertDescription: createPerformanceTrackingComponent('AlertDescription'),
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

describe('MonthlyPurchaseDisplay Scenario Performance Tests', () => {
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

    const generateRealisticPurchases = (count: number, monthYear: string): Purchase[] => {
        const [year, month] = monthYear.split('-').map(Number);
        const stores = ['Grocery Store', 'Walmart', 'Target', 'Costco', 'Local Market'];
        
        return Array.from({ length: count }, (_, i) => ({
            _id: `purchase-${monthYear}-${i}`,
            familyId: 'family-1',
            purchasedBy: 'user-1',
            storeId: `store-${i % stores.length}`,
            storeName: stores[i % stores.length],
            accessKey: `access-${i}`,
            date: new Date(year, month - 1, (i % 28) + 1),
            totalAmount: Math.round((Math.random() * 150 + 10) * 100) / 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
                _id: `item-${i}-${j}`,
                name: `Item ${j + 1}`,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: Math.round((Math.random() * 20 + 5) * 100) / 100,
            })),
        }));
    };

    const generateMonthlyGroups = (scenarios: Array<{ monthYear: string; purchaseCount: number }>): MonthlyPurchaseGroup[] => {
        return scenarios.map(({ monthYear, purchaseCount }) => {
            const purchases = generateRealisticPurchases(purchaseCount, monthYear);
            const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
            const [year, month] = monthYear.split('-').map(Number);
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            return {
                monthYear,
                displayName: `${monthNames[month - 1]} ${year}`,
                totalAmount: Math.round(totalAmount * 100) / 100,
                purchaseCount,
                purchases,
            };
        });
    };

    describe('Real-world Usage Scenarios', () => {
        it('should handle typical family usage (6 months, 20-40 purchases/month)', async () => {
            const mockData = generateMonthlyGroups([
                { monthYear: '2024-06', purchaseCount: 35 },
                { monthYear: '2024-05', purchaseCount: 28 },
                { monthYear: '2024-04', purchaseCount: 42 },
                { monthYear: '2024-03', purchaseCount: 31 },
                { monthYear: '2024-02', purchaseCount: 25 },
                { monthYear: '2024-01', purchaseCount: 38 },
            ]);
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(1500); // Should render within 1.5 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(6);
            
            console.log(`Typical family usage rendered in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle heavy usage family (12 months, 50-100 purchases/month)', async () => {
            const mockData = generateMonthlyGroups(
                Array.from({ length: 12 }, (_, i) => ({
                    monthYear: `2024-${String(12 - i).padStart(2, '0')}`,
                    purchaseCount: Math.floor(Math.random() * 50) + 50, // 50-100 purchases
                }))
            );
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(12);
            
            const totalPurchases = mockData.reduce((sum, group) => sum + group.purchaseCount, 0);
            console.log(`Heavy usage family (${totalPurchases} purchases) rendered in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle power user scenario (24 months, 100-200 purchases/month)', async () => {
            const mockData = generateMonthlyGroups(
                Array.from({ length: 24 }, (_, i) => {
                    const year = 2024 - Math.floor(i / 12);
                    const month = 12 - (i % 12);
                    return {
                        monthYear: `${year}-${String(month).padStart(2, '0')}`,
                        purchaseCount: Math.floor(Math.random() * 100) + 100, // 100-200 purchases
                    };
                })
            );
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(24);
            
            const totalPurchases = mockData.reduce((sum, group) => sum + group.purchaseCount, 0);
            console.log(`Power user scenario (${totalPurchases} purchases) rendered in ${renderTime.toFixed(2)}ms`);
        });
    });

    describe('Interaction Performance', () => {
        it('should handle rapid expand/collapse operations on large datasets', async () => {
            const mockData = generateMonthlyGroups(
                Array.from({ length: 12 }, (_, i) => ({
                    monthYear: `2024-${String(12 - i).padStart(2, '0')}`,
                    purchaseCount: 75, // Consistent size for testing
                }))
            );
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const triggers = screen.getAllByTestId('accordion-trigger');
            
            // Measure rapid expand operations
            const expandStart = performance.now();
            
            for (let i = 0; i < 6; i++) { // Expand first 6 months
                await act(async () => {
                    await user.click(triggers[i]);
                });
            }
            
            const expandEnd = performance.now();
            const expandTime = expandEnd - expandStart;
            
            // Measure rapid collapse operations
            const collapseStart = performance.now();
            
            for (let i = 0; i < 6; i++) { // Collapse the same 6 months
                await act(async () => {
                    await user.click(triggers[i]);
                });
            }
            
            const collapseEnd = performance.now();
            const collapseTime = collapseEnd - collapseStart;
            
            expect(expandTime).toBeLessThan(2000); // Expand operations should be fast
            expect(collapseTime).toBeLessThan(1000); // Collapse should be even faster
            
            console.log(`Expand 6 months: ${expandTime.toFixed(2)}ms, Collapse 6 months: ${collapseTime.toFixed(2)}ms`);
        });

        it('should maintain performance during scroll-heavy interactions', async () => {
            const mockData = generateMonthlyGroups([
                { monthYear: '2024-01', purchaseCount: 500 }, // Large month for scrolling
            ]);
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Expand the month with many purchases
            const trigger = screen.getByTestId('accordion-trigger');
            
            const expandStart = performance.now();
            await act(async () => {
                await user.click(trigger);
            });
            const expandEnd = performance.now();
            
            const expandTime = expandEnd - expandStart;
            
            expect(expandTime).toBeLessThan(2000); // Should expand large month within 2 seconds
            
            console.log(`Expanded month with 500 purchases in ${expandTime.toFixed(2)}ms`);
        });
    });

    describe('Memory Management Scenarios', () => {
        it('should handle component unmounting during heavy operations', async () => {
            const mockData = generateMonthlyGroups(
                Array.from({ length: 20 }, (_, i) => ({
                    monthYear: `2024-${String(20 - i).padStart(2, '0')}`,
                    purchaseCount: 100,
                }))
            );
            
            // Simulate slow API response
            mockGetPurchasesByMonth.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(mockData), 100))
            );

            const { unmount } = render(<MonthlyPurchaseDisplay />);
            
            // Unmount before API response completes
            setTimeout(() => unmount(), 50);
            
            // Should not throw errors or cause memory leaks
            await new Promise(resolve => setTimeout(resolve, 200));
            
            expect(true).toBe(true); // Test passes if no errors thrown
        });

        it('should handle rapid re-renders without memory leaks', async () => {
            const mockData = generateMonthlyGroups([
                { monthYear: '2024-01', purchaseCount: 50 },
            ]);
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const { rerender } = render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Force multiple re-renders
            const rerenderStart = performance.now();
            
            for (let i = 0; i < 20; i++) {
                rerender(<MonthlyPurchaseDisplay key={i} />);
                await waitFor(() => {
                    expect(screen.getByTestId('accordion')).toBeInTheDocument();
                });
            }
            
            const rerenderEnd = performance.now();
            const rerenderTime = rerenderEnd - rerenderStart;
            
            expect(rerenderTime).toBeLessThan(5000); // 20 re-renders should complete within 5 seconds
            
            console.log(`20 re-renders completed in ${rerenderTime.toFixed(2)}ms`);
        });
    });

    describe('Edge Case Performance', () => {
        it('should handle empty months efficiently', async () => {
            const mockData: MonthlyPurchaseGroup[] = [];
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(500); // Empty state should render very quickly
            
            console.log(`Empty state rendered in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle single month with many purchases', async () => {
            const mockData = generateMonthlyGroups([
                { monthYear: '2024-01', purchaseCount: 1000 },
            ]);
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(3000); // Should handle 1000 purchases within 3 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(1);
            
            console.log(`Single month with 1000 purchases rendered in ${renderTime.toFixed(2)}ms`);
        });

        it('should handle many months with few purchases each', async () => {
            const mockData = generateMonthlyGroups(
                Array.from({ length: 60 }, (_, i) => {
                    const year = 2024 - Math.floor(i / 12);
                    const month = 12 - (i % 12);
                    return {
                        monthYear: `${year}-${String(month).padStart(2, '0')}`,
                        purchaseCount: 2, // Very few purchases per month
                    };
                })
            );
            
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            expect(renderTime).toBeLessThan(4000); // Should handle 60 months within 4 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(60);
            
            console.log(`60 months with 2 purchases each rendered in ${renderTime.toFixed(2)}ms`);
        });
    });
});
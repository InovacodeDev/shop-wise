import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Performance monitoring utilities
class PerformanceMonitor {
    private renderTimes: number[] = [];
    private memorySnapshots: number[] = [];
    
    startRender(): number {
        return performance.now();
    }
    
    endRender(startTime: number): number {
        const renderTime = performance.now() - startTime;
        this.renderTimes.push(renderTime);
        return renderTime;
    }
    
    takeMemorySnapshot(): void {
        if (performance.memory) {
            this.memorySnapshots.push(performance.memory.usedJSHeapSize);
        }
    }
    
    getAverageRenderTime(): number {
        return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    }
    
    getMemoryGrowth(): number {
        if (this.memorySnapshots.length < 2) return 0;
        return this.memorySnapshots[this.memorySnapshots.length - 1] - this.memorySnapshots[0];
    }
    
    reset(): void {
        this.renderTimes = [];
        this.memorySnapshots = [];
    }
}

// Mock UI components with performance tracking
vi.mock('@/components/ui/card', () => {
    const createPerformantMockComponent = (name: string) => {
        return ({ children, ...props }: any) => {
            const renderStart = React.useRef(performance.now());
            
            React.useEffect(() => {
                const renderEnd = performance.now();
                const renderTime = renderEnd - renderStart.current;
                
                if (renderTime > 50) {
                    console.warn(`${name} slow render: ${renderTime.toFixed(2)}ms`);
                }
            });
            
            return <div data-testid={name.toLowerCase()} {...props}>{children}</div>;
        };
    };

    return {
        Card: createPerformantMockComponent('Card'),
        CardContent: createPerformantMockComponent('CardContent'),
        CardDescription: createPerformantMockComponent('CardDescription'),
        CardHeader: createPerformantMockComponent('CardHeader'),
        CardTitle: createPerformantMockComponent('CardTitle'),
    };
});

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
    AccordionContent: React.memo(({ children, isOpen, ...props }: any) => (
        isOpen ? <div data-testid="accordion-content" {...props}>{children}</div> : null
    )),
    AccordionItem: React.memo(({ children, value, isOpen, onToggle, ...props }: any) => (
        <div data-testid="accordion-item" data-value={value} {...props}>
            {React.Children.map(children, (child: any) => 
                child.type.name === 'AccordionTrigger' 
                    ? React.cloneElement(child, { onClick: onToggle })
                    : React.cloneElement(child, { isOpen })
            )}
        </div>
    )),
    AccordionTrigger: React.memo(({ children, onClick, ...props }: any) => (
        <button data-testid="accordion-trigger" onClick={onClick} {...props}>{children}</button>
    )),
}));

vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: React.memo(({ ...props }: any) => <div data-testid="skeleton" {...props} />),
}));

vi.mock('@/components/ui/empty-state', () => ({
    EmptyState: React.memo(({ title, description, ...props }: any) => (
        <div data-testid="empty-state" {...props}>
            <div data-testid="empty-state-title">{title}</div>
            <div data-testid="empty-state-description">{description}</div>
        </div>
    )),
}));

vi.mock('@/components/ui/alert', () => ({
    Alert: createPerformantMockComponent('Alert'),
    AlertDescription: createPerformantMockComponent('AlertDescription'),
}));

vi.mock('@/components/ui/button', () => ({
    Button: React.memo(({ children, onClick, ...props }: any) => (
        <button data-testid="button" onClick={onClick} {...props}>{children}</button>
    )),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: React.memo(({ icon }: any) => <span data-testid="icon">{icon?.iconName || 'icon'}</span>),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetPurchasesByMonth = vi.mocked(getPurchasesByMonth);

describe('MonthlyPurchaseDisplay Advanced Performance Tests', () => {
    let performanceMonitor: PerformanceMonitor;

    beforeEach(() => {
        vi.clearAllMocks();
        performanceMonitor = new PerformanceMonitor();
        
        mockUseAuth.mockReturnValue({
            profile: {
                familyId: 'family-1',
                uid: 'user-1',
                email: 'test@example.com',
            },
        } as any);
    });

    afterEach(() => {
        performanceMonitor.reset();
    });

    const generateOptimizedPurchases = (count: number, baseDate: Date = new Date()): Purchase[] => {
        return Array.from({ length: count }, (_, i) => {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() - i);
            
            return {
                _id: `purchase-${i}`,
                familyId: 'family-1',
                purchasedBy: 'user-1',
                storeId: `store-${i % 10}`,
                storeName: `Store ${i % 10}`,
                accessKey: `access-${i}`,
                date,
                totalAmount: Math.round((Math.random() * 100 + 10) * 100) / 100,
                createdAt: new Date(),
                updatedAt: new Date(),
                items: [],
            };
        });
    };

    const generateScalableMonthlyGroups = (monthCount: number, purchasesPerMonth: number): MonthlyPurchaseGroup[] => {
        return Array.from({ length: monthCount }, (_, monthIndex) => {
            const year = 2024 - Math.floor(monthIndex / 12);
            const month = 12 - (monthIndex % 12);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const baseDate = new Date(year, month - 1, 15);
            const purchases = generateOptimizedPurchases(purchasesPerMonth, baseDate);
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

    describe('Extreme Scale Performance Tests', () => {
        it('should handle 120 months (10 years) with 100 purchases each efficiently', async () => {
            const mockData = generateScalableMonthlyGroups(120, 100); // 12,000 total purchases
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            performanceMonitor.takeMemorySnapshot();
            const renderStart = performanceMonitor.startRender();
            
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderTime = performanceMonitor.endRender(renderStart);
            performanceMonitor.takeMemorySnapshot();

            expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(120);
            
            const memoryGrowth = performanceMonitor.getMemoryGrowth();
            expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth

            console.log(`120 months with 12,000 purchases rendered in ${renderTime.toFixed(2)}ms`);
            console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
        });

        it('should maintain performance with 200 months and varying purchase counts', async () => {
            // Create realistic data with varying purchase counts per month
            const mockData: MonthlyPurchaseGroup[] = [];
            
            for (let i = 0; i < 200; i++) {
                const year = 2024 - Math.floor(i / 12);
                const month = 12 - (i % 12);
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                
                // Vary purchase count: some months have many, others few
                const purchaseCount = i % 10 === 0 ? 200 : Math.floor(Math.random() * 50) + 10;
                const purchases = generateOptimizedPurchases(purchaseCount);
                const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
                
                mockData.push({
                    monthYear: monthKey,
                    displayName: `Month ${i + 1}`,
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    purchaseCount,
                    purchases,
                });
            }

            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const renderStart = performanceMonitor.startRender();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            
            const renderTime = performanceMonitor.endRender(renderStart);

            expect(renderTime).toBeLessThan(8000); // Should render within 8 seconds
            expect(screen.getAllByTestId('accordion-item')).toHaveLength(200);

            console.log(`200 months with varying purchase counts rendered in ${renderTime.toFixed(2)}ms`);
        });
    });

    describe('Memory Management and Optimization', () => {
        it('should efficiently manage memory during rapid expand/collapse operations', async () => {
            const mockData = generateScalableMonthlyGroups(50, 100);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const triggers = screen.getAllByTestId('accordion-trigger');
            
            performanceMonitor.takeMemorySnapshot();
            
            // Perform 100 rapid expand/collapse operations
            for (let cycle = 0; cycle < 5; cycle++) {
                // Expand all
                for (const trigger of triggers) {
                    await act(async () => {
                        await user.click(trigger);
                    });
                }
                
                // Collapse all
                for (const trigger of triggers) {
                    await act(async () => {
                        await user.click(trigger);
                    });
                }
                
                performanceMonitor.takeMemorySnapshot();
            }

            const memoryGrowth = performanceMonitor.getMemoryGrowth();
            
            // Memory should not grow significantly during operations
            expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth

            console.log(`Memory growth after 500 expand/collapse operations: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
        });

        it('should handle component re-renders without memory leaks', async () => {
            const mockData = generateScalableMonthlyGroups(30, 50);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            performanceMonitor.takeMemorySnapshot();

            const { rerender, unmount } = render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Force 20 re-renders with different keys
            for (let i = 0; i < 20; i++) {
                rerender(<MonthlyPurchaseDisplay key={i} />);
                await waitFor(() => {
                    expect(screen.getByTestId('accordion')).toBeInTheDocument();
                });
                
                if (i % 5 === 0) {
                    performanceMonitor.takeMemorySnapshot();
                }
            }

            const memoryGrowth = performanceMonitor.getMemoryGrowth();
            
            // Clean unmount
            expect(() => unmount()).not.toThrow();

            // Memory growth should be minimal
            expect(memoryGrowth).toBeLessThan(30 * 1024 * 1024); // Less than 30MB growth

            console.log(`Memory growth after 20 re-renders: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
        });

        it('should optimize rendering with memoization', async () => {
            const mockData = generateScalableMonthlyGroups(40, 75);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const { rerender } = render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Measure re-render performance with same data
            const rerenderTimes: number[] = [];
            
            for (let i = 0; i < 10; i++) {
                const start = performance.now();
                rerender(<MonthlyPurchaseDisplay />);
                await waitFor(() => {
                    expect(screen.getByTestId('accordion')).toBeInTheDocument();
                });
                const end = performance.now();
                rerenderTimes.push(end - start);
            }

            const averageRerenderTime = rerenderTimes.reduce((sum, time) => sum + time, 0) / rerenderTimes.length;
            
            // Re-renders should be fast due to memoization
            expect(averageRerenderTime).toBeLessThan(100); // Less than 100ms average

            console.log(`Average re-render time: ${averageRerenderTime.toFixed(2)}ms`);
        });
    });

    describe('Interaction Performance', () => {
        it('should handle rapid user interactions efficiently', async () => {
            const mockData = generateScalableMonthlyGroups(60, 80);
            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            const triggers = screen.getAllByTestId('accordion-trigger');
            const interactionTimes: number[] = [];

            // Measure individual interaction times
            for (let i = 0; i < Math.min(20, triggers.length); i++) {
                const start = performance.now();
                
                await act(async () => {
                    await user.click(triggers[i]);
                });
                
                const end = performance.now();
                interactionTimes.push(end - start);
            }

            const averageInteractionTime = interactionTimes.reduce((sum, time) => sum + time, 0) / interactionTimes.length;
            
            // Each interaction should be responsive
            expect(averageInteractionTime).toBeLessThan(50); // Less than 50ms average
            expect(Math.max(...interactionTimes)).toBeLessThan(200); // No interaction over 200ms

            console.log(`Average interaction time: ${averageInteractionTime.toFixed(2)}ms`);
            console.log(`Max interaction time: ${Math.max(...interactionTimes).toFixed(2)}ms`);
        });

        it('should maintain scroll performance with large lists', async () => {
            // Create a month with many purchases to test scroll performance
            const largePurchaseList = generateOptimizedPurchases(1000);
            const mockData: MonthlyPurchaseGroup[] = [{
                monthYear: '2024-01',
                displayName: 'January 2024',
                totalAmount: 50000,
                purchaseCount: 1000,
                purchases: largePurchaseList,
            }];

            mockGetPurchasesByMonth.mockResolvedValue(mockData);
            const user = userEvent.setup();

            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });

            // Expand the month to show purchases
            const trigger = screen.getByTestId('accordion-trigger');
            
            const expandStart = performance.now();
            await act(async () => {
                await user.click(trigger);
            });
            const expandEnd = performance.now();

            const expandTime = expandEnd - expandStart;
            
            // Expanding large list should still be responsive
            expect(expandTime).toBeLessThan(500); // Less than 500ms to expand

            console.log(`Expanded 1000 purchases in ${expandTime.toFixed(2)}ms`);
        });
    });

    describe('Data Processing Performance', () => {
        it('should efficiently process complex purchase data structures', async () => {
            // Create purchases with complex item structures
            const complexPurchases = Array.from({ length: 5000 }, (_, i) => ({
                _id: `purchase-${i}`,
                familyId: 'family-1',
                purchasedBy: 'user-1',
                storeId: `store-${i % 20}`,
                storeName: `Complex Store ${i % 20}`,
                accessKey: `access-${i}`,
                date: new Date(2024, Math.floor(i / 200), (i % 30) + 1),
                totalAmount: Math.round((Math.random() * 200 + 20) * 100) / 100,
                createdAt: new Date(),
                updatedAt: new Date(),
                items: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, j) => ({
                    _id: `item-${i}-${j}`,
                    name: `Item ${j}`,
                    quantity: Math.floor(Math.random() * 5) + 1,
                    price: Math.round((Math.random() * 50 + 5) * 100) / 100,
                })),
            }));

            // Group into monthly structure
            const monthlyGroups = new Map<string, Purchase[]>();
            complexPurchases.forEach(purchase => {
                const monthKey = `${purchase.date.getFullYear()}-${String(purchase.date.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlyGroups.has(monthKey)) {
                    monthlyGroups.set(monthKey, []);
                }
                monthlyGroups.get(monthKey)!.push(purchase);
            });

            const mockData: MonthlyPurchaseGroup[] = Array.from(monthlyGroups.entries()).map(([monthKey, purchases]) => ({
                monthYear: monthKey,
                displayName: `Month ${monthKey}`,
                totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
                purchaseCount: purchases.length,
                purchases,
            }));

            mockGetPurchasesByMonth.mockResolvedValue(mockData);

            const processingStart = performance.now();
            render(<MonthlyPurchaseDisplay />);
            
            await waitFor(() => {
                expect(screen.getByTestId('accordion')).toBeInTheDocument();
            });
            const processingEnd = performance.now();

            const processingTime = processingEnd - processingStart;
            
            expect(processingTime).toBeLessThan(3000); // Should process within 3 seconds
            expect(screen.getAllByTestId('accordion-item').length).toBeGreaterThan(0);

            console.log(`Processed 5000 complex purchases in ${processingTime.toFixed(2)}ms`);
        });
    });
});
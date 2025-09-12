import { useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
    componentCount: number;
    updateCount: number;
    lastUpdate: number;
}

export interface OptimizationConfig {
    enableVirtualization: boolean;
    maxVisibleItems: number;
    debounceMs: number;
    enableMemoryMonitoring: boolean;
    enableRenderTracking: boolean;
}

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
    const metricsRef = useRef<PerformanceMetrics>({
        renderTime: 0,
        memoryUsage: 0,
        componentCount: 0,
        updateCount: 0,
        lastUpdate: Date.now(),
    });

    const renderStartRef = useRef<number>(0);

    const startRender = useCallback(() => {
        renderStartRef.current = performance.now();
    }, []);

    const endRender = useCallback(() => {
        const renderTime = performance.now() - renderStartRef.current;
        const metrics = metricsRef.current;
        
        metrics.renderTime = renderTime;
        metrics.updateCount++;
        metrics.lastUpdate = Date.now();
        
        if (performance.memory) {
            metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }

        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && renderTime > 100) {
            console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
    }, [componentName]);

    const getMetrics = useCallback((): PerformanceMetrics => {
        return { ...metricsRef.current };
    }, []);

    const resetMetrics = useCallback(() => {
        metricsRef.current = {
            renderTime: 0,
            memoryUsage: 0,
            componentCount: 0,
            updateCount: 0,
            lastUpdate: Date.now(),
        };
    }, []);

    return {
        startRender,
        endRender,
        getMetrics,
        resetMetrics,
    };
}

/**
 * Hook for debouncing expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): T {
    const lastCallRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        
        if (now - lastCallRef.current >= delay) {
            lastCallRef.current = now;
            return func(...args);
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                lastCallRef.current = Date.now();
                func(...args);
            }, delay - (now - lastCallRef.current));
        }
    }, [func, delay]) as T;
}

/**
 * Hook for optimizing large list rendering
 */
export function useVirtualization<T>(
    items: T[],
    config: {
        containerHeight: number;
        itemHeight: number;
        overscan?: number;
        scrollTop?: number;
    }
) {
    const { containerHeight, itemHeight, overscan = 5, scrollTop = 0 } = config;

    return useMemo(() => {
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

        const visibleItems = items.slice(startIndex, endIndex);
        const totalHeight = items.length * itemHeight;
        const offsetY = startIndex * itemHeight;

        return {
            visibleItems,
            startIndex,
            endIndex,
            totalHeight,
            offsetY,
            visibleCount,
        };
    }, [items, containerHeight, itemHeight, overscan, scrollTop]);
}

/**
 * Hook for memory-efficient state management
 */
export function useMemoryEfficientState<T>(
    initialValue: T,
    maxHistorySize: number = 10
) {
    const [currentValue, setCurrentValue] = React.useState<T>(initialValue);
    const historyRef = useRef<T[]>([initialValue]);

    const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
        setCurrentValue(prev => {
            const nextValue = typeof newValue === 'function' 
                ? (newValue as (prev: T) => T)(prev) 
                : newValue;

            // Maintain history with size limit
            historyRef.current.push(nextValue);
            if (historyRef.current.length > maxHistorySize) {
                historyRef.current = historyRef.current.slice(-maxHistorySize);
            }

            return nextValue;
        });
    }, [maxHistorySize]);

    const getHistory = useCallback(() => {
        return [...historyRef.current];
    }, []);

    const clearHistory = useCallback(() => {
        historyRef.current = [currentValue];
    }, [currentValue]);

    return {
        value: currentValue,
        setValue,
        getHistory,
        clearHistory,
    };
}

/**
 * Performance optimization recommendations based on data size
 */
export function getOptimizationConfig(dataSize: number): OptimizationConfig {
    if (dataSize < 100) {
        return {
            enableVirtualization: false,
            maxVisibleItems: dataSize,
            debounceMs: 0,
            enableMemoryMonitoring: false,
            enableRenderTracking: false,
        };
    } else if (dataSize < 1000) {
        return {
            enableVirtualization: false,
            maxVisibleItems: 100,
            debounceMs: 100,
            enableMemoryMonitoring: true,
            enableRenderTracking: true,
        };
    } else if (dataSize < 5000) {
        return {
            enableVirtualization: true,
            maxVisibleItems: 50,
            debounceMs: 200,
            enableMemoryMonitoring: true,
            enableRenderTracking: true,
        };
    } else {
        return {
            enableVirtualization: true,
            maxVisibleItems: 25,
            debounceMs: 300,
            enableMemoryMonitoring: true,
            enableRenderTracking: true,
        };
    }
}

/**
 * Memory usage monitoring utility
 */
export class MemoryMonitor {
    private snapshots: Array<{ timestamp: number; usage: number }> = [];
    private maxSnapshots = 100;

    takeSnapshot(): void {
        if (performance.memory) {
            this.snapshots.push({
                timestamp: Date.now(),
                usage: performance.memory.usedJSHeapSize,
            });

            // Keep only recent snapshots
            if (this.snapshots.length > this.maxSnapshots) {
                this.snapshots = this.snapshots.slice(-this.maxSnapshots);
            }
        }
    }

    getMemoryGrowth(): number {
        if (this.snapshots.length < 2) return 0;
        
        const first = this.snapshots[0];
        const last = this.snapshots[this.snapshots.length - 1];
        
        return last.usage - first.usage;
    }

    getAverageUsage(): number {
        if (this.snapshots.length === 0) return 0;
        
        const total = this.snapshots.reduce((sum, snapshot) => sum + snapshot.usage, 0);
        return total / this.snapshots.length;
    }

    getPeakUsage(): number {
        if (this.snapshots.length === 0) return 0;
        
        return Math.max(...this.snapshots.map(s => s.usage));
    }

    clear(): void {
        this.snapshots = [];
    }

    getReport(): {
        currentUsage: number;
        peakUsage: number;
        averageUsage: number;
        memoryGrowth: number;
        snapshotCount: number;
    } {
        return {
            currentUsage: performance.memory?.usedJSHeapSize || 0,
            peakUsage: this.getPeakUsage(),
            averageUsage: this.getAverageUsage(),
            memoryGrowth: this.getMemoryGrowth(),
            snapshotCount: this.snapshots.length,
        };
    }
}

/**
 * Component render tracking utility
 */
export class RenderTracker {
    private renderTimes: number[] = [];
    private componentCounts: number[] = [];
    private maxEntries = 50;

    recordRender(renderTime: number, componentCount: number = 1): void {
        this.renderTimes.push(renderTime);
        this.componentCounts.push(componentCount);

        // Keep only recent entries
        if (this.renderTimes.length > this.maxEntries) {
            this.renderTimes = this.renderTimes.slice(-this.maxEntries);
            this.componentCounts = this.componentCounts.slice(-this.maxEntries);
        }
    }

    getAverageRenderTime(): number {
        if (this.renderTimes.length === 0) return 0;
        return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    }

    getSlowRenders(threshold: number = 100): number[] {
        return this.renderTimes.filter(time => time > threshold);
    }

    getReport(): {
        averageRenderTime: number;
        maxRenderTime: number;
        minRenderTime: number;
        slowRenderCount: number;
        totalRenders: number;
    } {
        if (this.renderTimes.length === 0) {
            return {
                averageRenderTime: 0,
                maxRenderTime: 0,
                minRenderTime: 0,
                slowRenderCount: 0,
                totalRenders: 0,
            };
        }

        return {
            averageRenderTime: this.getAverageRenderTime(),
            maxRenderTime: Math.max(...this.renderTimes),
            minRenderTime: Math.min(...this.renderTimes),
            slowRenderCount: this.getSlowRenders().length,
            totalRenders: this.renderTimes.length,
        };
    }

    clear(): void {
        this.renderTimes = [];
        this.componentCounts = [];
    }
}

// Fix missing React import
import React from 'react';
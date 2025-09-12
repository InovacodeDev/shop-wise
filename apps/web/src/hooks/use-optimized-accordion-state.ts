import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface AccordionStateOptions {
    maxExpandedItems?: number;
    defaultExpanded?: string[];
    persistState?: boolean;
    storageKey?: string;
}

interface AccordionStateReturn {
    expandedItems: Set<string>;
    isExpanded: (itemId: string) => boolean;
    toggle: (itemId: string) => void;
    expand: (itemId: string) => void;
    collapse: (itemId: string) => void;
    expandAll: (itemIds: string[]) => void;
    collapseAll: () => void;
    getExpandedCount: () => number;
    cleanup: () => void;
}

/**
 * Optimized hook for managing accordion expand/collapse state with memory management
 * Features:
 * - LRU eviction when max expanded items exceeded
 * - Optional state persistence
 * - Memory-efficient operations
 * - Cleanup utilities
 */
export function useOptimizedAccordionState(options: AccordionStateOptions = {}): AccordionStateReturn {
    const {
        maxExpandedItems = 10,
        defaultExpanded = [],
        persistState = false,
        storageKey = 'accordion-state'
    } = options;

    // Initialize state from localStorage if persistence is enabled
    const getInitialState = useCallback((): Set<string> => {
        if (persistState && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return new Set(Array.isArray(parsed) ? parsed : defaultExpanded);
                }
            } catch (error) {
                console.warn('Failed to load accordion state from localStorage:', error);
            }
        }
        return new Set(defaultExpanded);
    }, [persistState, storageKey, defaultExpanded]);

    const [expandedItems, setExpandedItems] = useState<Set<string>>(getInitialState);
    
    // Track access order for LRU eviction
    const accessOrderRef = useRef<string[]>([]);
    const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Persist state to localStorage when it changes
    useEffect(() => {
        if (persistState && typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(Array.from(expandedItems)));
            } catch (error) {
                console.warn('Failed to persist accordion state to localStorage:', error);
            }
        }
    }, [expandedItems, persistState, storageKey]);

    // Update access order when items are accessed
    const updateAccessOrder = useCallback((itemId: string) => {
        accessOrderRef.current = accessOrderRef.current.filter(id => id !== itemId);
        accessOrderRef.current.push(itemId);
    }, []);

    // Evict least recently used items if we exceed the limit
    const evictLRU = useCallback((newExpandedItems: Set<string>) => {
        if (newExpandedItems.size <= maxExpandedItems) {
            return newExpandedItems;
        }

        const itemsToKeep = accessOrderRef.current.slice(-maxExpandedItems);
        const evictedItems = new Set(itemsToKeep.filter(id => newExpandedItems.has(id)));
        
        // Update access order to only include kept items
        accessOrderRef.current = itemsToKeep.filter(id => evictedItems.has(id));
        
        return evictedItems;
    }, [maxExpandedItems]);

    // Check if an item is expanded
    const isExpanded = useCallback((itemId: string): boolean => {
        return expandedItems.has(itemId);
    }, [expandedItems]);

    // Toggle an item's expanded state
    const toggle = useCallback((itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
                // Remove from access order when collapsed
                accessOrderRef.current = accessOrderRef.current.filter(id => id !== itemId);
            } else {
                newSet.add(itemId);
                updateAccessOrder(itemId);
                return evictLRU(newSet);
            }
            
            return newSet;
        });
    }, [updateAccessOrder, evictLRU]);

    // Expand a specific item
    const expand = useCallback((itemId: string) => {
        if (!expandedItems.has(itemId)) {
            setExpandedItems(prev => {
                const newSet = new Set(prev);
                newSet.add(itemId);
                updateAccessOrder(itemId);
                return evictLRU(newSet);
            });
        } else {
            // Update access order even if already expanded
            updateAccessOrder(itemId);
        }
    }, [expandedItems, updateAccessOrder, evictLRU]);

    // Collapse a specific item
    const collapse = useCallback((itemId: string) => {
        if (expandedItems.has(itemId)) {
            setExpandedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
            
            // Remove from access order
            accessOrderRef.current = accessOrderRef.current.filter(id => id !== itemId);
        }
    }, [expandedItems]);

    // Expand multiple items (respecting max limit)
    const expandAll = useCallback((itemIds: string[]) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            
            // Add items in reverse order so the last ones have higher priority
            itemIds.reverse().forEach(itemId => {
                newSet.add(itemId);
                updateAccessOrder(itemId);
            });
            
            return evictLRU(newSet);
        });
    }, [updateAccessOrder, evictLRU]);

    // Collapse all items
    const collapseAll = useCallback(() => {
        setExpandedItems(new Set());
        accessOrderRef.current = [];
    }, []);

    // Get current expanded count
    const getExpandedCount = useCallback((): number => {
        return expandedItems.size;
    }, [expandedItems]);

    // Cleanup function to clear state and cancel any pending operations
    const cleanup = useCallback(() => {
        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
            cleanupTimeoutRef.current = null;
        }
        
        setExpandedItems(new Set());
        accessOrderRef.current = [];
        
        if (persistState && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn('Failed to clear accordion state from localStorage:', error);
            }
        }
    }, [persistState, storageKey]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
        };
    }, []);

    // Memoize the return object to prevent unnecessary re-renders
    return useMemo(() => ({
        expandedItems,
        isExpanded,
        toggle,
        expand,
        collapse,
        expandAll,
        collapseAll,
        getExpandedCount,
        cleanup,
    }), [
        expandedItems,
        isExpanded,
        toggle,
        expand,
        collapse,
        expandAll,
        collapseAll,
        getExpandedCount,
        cleanup,
    ]);
}

/**
 * Hook for monitoring accordion performance metrics
 */
export function useAccordionPerformanceMetrics() {
    const metricsRef = useRef({
        toggleCount: 0,
        averageToggleTime: 0,
        maxToggleTime: 0,
        totalToggleTime: 0,
        memoryUsage: 0,
    });

    const recordToggle = useCallback((toggleTime: number) => {
        const metrics = metricsRef.current;
        metrics.toggleCount++;
        metrics.totalToggleTime += toggleTime;
        metrics.averageToggleTime = metrics.totalToggleTime / metrics.toggleCount;
        metrics.maxToggleTime = Math.max(metrics.maxToggleTime, toggleTime);
        
        // Record memory usage if available
        if (performance.memory) {
            metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
    }, []);

    const getMetrics = useCallback(() => {
        return { ...metricsRef.current };
    }, []);

    const resetMetrics = useCallback(() => {
        metricsRef.current = {
            toggleCount: 0,
            averageToggleTime: 0,
            maxToggleTime: 0,
            totalToggleTime: 0,
            memoryUsage: 0,
        };
    }, []);

    return {
        recordToggle,
        getMetrics,
        resetMetrics,
    };
}
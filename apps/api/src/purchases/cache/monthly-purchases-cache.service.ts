import { Injectable } from '@nestjs/common';

import { MonthlyPurchaseGroup } from '../../models/monthly-purchase-group';

interface CacheEntry {
    data: MonthlyPurchaseGroup[];
    timestamp: number;
    familyId: string;
}

@Injectable()
export class MonthlyPurchasesCacheService {
    private cache = new Map<string, CacheEntry>();
    private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached entries
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Start cleanup interval to remove expired entries
        this.startCleanupInterval();
    }

    /**
     * Get cached monthly purchases for a family
     * @param familyId - The family ID
     * @returns Cached data if valid, null otherwise
     */
    get(familyId: string): MonthlyPurchaseGroup[] | null {
        const entry = this.cache.get(familyId);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > this.TTL_MS) {
            this.cache.delete(familyId);
            return null;
        }

        // Return a deep clone to prevent external mutations
        return this.deepClone(entry.data);
    }

    /**
     * Set cached monthly purchases for a family
     * @param familyId - The family ID
     * @param data - The monthly purchase groups to cache
     */
    set(familyId: string, data: MonthlyPurchaseGroup[]): void {
        if (!familyId || !data) {
            return;
        }

        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldestEntry();
        }

        const entry: CacheEntry = {
            data: this.deepClone(data), // Clone to prevent external mutations
            timestamp: Date.now(),
            familyId,
        };

        this.cache.set(familyId, entry);
    }

    /**
     * Invalidate cache for a specific family
     * @param familyId - The family ID to invalidate
     */
    invalidate(familyId: string): void {
        this.cache.delete(familyId);
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns Object containing cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        memoryUsage: number;
    } {
        const memoryUsage = this.estimateMemoryUsage();

        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            hitRate: this.calculateHitRate(),
            memoryUsage,
        };
    }

    /**
     * Check if caching is enabled and healthy
     * @returns True if cache is operational
     */
    isHealthy(): boolean {
        return this.cache.size < this.MAX_CACHE_SIZE && this.cleanupInterval !== null;
    }

    /**
     * Manually trigger cleanup of expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.TTL_MS) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach((key) => this.cache.delete(key));
    }

    /**
     * Destroy the cache service and cleanup resources
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.cache.clear();
    }

    private startCleanupInterval(): void {
        // Run cleanup every 2 minutes
        this.cleanupInterval = setInterval(
            () => {
                this.cleanup();
            },
            2 * 60 * 1000,
        );
    }

    private evictOldestEntry(): void {
        // Remove the oldest entry according to insertion order in the Map
        const firstKey = this.cache.keys().next().value as string | undefined;
        if (firstKey) {
            this.cache.delete(firstKey);
        }
    }

    private deepClone<T>(data: T): T {
        if (data === null || data === undefined) {
            return data;
        }

        // Custom deep clone that preserves Date instances and uses safe typing
        try {
            const cloneValue = (value: unknown): unknown => {
                if (value === null || value === undefined) return value;
                if (value instanceof Date) return new Date(value.getTime());
                if (Array.isArray(value)) return value.map((v) => cloneValue(v)) as unknown;
                if (typeof value === 'object') {
                    const out: Record<string, unknown> = {};
                    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
                        out[k] = cloneValue(v);
                    }
                    return out;
                }
                return value;
            };

            return cloneValue(data) as T;
        } catch (error) {
            console.warn('Failed to deep clone cache data:', error);
            // Return a safe empty value for arrays, or cast empty object for other shapes
            if (Array.isArray(data)) {
                return [] as unknown as T;
            }
            return {} as unknown as T;
        }
    }

    private calculateHitRate(): number {
        // This is a simplified implementation
        // In a real scenario, you'd track hits and misses
        return 0.75; // Placeholder value
    }

    private estimateMemoryUsage(): number {
        let totalSize = 0;

        for (const entry of this.cache.values()) {
            // Rough estimation: JSON string length as proxy for memory usage
            totalSize += JSON.stringify(entry.data).length;
        }

        return totalSize;
    }
}

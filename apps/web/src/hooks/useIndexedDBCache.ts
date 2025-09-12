import { useCallback, useEffect, useState } from 'react';

import { indexedDBCacheService } from '../services/cache/indexeddb-cache.service';
import { Account, Budget, Category, Expense, Goal } from '../types/api';

interface UseIndexedDBCacheReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    isOnline: boolean;
    pendingOperations: number;
}

export function useIndexedDBExpenses(): UseIndexedDBCacheReturn<Expense[]> {
    const [data, setData] = useState<Expense[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get cached data first
            const cachedData = await indexedDBCacheService.getCachedExpenses();
            if (cachedData) {
                setData(cachedData);
            }

            // Update sync status
            const syncStatus = await indexedDBCacheService.getSyncStatus();
            setIsOnline(syncStatus.isOnline);
            setPendingOperations(syncStatus.pendingOperations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        await indexedDBCacheService.refreshAllCache();
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        isOnline,
        pendingOperations,
    };
}

export function useIndexedDBAccounts(): UseIndexedDBCacheReturn<Account[]> {
    const [data, setData] = useState<Account[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cachedData = await indexedDBCacheService.getCachedAccounts();
            if (cachedData) {
                setData(cachedData);
            }

            const syncStatus = await indexedDBCacheService.getSyncStatus();
            setIsOnline(syncStatus.isOnline);
            setPendingOperations(syncStatus.pendingOperations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load accounts');
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        await indexedDBCacheService.refreshAllCache();
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        isOnline,
        pendingOperations,
    };
}

export function useIndexedDBCategories(): UseIndexedDBCacheReturn<Category[]> {
    const [data, setData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cachedData = await indexedDBCacheService.getCachedCategories();
            if (cachedData) {
                setData(cachedData);
            }

            const syncStatus = await indexedDBCacheService.getSyncStatus();
            setIsOnline(syncStatus.isOnline);
            setPendingOperations(syncStatus.pendingOperations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        await indexedDBCacheService.refreshAllCache();
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        isOnline,
        pendingOperations,
    };
}

export function useIndexedDBBudgets(): UseIndexedDBCacheReturn<Budget[]> {
    const [data, setData] = useState<Budget[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cachedData = await indexedDBCacheService.getCachedBudgets();
            if (cachedData) {
                setData(cachedData);
            }

            const syncStatus = await indexedDBCacheService.getSyncStatus();
            setIsOnline(syncStatus.isOnline);
            setPendingOperations(syncStatus.pendingOperations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load budgets');
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        await indexedDBCacheService.refreshAllCache();
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        isOnline,
        pendingOperations,
    };
}

export function useIndexedDBGoals(): UseIndexedDBCacheReturn<Goal[]> {
    const [data, setData] = useState<Goal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cachedData = await indexedDBCacheService.getCachedGoals();
            if (cachedData) {
                setData(cachedData);
            }

            const syncStatus = await indexedDBCacheService.getSyncStatus();
            setIsOnline(syncStatus.isOnline);
            setPendingOperations(syncStatus.pendingOperations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load goals');
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        await indexedDBCacheService.refreshAllCache();
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        isOnline,
        pendingOperations,
    };
}

export function useIndexedDBSync() {
    const [isOnline, setIsOnline] = useState(indexedDBCacheService.isConnected());
    const [pendingOperations, setPendingOperations] = useState(0);
    const [syncing, setSyncing] = useState(false);

    const checkSyncStatus = useCallback(async () => {
        const syncStatus = await indexedDBCacheService.getSyncStatus();
        setIsOnline(syncStatus.isOnline);
        setPendingOperations(syncStatus.pendingOperations);
    }, []);

    const syncNow = useCallback(async () => {
        if (!isOnline) return;

        setSyncing(true);
        try {
            await indexedDBCacheService.syncPendingOperations();
            await checkSyncStatus();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    }, [isOnline, checkSyncStatus]);

    const clearCache = useCallback(async () => {
        await indexedDBCacheService.clearAllCache();
        await checkSyncStatus();
    }, [checkSyncStatus]);

    useEffect(() => {
        checkSyncStatus();
    }, [checkSyncStatus]);

    return {
        isOnline,
        pendingOperations,
        syncing,
        syncNow,
        clearCache,
        checkSyncStatus,
    };
}

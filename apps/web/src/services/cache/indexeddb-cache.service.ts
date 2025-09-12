import { Account, Budget, Category, Expense, Goal } from '@/types/api';

interface CachedData<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface SyncQueueItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: any;
    timestamp: number;
    retryCount: number;
}

class IndexedDBCacheService {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'FinanceAppCache';
    private readonly DB_VERSION = 1;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private isOnline = true;

    constructor() {
        this.initDB();
        this.checkNetworkStatus();
    }

    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache');
                }

                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp');
                    syncStore.createIndex('type', 'type');
                }
            };
        });
    }

    private async ensureDB(): Promise<void> {
        if (!this.db) {
            await this.initDB();
        }
    }

    // Network status monitoring
    private checkNetworkStatus() {
        this.isOnline = navigator.onLine;
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingOperations();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Cache management
    private async setCache<T>(key: string, data: T, duration = this.CACHE_DURATION): Promise<void> {
        await this.ensureDB();
        const cachedData: CachedData<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + duration,
        };

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(cachedData, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async getCache<T>(key: string): Promise<T | null> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);

            request.onsuccess = () => {
                const cachedData = request.result as CachedData<T> | undefined;
                if (!cachedData) {
                    resolve(null);
                    return;
                }

                if (Date.now() > cachedData.expiresAt) {
                    // Remove expired data
                    const deleteTransaction = this.db!.transaction(['cache'], 'readwrite');
                    const deleteStore = deleteTransaction.objectStore('cache');
                    deleteStore.delete(key);
                    resolve(null);
                    return;
                }

                resolve(cachedData.data);
            };

            request.onerror = () => reject(request.error);
        });
    }

    private async clearExpiredCache(): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    const cachedData = cursor.value as CachedData<any>;
                    if (Date.now() > cachedData.expiresAt) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Sync queue management
    private async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        await this.ensureDB();
        const syncItem: SyncQueueItem = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            retryCount: 0,
        };

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.add(syncItem);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async getSyncQueue(): Promise<SyncQueueItem[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => reject(request.error);
        });
    }

    private async removeFromSyncQueue(id: string): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const existingItem = getRequest.result;
                if (existingItem) {
                    const updatedItem = { ...existingItem, ...updates };
                    const putRequest = store.put(updatedItem);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve();
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Public methods for caching data
    async cacheExpenses(expenses: Expense[]): Promise<void> {
        await this.setCache('expenses', expenses);
    }

    async getCachedExpenses(): Promise<Expense[] | null> {
        return this.getCache<Expense[]>('expenses');
    }

    async cacheAccounts(accounts: Account[]): Promise<void> {
        await this.setCache('accounts', accounts);
    }

    async getCachedAccounts(): Promise<Account[] | null> {
        return this.getCache<Account[]>('accounts');
    }

    async cacheCategories(categories: Category[]): Promise<void> {
        await this.setCache('categories', categories);
    }

    async getCachedCategories(): Promise<Category[] | null> {
        return this.getCache<Category[]>('categories');
    }

    async cacheBudgets(budgets: Budget[]): Promise<void> {
        await this.setCache('budgets', budgets);
    }

    async getCachedBudgets(): Promise<Budget[] | null> {
        return this.getCache<Budget[]>('budgets');
    }

    async cacheGoals(goals: Goal[]): Promise<void> {
        await this.setCache('goals', goals);
    }

    async getCachedGoals(): Promise<Goal[] | null> {
        return this.getCache<Goal[]>('goals');
    }

    // Offline operations
    async createExpenseOffline(expenseData: any): Promise<void> {
        await this.addToSyncQueue({
            type: 'create',
            endpoint: '/expenses',
            data: expenseData,
        });

        // Update local cache
        const cachedExpenses = (await this.getCachedExpenses()) || [];
        const tempExpense = {
            ...expenseData,
            _id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        cachedExpenses.unshift(tempExpense);
        await this.cacheExpenses(cachedExpenses);
    }

    async createAccountOffline(accountData: any): Promise<void> {
        await this.addToSyncQueue({
            type: 'create',
            endpoint: '/accounts',
            data: accountData,
        });

        // Update local cache
        const cachedAccounts = (await this.getCachedAccounts()) || [];
        const tempAccount = {
            ...accountData,
            _id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        cachedAccounts.push(tempAccount);
        await this.cacheAccounts(cachedAccounts);
    }

    async updateExpenseOffline(expenseId: string, expenseData: any): Promise<void> {
        await this.addToSyncQueue({
            type: 'update',
            endpoint: `/expenses/${expenseId}`,
            data: expenseData,
        });

        // Update local cache
        const cachedExpenses = (await this.getCachedExpenses()) || [];
        const index = cachedExpenses.findIndex((expense) => expense._id === expenseId);
        if (index !== -1) {
            cachedExpenses[index] = { ...cachedExpenses[index], ...expenseData, updatedAt: new Date().toISOString() };
            await this.cacheExpenses(cachedExpenses);
        }
    }

    async deleteExpenseOffline(expenseId: string): Promise<void> {
        await this.addToSyncQueue({
            type: 'delete',
            endpoint: `/expenses/${expenseId}`,
            data: {},
        });

        // Update local cache
        const cachedExpenses = (await this.getCachedExpenses()) || [];
        const filteredExpenses = cachedExpenses.filter((expense) => expense._id !== expenseId);
        await this.cacheExpenses(filteredExpenses);
    }

    // Sync operations
    async syncPendingOperations(): Promise<void> {
        if (!this.isOnline) return;

        const queue = await this.getSyncQueue();
        const pendingItems = queue.filter((item) => item.retryCount < 3);

        for (const item of pendingItems) {
            try {
                // Note: In a real implementation, you would make actual API calls here
                // For now, we'll just simulate the sync
                console.log(`Syncing ${item.type} operation to ${item.endpoint}`);

                await this.removeFromSyncQueue(item.id);
            } catch (error) {
                console.error(`Failed to sync ${item.type} operation:`, error);
                await this.updateSyncQueueItem(item.id, { retryCount: item.retryCount + 1 });
            }
        }

        // Refresh cache after sync
        await this.refreshAllCache();
    }

    async refreshAllCache(): Promise<void> {
        try {
            // In a real implementation, you would fetch from API
            console.log('Refreshing cache from server...');
            await this.setCache('last_sync', Date.now(), this.CACHE_DURATION);
        } catch (error) {
            console.error('Failed to refresh cache:', error);
        }
    }

    async clearAllCache(): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction(['cache', 'syncQueue'], 'readwrite');
            const cacheStore = transaction.objectStore('cache');
            const syncStore = transaction.objectStore('syncQueue');

            cacheStore.clear();
            syncStore.clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getSyncStatus(): Promise<{
        isOnline: boolean;
        pendingOperations: number;
        lastSyncTime?: number;
    }> {
        const queue = await this.getSyncQueue();
        const pendingOperations = queue.length;

        let lastSyncTime: number | undefined;
        try {
            const cached = await this.getCache<number>('last_sync');
            lastSyncTime = cached || undefined;
        } catch {
            // Ignore
        }

        return {
            isOnline: this.isOnline,
            pendingOperations,
            lastSyncTime,
        };
    }

    // Utility methods
    isConnected(): boolean {
        return this.isOnline;
    }

    async performMaintenance(): Promise<void> {
        await this.clearExpiredCache();
        if (this.isOnline) {
            await this.syncPendingOperations();
        }
    }
}

export const indexedDBCacheService = new IndexedDBCacheService();

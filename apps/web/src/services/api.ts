import { logApiCall } from '@/lib/dev-utils';
import { ExtractProductDataOutput } from '@/types/ai-flows';
import type {
    // Finance types
    Account,
    AccountSummary,
    Achievement,
    AnalyzeConsumptionDataOutput,
    // AI Flow types
    AnalyzeConsumptionRequest,
    // Auth types
    AuthResponse,
    AvailableMonth,
    AvailableMonthsSummary,
    BalanceProjection,
    BankAccount,
    BankTransaction,
    Budget,
    BudgetProgress,
    BulkDeletePurchaseItemsResponse,
    BulkUpdatePurchaseItemsResponse,
    // Category types
    Category,
    CheckoutResponse,
    CreateCategoryRequest,
    CreateCheckoutRequest,
    CreateFamilyRequest,
    CreateNotificationRequest,
    CreatePantryItemRequest,
    CreateProductRequest,
    CreatePurchaseItemRequest,
    CreatePurchaseRequest,
    CreateShoppingListItemRequest,
    CreateShoppingListRequest,
    CreateStorePreferenceRequest,
    CreateStoreRequest,
    CreateUserRequest,
    CreditCard,
    CreditCardInvoice,
    CreditTransaction,
    // Generic types
    DeleteResponse,
    EducationalContent,
    Expense,
    ExpenseFilters,
    ExpensesSummary,
    ExtractDataFromPageRequest,
    ExtractDataFromPdfRequest,
    ExtractProductDataRequest,
    // Family types
    Family,
    Goal,
    GoalDeposit,
    GoalProgress,
    Investment,
    InvestmentPortfolio,
    InvestmentSummary,
    InvestmentTransaction,
    MarkAllNotificationsAsReadResponse,
    MarkNotificationAsReadResponse,
    MeResponse,
    MonthlyPurchaseGroup,
    // Notification types
    Notification,
    // Pantry Item types
    PantryItem,
    // Payment types
    PaymentListParams,
    PaymentMethod,
    PaymentStatusResponse,
    Plan,
    PollStatusResponse,
    // Product types
    Product,
    // Purchase types
    Purchase,
    // Purchase Item types
    PurchaseItem,
    RecurringTransaction,
    RefreshTokenResponse,
    RevokeTokenResponse,
    // Shopping List types
    ShoppingList,
    // Shopping List Item types
    ShoppingListItem,
    SignInRequest,
    SignUpRequest,
    // Store types
    Store,
    StorePreference,
    Subscription,
    SuggestMissingItemsOutput,
    SuggestMissingItemsRequest,
    UpdateFamilyRequest,
    UpdatePantryItemRequest,
    UpdatePurchaseItemRequest,
    UpdatePurchaseRequest,
    UpdateShoppingListItemRequest,
    UpdateShoppingListRequest,
    UpdateStorePreferenceRequest,
    UpdateUserRequest,
    // User types
    User,
    UserFeatures,
    UserPaymentListResponse,
    UserStats,
} from '@/types/api';
import type { CrawlAndEnhanceNfceResponse, CrawlNfceRequest, CrawlNfceResponse } from '@/types/webcrawler';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiService {
    // Normalize VITE_API_URL to always include '/api' prefix expected by backend
    private baseURL = (() => {
        const configured = (import.meta.env.VITE_API_URL as string) || '';
        if (!configured) return '/api';
        const trimmed = configured.replace(/\/+$/, '');
        return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    })();
    private axiosInstance: AxiosInstance;
    // In-memory token store (safer than always using localStorage)
    private inMemoryBackendToken: string | null = null;
    private inMemoryBackendRefreshToken: string | null = null;
    // Toggle to persist tokens in localStorage for compatibility; default false for safer behavior
    private persistTokens: boolean = (import.meta.env.VITE_PERSIST_TOKENS as string) === 'true' || false;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            // Send credentials (cookies) in case the backend uses cookie-based sessions
            withCredentials: true,
        });

        // Request interceptor to add auth token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                // Verbose request logging for debugging
                try {
                    const token = await this.getAuthToken();
                    if (token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.warn('Error retrieving auth token for request:', e);
                }
                console.debug('[api] Request:', {
                    url: config.url,
                    method: config.method,
                    headers: config.headers,
                    data: (config as any).data,
                });
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        // Response interceptor to handle errors
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                // Verbose response logging
                console.debug('[api] Response:', {
                    url: response.config.url,
                    status: response.status,
                    data: response.data,
                });
                return response;
            },
            async (error) => {
                const status = error.response?.status;
                const url = error.config?.url;
                const serverMessage = error.response?.data?.message;

                // If 401/403, try to refresh token once and retry request
                if ((status === 401 || status === 403) && !(error.config as any)?._retry) {
                    console.warn(`[api] Received ${status} for ${url} — attempting token refresh and retry`);
                    (error.config as any)._retry = true;
                    try {
                        const newToken = await this.refreshAuthToken();
                        if (newToken) {
                            (error.config as any).headers = (error.config as any).headers || {};
                            (error.config as any).headers.Authorization = `Bearer ${newToken}`;
                            const retryResponse = await this.axiosInstance.request(error.config);
                            console.debug('[api] Retry response after token refresh:', {
                                url: retryResponse.config.url,
                                status: retryResponse.status,
                                data: retryResponse.data,
                            });
                            return retryResponse;
                        }
                    } catch (refreshError) {
                        console.warn('[api] Token refresh or retry failed:', refreshError);
                        // fallthrough to throw original error info
                    }
                }

                const message = serverMessage || error.message || `HTTP error! status: ${status}`;
                const err: any = new Error(message);
                err.status = status;
                err.url = url;
                err.response = error.response?.data;
                console.error('[api] Error response:', { url, status, response: error.response?.data });
                throw err;
            },
        );
    }

    /** Save the application's backend token (JWT) in localStorage and use it for requests */
    public setBackendAuthToken(token: string | null) {
        this.inMemoryBackendToken = token;
        if (this.persistTokens) {
            if (token) localStorage.setItem('backendAuthToken', token);
            else localStorage.removeItem('backendAuthToken');
        }
    }

    public setBackendRefreshToken(token: string | null) {
        this.inMemoryBackendRefreshToken = token;
        if (this.persistTokens) {
            if (token) localStorage.setItem('backendRefreshToken', token);
            else localStorage.removeItem('backendRefreshToken');
        }
    }

    public clearBackendRefreshToken() {
        this.inMemoryBackendRefreshToken = null;
        if (this.persistTokens) localStorage.removeItem('backendRefreshToken');
    }

    /** Clear auth tokens from memory and storage (client-side cleanup) */
    public clearAuthState() {
        this.setBackendAuthToken(null);
        this.clearBackendRefreshToken();
        if (this.persistTokens) {
            localStorage.removeItem('backendAuthToken');
            localStorage.removeItem('backendRefreshToken');
        }
    }

    /** Force refresh the backend JWT using the backend refresh endpoint (cookie or token-based). */
    public async refreshAuthToken(): Promise<string | null> {
        try {
            // Prefer backend refresh token passed in-memory or persisted
            const refreshToken =
                this.inMemoryBackendRefreshToken ??
                (this.persistTokens ? localStorage.getItem('backendRefreshToken') : null);
            try {
                const resp = await this.makeRequest<RefreshTokenResponse>('/auth/refresh', {
                    method: 'POST',
                    data: refreshToken ? { token: refreshToken } : {},
                });
                if (resp?.token) {
                    this.setBackendAuthToken(resp.token);
                    this.setBackendRefreshToken(resp.refresh ?? null);
                    return resp.token;
                }
            } catch (ex) {
                console.warn('Backend refresh failed:', ex);
            }
        } catch (e) {
            console.warn('Unable to refresh auth token:', e);
        }
        return null;
    }

    private async getAuthToken(): Promise<string | null> {
        // Prefer backend-issued JWT
        // Prefer backend-issued JWT in memory, then persisted
        if (this.inMemoryBackendToken) return this.inMemoryBackendToken;
        if (this.persistTokens) {
            const backendToken = localStorage.getItem('backendAuthToken');
            if (backendToken) return backendToken;
        }
        return null;
    }

    private async makeRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        // Log API call for debugging duplicate calls
        logApiCall(endpoint, config.method || 'GET');

        const response = await this.axiosInstance.request<T>({
            url: endpoint,
            ...config,
        });

        return response.data;
    }

    // AI endpoints
    async analyzeConsumptionData(data: AnalyzeConsumptionRequest): Promise<AnalyzeConsumptionDataOutput> {
        return this.makeRequest<AnalyzeConsumptionDataOutput>('/ai/analyze-consumption', {
            method: 'POST',
            data: data,
        });
    }

    async extractDataFromPdf(data: ExtractDataFromPdfRequest): Promise<ExtractProductDataOutput> {
        return this.makeRequest<ExtractProductDataOutput>('/ai/extract-from-pdf', {
            method: 'POST',
            data: data,
        });
    }

    async extractDataFromPage(data: ExtractDataFromPageRequest): Promise<ExtractProductDataOutput> {
        return this.makeRequest<ExtractProductDataOutput>('/ai/extract-from-page', {
            method: 'POST',
            data: data,
        });
    }

    async extractProductData(data: ExtractProductDataRequest): Promise<ExtractProductDataOutput> {
        return this.makeRequest<ExtractProductDataOutput>('/ai/extract-from-product-qr', {
            method: 'POST',
            data: data,
        });
    }

    async suggestMissingItems(data: SuggestMissingItemsRequest): Promise<SuggestMissingItemsOutput> {
        return this.makeRequest<SuggestMissingItemsOutput>('/ai/suggest-missing-items', {
            method: 'POST',
            data: data,
        });
    }

    // Families endpoints
    async createFamily(data: CreateFamilyRequest): Promise<Family> {
        return this.makeRequest<Family>('/families', {
            method: 'POST',
            data: data,
        });
    }

    async getFamily(id: string): Promise<Family> {
        return this.makeRequest<Family>(`/families/${id}`);
    }

    async updateFamily(id: string, data: UpdateFamilyRequest): Promise<Family> {
        return this.makeRequest<Family>(`/families/${id}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deleteFamily(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${id}`, {
            method: 'DELETE',
        });
    }

    // Users endpoints
    async createUser(data: CreateUserRequest): Promise<User> {
        return this.makeRequest<User>('/users', {
            method: 'POST',
            data: data,
        });
    }

    async getUser(id: string): Promise<User> {
        return this.makeRequest<User>(`/users/${id}`);
    }

    async getMe(): Promise<MeResponse> {
        return this.makeRequest<MeResponse>('/auth/me');
    }

    async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
        return this.makeRequest<User>(`/users/${id}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deleteUser(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async deleteAllUserData(id: string): Promise<{ message: string; transferredFamilyTo?: string }> {
        return this.makeRequest<{ message: string; transferredFamilyTo?: string }>(`/auth/data`, {
            method: 'DELETE',
        });
    }

    async deleteUserAccountAndData(id: string): Promise<{ message: string; transferredFamilyTo?: string }> {
        return this.makeRequest<{ message: string; transferredFamilyTo?: string }>(`/auth/account`, {
            method: 'DELETE',
        });
    }

    // Products endpoints
    async getProducts(): Promise<Product[]> {
        return this.makeRequest<Product[]>('/products');
    }

    async createProduct(data: CreateProductRequest): Promise<Product> {
        return this.makeRequest<Product>('/products', {
            method: 'POST',
            data: data,
        });
    }

    async getProduct(id: string): Promise<Product> {
        return this.makeRequest<Product>(`/products/${id}`);
    }

    // Stores endpoints
    async getStores(): Promise<Store[]> {
        return this.makeRequest<Store[]>('/stores');
    }

    async createStore(data: CreateStoreRequest): Promise<Store> {
        return this.makeRequest<Store>('/stores', {
            method: 'POST',
            data: data,
        });
    }

    async getStore(id: string): Promise<Store> {
        return this.makeRequest<Store>(`/stores/${id}`);
    }

    // Store Preferences endpoints
    async getStorePreferences(familyId: string): Promise<StorePreference[]> {
        return this.makeRequest<StorePreference[]>(`/families/${familyId}/store-preferences`);
    }

    async getFavoriteStores(familyId: string): Promise<StorePreference[]> {
        return this.makeRequest<StorePreference[]>(`/families/${familyId}/store-preferences/favorites`);
    }

    async getIgnoredStores(familyId: string): Promise<StorePreference[]> {
        return this.makeRequest<StorePreference[]>(`/families/${familyId}/store-preferences/ignored`);
    }

    async createStorePreference(familyId: string, data: CreateStorePreferenceRequest): Promise<StorePreference> {
        return this.makeRequest<StorePreference>(`/families/${familyId}/store-preferences`, {
            method: 'POST',
            data: data,
        });
    }

    async getStorePreference(familyId: string, storeId: string): Promise<StorePreference> {
        return this.makeRequest<StorePreference>(`/families/${familyId}/store-preferences/${storeId}`);
    }

    async updateStorePreference(
        familyId: string,
        storeId: string,
        data: UpdateStorePreferenceRequest,
    ): Promise<StorePreference> {
        return this.makeRequest<StorePreference>(`/families/${familyId}/store-preferences/${storeId}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deleteStorePreference(familyId: string, storeId: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/store-preferences/${storeId}`, {
            method: 'DELETE',
        });
    }

    // Purchases endpoints
    async getPurchases(familyId: string): Promise<Purchase[]> {
        return this.makeRequest<Purchase[]>(`/families/${familyId}/purchases`);
    }

    async getPurchasesByMonth(familyId: string): Promise<MonthlyPurchaseGroup[]> {
        return this.makeRequest<MonthlyPurchaseGroup[]>(`/families/${familyId}/purchases/by-month`);
    }

    async getAvailableMonths(familyId: string): Promise<AvailableMonth[]> {
        return this.makeRequest<AvailableMonth[]>(`/families/${familyId}/purchases/available-months`);
    }

    async getAvailableMonthsSummary(familyId: string): Promise<AvailableMonthsSummary> {
        return this.makeRequest<AvailableMonthsSummary>(`/families/${familyId}/purchases/available-months/summary`);
    }

    async createPurchase(familyId: string, data: CreatePurchaseRequest): Promise<Purchase> {
        return this.makeRequest<Purchase>(`/families/${familyId}/purchases`, {
            method: 'POST',
            data: data,
        });
    }

    async getPurchase(familyId: string, id: string): Promise<Purchase> {
        return this.makeRequest<Purchase>(`/families/${familyId}/purchases/${id}`);
    }

    async updatePurchase(familyId: string, id: string, data: UpdatePurchaseRequest): Promise<Purchase> {
        return this.makeRequest<Purchase>(`/families/${familyId}/purchases/${id}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deletePurchase(familyId: string, id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/purchases/${id}`, {
            method: 'DELETE',
        });
    }

    // Auth endpoints
    async revoke(): Promise<RevokeTokenResponse> {
        return this.makeRequest<RevokeTokenResponse>('/auth/revoke', { method: 'POST' });
    }

    // Backend auth
    async signUp(data: SignUpRequest): Promise<AuthResponse> {
        const resp = await this.makeRequest<AuthResponse>('/auth/signup', { method: 'POST', data });
        await this.handleAuthResponse(resp);
        return resp;
    }

    async signIn(data: SignInRequest): Promise<AuthResponse> {
        const resp = await this.makeRequest<AuthResponse>('/auth/signin', { method: 'POST', data });
        await this.handleAuthResponse(resp);
        return resp;
    }

    /**
     * New helper matching backend signIn signature: email, password, totp?
     * Returns backend response and stores tokens/uid automatically.
     */
    async login(email: string, password: string, totp?: string): Promise<AuthResponse> {
        const resp = await this.makeRequest<AuthResponse>('/auth/signin', {
            method: 'POST',
            data: JSON.stringify({ email, password, totp }),
        });
        await this.handleAuthResponse(resp);
        return resp;
    }

    /**
     * Parse authentication response from backend and persist tokens.
     * Expected shape: { token?: string, refresh?: string, user?: {...} }
     */
    private async handleAuthResponse(resp: AuthResponse) {
        if (!resp) return;
        try {
            if (resp.token) {
                this.setBackendAuthToken(resp.token);
            }
            if (resp.refresh) {
                this.setBackendRefreshToken(resp.refresh);
            }
            if (resp.uid) {
                // store user id for convenience
                try {
                    this.inMemoryBackendUserUid = resp.uid;
                    if (this.persistTokens) localStorage.setItem('backendUserUid', resp.uid);
                } catch (e) {
                    /* ignore */
                }
            }
            // Optionally persist tokens if configured
            if (this.persistTokens) {
                if (resp.token) localStorage.setItem('backendAuthToken', resp.token);
                if (resp.refresh) localStorage.setItem('backendRefreshToken', resp.refresh);
            }
        } catch (e) {
            console.warn('Error handling auth response:', e);
        }
    }

    private inMemoryBackendUserUid: string | null = null;

    /** Return the stored backend user UID (if any) */
    public getCurrentUid(): string | null {
        if (this.inMemoryBackendUserUid) return this.inMemoryBackendUserUid;
        if (this.persistTokens) return localStorage.getItem('backendUserUid');
        return null;
    }

    /** Return stored tokens for debugging or consumption */
    public getStoredTokens() {
        return {
            token: this.inMemoryBackendToken ?? (this.persistTokens ? localStorage.getItem('backendAuthToken') : null),
            refresh:
                this.inMemoryBackendRefreshToken ??
                (this.persistTokens ? localStorage.getItem('backendRefreshToken') : null),
            uid: this.getCurrentUid(),
        };
    }

    // Pantry Items endpoints
    async getPantryItems(familyId: string): Promise<PantryItem[]> {
        return this.makeRequest<PantryItem[]>(`/families/${familyId}/pantry-items`);
    }

    async createPantryItem(familyId: string, data: CreatePantryItemRequest): Promise<PantryItem> {
        return this.makeRequest<PantryItem>(`/families/${familyId}/pantry-items`, {
            method: 'POST',
            data: data,
        });
    }

    async getPantryItem(familyId: string, id: string): Promise<PantryItem> {
        return this.makeRequest<PantryItem>(`/families/${familyId}/pantry-items/${id}`);
    }

    async updatePantryItem(familyId: string, id: string, data: UpdatePantryItemRequest): Promise<PantryItem> {
        return this.makeRequest<PantryItem>(`/families/${familyId}/pantry-items/${id}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deletePantryItem(familyId: string, id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/pantry-items/${id}`, {
            method: 'DELETE',
        });
    }

    // Shopping Lists endpoints
    async getShoppingLists(familyId: string): Promise<ShoppingList[]> {
        return this.makeRequest<ShoppingList[]>(`/families/${familyId}/shopping-lists`);
    }

    async createShoppingList(familyId: string, data: CreateShoppingListRequest): Promise<ShoppingList> {
        return this.makeRequest<ShoppingList>(`/families/${familyId}/shopping-lists/ai`, {
            method: 'POST',
            data: data,
        });
    }

    async getShoppingList(familyId: string, id: string): Promise<ShoppingList> {
        return this.makeRequest<ShoppingList>(`/families/${familyId}/shopping-lists/${id}`);
    }

    async updateShoppingList(familyId: string, id: string, data: UpdateShoppingListRequest): Promise<ShoppingList> {
        return this.makeRequest<ShoppingList>(`/families/${familyId}/shopping-lists/${id}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deleteShoppingList(familyId: string, id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/shopping-lists/${id}`, {
            method: 'DELETE',
        });
    }

    // Shopping List Items endpoints
    async getShoppingListItems(familyId: string, listId: string): Promise<ShoppingListItem[]> {
        return this.makeRequest<ShoppingListItem[]>(`/families/${familyId}/shopping-lists/${listId}/items`);
    }

    async createShoppingListItem(
        familyId: string,
        listId: string,
        data: CreateShoppingListItemRequest,
    ): Promise<ShoppingListItem> {
        return this.makeRequest<ShoppingListItem>(`/families/${familyId}/shopping-lists/${listId}/items`, {
            method: 'POST',
            data: data,
        });
    }

    async updateShoppingListItem(
        familyId: string,
        listId: string,
        itemId: string,
        data: UpdateShoppingListItemRequest,
    ): Promise<ShoppingListItem> {
        return this.makeRequest<ShoppingListItem>(`/families/${familyId}/shopping-lists/${listId}/items/${itemId}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deleteShoppingListItem(familyId: string, listId: string, itemId: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/shopping-lists/${listId}/items/${itemId}`, {
            method: 'DELETE',
        });
    }

    // Notifications endpoints
    async getNotifications(familyId: string): Promise<Notification[]> {
        return this.makeRequest<Notification[]>(`/families/${familyId}/notifications`);
    }

    async createNotification(familyId: string, data: CreateNotificationRequest): Promise<Notification> {
        return this.makeRequest<Notification>(`/families/${familyId}/notifications`, {
            method: 'POST',
            data: data,
        });
    }

    async markNotificationAsRead(familyId: string, notificationId: string): Promise<MarkNotificationAsReadResponse> {
        return this.makeRequest<MarkNotificationAsReadResponse>(
            `/families/${familyId}/notifications/${notificationId}/read`,
            {
                method: 'PATCH',
            },
        );
    }

    async markAllNotificationsAsRead(familyId: string): Promise<MarkAllNotificationsAsReadResponse> {
        return this.makeRequest<MarkAllNotificationsAsReadResponse>(
            `/families/${familyId}/notifications/mark-all-read`,
            {
                method: 'PATCH',
            },
        );
    }

    async deleteNotification(familyId: string, notificationId: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/notifications/${notificationId}`, {
            method: 'DELETE',
        });
    }

    // Purchase Items endpoints
    async getPurchaseItems(familyId: string, purchaseId: string): Promise<PurchaseItem[]> {
        return this.makeRequest<PurchaseItem[]>(`/families/${familyId}/purchases/${purchaseId}/items`);
    }

    async createPurchaseItem(
        familyId: string,
        purchaseId: string,
        data: CreatePurchaseItemRequest,
    ): Promise<PurchaseItem> {
        return this.makeRequest<PurchaseItem>(`/families/${familyId}/purchases/${purchaseId}/items`, {
            method: 'POST',
            data: data,
        });
    }

    async updatePurchaseItem(
        familyId: string,
        purchaseId: string,
        itemId: string,
        data: UpdatePurchaseItemRequest,
    ): Promise<PurchaseItem> {
        return this.makeRequest<PurchaseItem>(`/families/${familyId}/purchases/${purchaseId}/items/${itemId}`, {
            method: 'PATCH',
            data: data,
        });
    }

    async deletePurchaseItem(familyId: string, purchaseId: string, itemId: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/families/${familyId}/purchases/${purchaseId}/items/${itemId}`, {
            method: 'DELETE',
        });
    }

    async bulkUpdatePurchaseItems(
        familyId: string,
        purchaseId: string,
        items: CreatePurchaseItemRequest[],
    ): Promise<BulkUpdatePurchaseItemsResponse> {
        return this.makeRequest<BulkUpdatePurchaseItemsResponse>(
            `/families/${familyId}/purchases/${purchaseId}/items/bulk`,
            {
                method: 'PATCH',
                data: { items },
            },
        );
    }

    async bulkDeletePurchaseItems(
        familyId: string,
        purchaseId: string,
        itemIds: string[],
    ): Promise<BulkDeletePurchaseItemsResponse> {
        return this.makeRequest<BulkDeletePurchaseItemsResponse>(
            `/families/${familyId}/purchases/${purchaseId}/items/bulk`,
            {
                method: 'DELETE',
                data: { itemIds },
            },
        );
    }

    // ===============================
    // Finance Methods
    // ===============================

    // Expense methods
    async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.makeRequest<Expense[]>(`/expenses?${queryParams.toString()}`);
    }

    async createExpense(data: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        return this.makeRequest<Expense>('/expenses', {
            method: 'POST',
            data,
        });
    }

    async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
        return this.makeRequest<Expense>(`/expenses/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteExpense(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/expenses/${id}`, {
            method: 'DELETE',
        });
    }

    async getExpensesSummary(month?: string): Promise<ExpensesSummary> {
        const query = month ? `?month=${month}` : '';
        return this.makeRequest<ExpensesSummary>(`/expenses/summary${query}`);
    }

    async getMonthlyExpenses(yearMonth: string): Promise<ExpensesSummary> {
        return this.makeRequest<ExpensesSummary>(`/expenses/monthly/${yearMonth}`);
    }

    // Account methods
    async getAccounts(): Promise<Account[]> {
        return this.makeRequest<Account[]>('/accounts');
    }

    async createAccount(data: Omit<Account, '_id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
        return this.makeRequest<Account>('/accounts', {
            method: 'POST',
            data,
        });
    }

    async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
        return this.makeRequest<Account>(`/accounts/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteAccount(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/accounts/${id}`, {
            method: 'DELETE',
        });
    }

    async getAccountSummary(): Promise<AccountSummary> {
        return this.makeRequest<AccountSummary>('/accounts/summary');
    }

    async getTotalBalance(): Promise<{ totalBalance: number }> {
        return this.makeRequest<{ totalBalance: number }>('/accounts/balance');
    }

    // Category methods
    async getCategories(): Promise<Category[]> {
        return this.makeRequest<Category[]>('/categories');
    }

    async createCategory(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
        return this.makeRequest<Category>('/categories', {
            method: 'POST',
            data,
        });
    }

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        return this.makeRequest<Category>(`/categories/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteCategory(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/categories/${id}`, {
            method: 'DELETE',
        });
    }

    // Investment methods
    async getInvestments(): Promise<Investment[]> {
        return this.makeRequest<Investment[]>('/investments');
    }

    async createInvestment(data: Omit<Investment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Investment> {
        return this.makeRequest<Investment>('/investments', {
            method: 'POST',
            data,
        });
    }

    async updateInvestment(id: string, data: Partial<Investment>): Promise<Investment> {
        return this.makeRequest<Investment>(`/investments/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteInvestment(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/investments/${id}`, {
            method: 'DELETE',
        });
    }

    async getInvestmentPortfolio(): Promise<InvestmentPortfolio> {
        return this.makeRequest<InvestmentPortfolio>('/investments/portfolio');
    }

    async getInvestmentSummary(): Promise<InvestmentSummary> {
        return this.makeRequest<InvestmentSummary>('/investments/summary');
    }

    async createInvestmentTransaction(
        data: Omit<InvestmentTransaction, '_id' | 'createdAt' | 'updatedAt'>,
    ): Promise<InvestmentTransaction> {
        return this.makeRequest<InvestmentTransaction>('/investments/transactions', {
            method: 'POST',
            data,
        });
    }

    async getInvestmentTransactions(investmentId: string): Promise<InvestmentTransaction[]> {
        return this.makeRequest<InvestmentTransaction[]>(`/investments/${investmentId}/transactions`);
    }

    async updatePrices(prices: Record<string, number>): Promise<{ updated: number }> {
        return this.makeRequest<{ updated: number }>('/investments/update-prices', {
            method: 'POST',
            data: { prices },
        });
    }

    // Credit Card methods
    async getCreditCards(): Promise<CreditCard[]> {
        return this.makeRequest<CreditCard[]>('/credit-cards');
    }

    async createCreditCard(data: Omit<CreditCard, '_id' | 'createdAt' | 'updatedAt'>): Promise<CreditCard> {
        return this.makeRequest<CreditCard>('/credit-cards', {
            method: 'POST',
            data,
        });
    }

    async updateCreditCard(id: string, data: Partial<CreditCard>): Promise<CreditCard> {
        return this.makeRequest<CreditCard>(`/credit-cards/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteCreditCard(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/credit-cards/${id}`, {
            method: 'DELETE',
        });
    }

    async generateInvoice(cardId: string, month: string): Promise<CreditCardInvoice> {
        return this.makeRequest<CreditCardInvoice>(`/credit-cards/${cardId}/invoices/${month}`);
    }

    // Budget methods
    async getBudgets(): Promise<Budget[]> {
        return this.makeRequest<Budget[]>('/budgets');
    }

    async createBudget(data: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
        return this.makeRequest<Budget>('/budgets', {
            method: 'POST',
            data,
        });
    }

    async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
        return this.makeRequest<Budget>(`/budgets/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteBudget(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/budgets/${id}`, {
            method: 'DELETE',
        });
    }

    async getBudgetProgress(): Promise<BudgetProgress[]> {
        return this.makeRequest<BudgetProgress[]>('/budgets/progress');
    }

    // Goal methods
    async getGoals(): Promise<Goal[]> {
        return this.makeRequest<Goal[]>('/goals');
    }

    async createGoal(data: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
        return this.makeRequest<Goal>('/goals', {
            method: 'POST',
            data,
        });
    }

    async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
        return this.makeRequest<Goal>(`/goals/${id}`, {
            method: 'PATCH',
            data,
        });
    }

    async deleteGoal(id: string): Promise<DeleteResponse> {
        return this.makeRequest<DeleteResponse>(`/goals/${id}`, {
            method: 'DELETE',
        });
    }

    async createGoalDeposit(data: Omit<GoalDeposit, '_id' | 'createdAt' | 'updatedAt'>): Promise<GoalDeposit> {
        return this.makeRequest<GoalDeposit>(`/goals/deposits`, {
            method: 'POST',
            data,
        });
    }

    async getGoalProgress(): Promise<GoalProgress[]> {
        return this.makeRequest<GoalProgress[]>('/goals/progress');
    }

    // Subscription methods
    async getCurrentSubscription(): Promise<Subscription | null> {
        return this.makeRequest<Subscription | null>('/subscriptions/current');
    }

    async getUserFeatures(): Promise<UserFeatures> {
        return this.makeRequest<UserFeatures>('/subscriptions/features');
    }

    async getSubscriptionStatus(): Promise<{
        hasActiveSubscription: boolean;
        isTrial: boolean;
        daysRemaining: number;
        planName?: string;
    }> {
        return this.makeRequest<{
            hasActiveSubscription: boolean;
            isTrial: boolean;
            daysRemaining: number;
            planName?: string;
        }>('/subscriptions/status');
    }

    async upgradeSubscription(planId: string): Promise<Subscription> {
        return this.makeRequest<Subscription>(`/subscriptions/upgrade/${planId}`, {
            method: 'POST',
        });
    }

    async cancelSubscription(subscriptionId: string): Promise<Subscription> {
        return this.makeRequest<Subscription>(`/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
        });
    }

    async getPlans(): Promise<Plan[]> {
        return this.makeRequest<Plan[]>('/subscriptions/plans');
    }

    // Gamification methods
    async getAchievements(): Promise<Achievement[]> {
        return this.makeRequest<Achievement[]>('/achievements');
    }

    async getUserStats(): Promise<UserStats> {
        return this.makeRequest<UserStats>('/users/stats');
    }

    // Education methods
    async getEducationalContent(): Promise<EducationalContent[]> {
        return this.makeRequest<EducationalContent[]>('/education/content');
    }

    async markContentAsRead(contentId: string): Promise<{ success: boolean }> {
        return this.makeRequest<{ success: boolean }>(`/education/content/${contentId}/read`, {
            method: 'POST',
        });
    }

    async bookmarkContent(contentId: string): Promise<{ success: boolean }> {
        return this.makeRequest<{ success: boolean }>(`/education/content/${contentId}/bookmark`, {
            method: 'POST',
        });
    }

    // Bank Integration methods
    async getBankAccounts(): Promise<BankAccount[]> {
        return this.makeRequest<BankAccount[]>('/bank-accounts');
    }

    async syncBankAccount(accountId: string): Promise<{ synced: number }> {
        return this.makeRequest<{ synced: number }>(`/bank-accounts/${accountId}/sync`, {
            method: 'POST',
        });
    }

    async getBankTransactions(accountId: string): Promise<BankTransaction[]> {
        return this.makeRequest<BankTransaction[]>(`/bank-accounts/${accountId}/transactions`);
    }

    // Balance Projection methods
    async getBalanceProjection(period: '3months' | '6months' | '1year'): Promise<BalanceProjection> {
        return this.makeRequest<BalanceProjection>(`/balances/projection?period=${period}`);
    }

    // ===============================
    // Webcrawler Methods
    // ===============================

    async crawlNfce(request: CrawlNfceRequest): Promise<CrawlNfceResponse> {
        return this.makeRequest<CrawlNfceResponse>('/webcrawler/nfce', {
            method: 'POST',
            data: request,
        });
    }

    async crawlAndEnhanceNfce(request: CrawlNfceRequest): Promise<CrawlAndEnhanceNfceResponse> {
        return this.makeRequest<CrawlAndEnhanceNfceResponse>('/webcrawler/nfce/enhanced', {
            method: 'POST',
            data: request,
        });
    }

    // ===============================
    // Payment Methods
    // ===============================

    /**
     * Create a new checkout session
     */
    async createCheckout(request: CreateCheckoutRequest): Promise<CheckoutResponse> {
        logApiCall('/payments/checkout', 'POST');
        return this.makeRequest<CheckoutResponse>('/payments/checkout', {
            method: 'POST',
            data: request,
        });
    }

    /**
     * Get payment status by transaction ID
     */
    async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
        logApiCall(`/payments/${transactionId}/status`);
        return this.makeRequest<PaymentStatusResponse>(`/payments/${transactionId}/status`);
    }

    /**
     * List user payments with pagination
     */
    async listUserPayments(params?: PaymentListParams): Promise<UserPaymentListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const url = `/payments/user/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        logApiCall(url);
        return this.makeRequest<UserPaymentListResponse>(url);
    }

    /**
     * Force poll a specific transaction (for testing/debugging)
     */
    async forcePollTransaction(transactionId: string): Promise<{ message: string }> {
        logApiCall(`/payments/${transactionId}/force-poll`, 'POST');
        return this.makeRequest<{ message: string }>(`/payments/${transactionId}/force-poll`, {
            method: 'POST',
        });
    }

    /**
     * Get polling service status
     */
    async getPollingStatus(): Promise<PollStatusResponse> {
        logApiCall('/payments/polling/status');
        return this.makeRequest<PollStatusResponse>('/payments/polling/status');
    }

    // Purchase methods
    async getAllFamilyPurchaseItems(familyId: string): Promise<{
        [monthYear: string]: {
            [purchaseId: string]: {
                purchaseInfo: {
                    date: string;
                    storeName?: string;
                    storeId: string;
                    totalAmount?: number;
                    purchasedBy: string;
                };
                items: Array<{
                    productId: string;
                    name: string;
                    description?: string;
                    barcode?: string;
                    brand?: string;
                    category: string;
                    subCategory?: string;
                    unit: string;
                    quantity: number;
                    price: number;
                    total: number;
                }>;
            };
        };
    }> {
        return this.makeRequest(`/families/${familyId}/purchases/family-items`);
    }
}

export const apiService = new ApiService();

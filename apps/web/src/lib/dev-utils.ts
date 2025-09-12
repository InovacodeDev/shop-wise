/**
 * Development utilities to help debug duplicate API calls
 */

let callCounter = new Map<string, number>();

/**
 * Logs API calls with a counter to help identify duplicates in development
 */
export function logApiCall(endpoint: string, method: string = 'GET') {
    if (import.meta.env.DEV) {
        const key = `${method} ${endpoint}`;
        const count = (callCounter.get(key) || 0) + 1;
        callCounter.set(key, count);
        
        console.log(`[API Call #${count}] ${key}`);
        
        if (count > 1) {
            console.warn(`⚠️  Duplicate API call detected: ${key} (call #${count})`);
            console.trace('Call stack:');
        }
    }
}

/**
 * Resets the call counter (useful for testing)
 */
export function resetApiCallCounter() {
    callCounter.clear();
}

/**
 * Gets the current call counts (useful for debugging)
 */
export function getApiCallCounts() {
    return Object.fromEntries(callCounter.entries());
}
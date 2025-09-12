import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPurchasesByMonth } from './purchaseApiService';
import { apiService } from './api';

// Mock the API service
vi.mock('./api', () => ({
    apiService: {
        getPurchasesByMonth: vi.fn(),
    },
}));

const mockApiService = vi.mocked(apiService);

describe('purchaseApiService - Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPurchasesByMonth', () => {
        const familyId = 'test-family-id';

        it('should handle network errors with appropriate message', async () => {
            const networkError = new Error('Network Error');
            networkError.code = 'NETWORK_ERROR';
            mockApiService.getPurchasesByMonth.mockRejectedValue(networkError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Network connection failed. Please check your internet connection'
            );
        });

        it('should handle timeout errors with appropriate message', async () => {
            const timeoutError = new Error('Request timeout');
            mockApiService.getPurchasesByMonth.mockRejectedValue(timeoutError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Request timed out. Please try again'
            );
        });

        it('should handle 400 Bad Request errors', async () => {
            const badRequestError = new Error('Bad Request');
            (badRequestError as any).status = 400;
            mockApiService.getPurchasesByMonth.mockRejectedValue(badRequestError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Invalid family ID provided'
            );
        });

        it('should handle 401 Unauthorized errors', async () => {
            const unauthorizedError = new Error('Unauthorized');
            (unauthorizedError as any).status = 401;
            mockApiService.getPurchasesByMonth.mockRejectedValue(unauthorizedError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Authentication required to access purchase data'
            );
        });

        it('should handle 403 Forbidden errors', async () => {
            const forbiddenError = new Error('Forbidden');
            (forbiddenError as any).status = 403;
            mockApiService.getPurchasesByMonth.mockRejectedValue(forbiddenError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Authentication required to access purchase data'
            );
        });

        it('should handle 404 Not Found errors', async () => {
            const notFoundError = new Error('Not Found');
            (notFoundError as any).status = 404;
            mockApiService.getPurchasesByMonth.mockRejectedValue(notFoundError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Family not found'
            );
        });

        it('should handle 500 Internal Server Error', async () => {
            const serverError = new Error('Internal Server Error');
            (serverError as any).status = 500;
            mockApiService.getPurchasesByMonth.mockRejectedValue(serverError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Server error occurred while fetching purchases'
            );
        });

        it('should mark retryable errors correctly', async () => {
            const retryableStatuses = [408, 429, 500, 502, 503, 504];
            
            for (const status of retryableStatuses) {
                const error = new Error(`HTTP ${status}`);
                (error as any).status = status;
                mockApiService.getPurchasesByMonth.mockRejectedValue(error);

                try {
                    await getPurchasesByMonth(familyId);
                } catch (thrownError: any) {
                    expect(thrownError.isRetryable).toBe(true);
                }
            }
        });

        it('should mark network errors as retryable', async () => {
            const networkError = new Error('Network Error');
            mockApiService.getPurchasesByMonth.mockRejectedValue(networkError);

            try {
                await getPurchasesByMonth(familyId);
            } catch (thrownError: any) {
                expect(thrownError.isRetryable).toBe(true);
            }
        });

        it('should mark timeout errors as retryable', async () => {
            const timeoutError = new Error('Request timeout');
            mockApiService.getPurchasesByMonth.mockRejectedValue(timeoutError);

            try {
                await getPurchasesByMonth(familyId);
            } catch (thrownError: any) {
                expect(thrownError.isRetryable).toBe(true);
            }
        });

        it('should not mark client errors as retryable', async () => {
            const clientErrors = [400, 401, 403, 404];
            
            for (const status of clientErrors) {
                const error = new Error(`HTTP ${status}`);
                (error as any).status = status;
                mockApiService.getPurchasesByMonth.mockRejectedValue(error);

                try {
                    await getPurchasesByMonth(familyId);
                } catch (thrownError: any) {
                    expect(thrownError.isRetryable).toBeFalsy();
                }
            }
        });

        it('should preserve original error as cause', async () => {
            const originalError = new Error('Original error');
            (originalError as any).status = 500;
            (originalError as any).customProperty = 'test';
            mockApiService.getPurchasesByMonth.mockRejectedValue(originalError);

            try {
                await getPurchasesByMonth(familyId);
            } catch (thrownError: any) {
                expect(thrownError.cause).toBe(originalError);
                expect(thrownError.status).toBe(500);
            }
        });

        it('should handle errors without status codes', async () => {
            const genericError = new Error('Something went wrong');
            mockApiService.getPurchasesByMonth.mockRejectedValue(genericError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Failed to fetch monthly purchases: Something went wrong'
            );
        });

        it('should handle errors without messages', async () => {
            const errorWithoutMessage = new Error();
            mockApiService.getPurchasesByMonth.mockRejectedValue(errorWithoutMessage);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Failed to fetch monthly purchases'
            );
        });

        it('should handle non-Error objects thrown', async () => {
            const stringError = 'String error';
            mockApiService.getPurchasesByMonth.mockRejectedValue(stringError);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Failed to fetch monthly purchases'
            );
        });

        it('should handle null/undefined errors', async () => {
            mockApiService.getPurchasesByMonth.mockRejectedValue(null);

            await expect(getPurchasesByMonth(familyId)).rejects.toThrow(
                'Failed to fetch monthly purchases'
            );
        });

        it('should log errors for debugging', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Test error');
            mockApiService.getPurchasesByMonth.mockRejectedValue(error);

            try {
                await getPurchasesByMonth(familyId);
            } catch {
                // Expected to throw
            }

            expect(consoleSpy).toHaveBeenCalledWith('Error fetching purchases by month:', error);
            consoleSpy.mockRestore();
        });
    });
});
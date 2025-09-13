import { useCallback, useState } from 'react';

/**
 * Hook para gerenciar estados de loading em operações assíncronas (como chamadas de API)
 *
 * @returns Objeto com estado de loading e função para executar operações assíncronas
 */
export function useAsyncOperation() {
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(
        async <T>(
            operation: () => Promise<T>,
            onSuccess?: (result: T) => void,
            onError?: (error: Error) => void,
        ): Promise<T | undefined> => {
            if (isLoading) {
                return; // Previne execução múltipla
            }

            setIsLoading(true);
            try {
                const result = await operation();
                onSuccess?.(result);
                return result;
            } catch (error) {
                const err = error instanceof Error ? error : new Error('An unknown error occurred');
                onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading],
    );

    return {
        isLoading,
        execute,
    };
}

/**
 * Hook mais específico para operações com toast de erro automático
 */
export function useAsyncOperationWithToast() {
    const { isLoading, execute } = useAsyncOperation();

    const executeWithToast = useCallback(
        async <T>(
            operation: () => Promise<T>,
            options?: {
                onSuccess?: (result: T) => void;
                onError?: (error: Error) => void;
                successToast?: { title: string; description?: string };
                errorToast?: { title: string; description?: string };
            },
        ): Promise<T | undefined> => {
            return execute(
                operation,
                (result) => {
                    options?.onSuccess?.(result);
                    if (options?.successToast) {
                        // Note: Toast implementation should be injected or imported
                        // For now, just call the success callback
                    }
                },
                (error) => {
                    options?.onError?.(error);
                    if (options?.errorToast) {
                        // Note: Toast implementation should be injected or imported
                        // For now, just call the error callback
                    }
                },
            );
        },
        [execute],
    );

    return {
        isLoading,
        execute: executeWithToast,
    };
}

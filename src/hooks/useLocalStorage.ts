/**
 * Custom hook for managing localStorage with error handling and validation
 *
 * This hook provides a React-friendly interface for localStorage operations,
 * including automatic serialization, error handling, and graceful degradation
 * when localStorage is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Options for useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
    /**
     * Validation function to check if loaded data is valid
     */
    validate?: (data: unknown) => data is T;

    /**
     * Migration function to transform old data formats
     */
    migrate?: (data: unknown) => T;

    /**
     * Whether to sync changes across tabs/windows
     */
    syncAcrossTabs?: boolean;
}

/**
 * Return type for useLocalStorage hook
 */
export interface UseLocalStorageReturn<T> {
    /**
     * Current value from localStorage
     */
    value: T;

    /**
     * Function to update the stored value
     */
    setValue: (value: T | ((prev: T) => T)) => void;

    /**
     * Loading state indicator
     */
    isLoading: boolean;

    /**
     * Error message if any operation fails
     */
    error: string | null;

    /**
     * Whether localStorage is available
     */
    isAvailable: boolean;
}

/**
 * Custom hook for managing localStorage with error handling
 *
 * @param key - localStorage key to use
 * @param initialValue - Default value if no stored value exists
 * @param options - Configuration options
 * @returns Object containing value, setValue, loading state, and error state
 *
 * @example
 * ```tsx
 * const { value, setValue, error } = useLocalStorage('myKey', [], {
 *   validate: (data): data is MyType[] => Array.isArray(data),
 *   syncAcrossTabs: true
 * });
 * ```
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
    const { validate, migrate, syncAcrossTabs = false } = options;

    // Check if localStorage is available
    const [isAvailable] = useState<boolean>(() => {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [value, setValue] = useState<T>(initialValue);

    // Load initial value from localStorage
    useEffect(() => {
        const loadValue = (): void => {
            if (!isAvailable) {
                setError(
                    'localStorage is not available. Using session-only storage.'
                );
                setIsLoading(false);
                return;
            }

            try {
                const item = localStorage.getItem(key);

                if (item === null) {
                    setIsLoading(false);
                    return;
                }

                const parsed: unknown = JSON.parse(item);

                // Apply migration if provided
                const migratedData = migrate ? migrate(parsed) : parsed;

                // Validate data if validator provided
                if (validate && !validate(migratedData)) {
                    throw new Error('Stored data failed validation');
                }

                setValue(migratedData as T);
                setError(null);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to load data';
                setError(errorMessage);
                console.error(
                    `Error loading from localStorage (key: ${key}):`,
                    err
                );

                // Reset to initial value on error
                setValue(initialValue);
            } finally {
                setIsLoading(false);
            }
        };

        loadValue();
    }, [key, initialValue, isAvailable, validate, migrate]);

    // Save value to localStorage
    const updateValue = useCallback(
        (newValue: T | ((prev: T) => T)): void => {
            try {
                // Handle functional updates
                const valueToStore =
                    newValue instanceof Function ? newValue(value) : newValue;

                setValue(valueToStore);

                if (!isAvailable) {
                    // Still update in-memory state even if localStorage unavailable
                    return;
                }

                const serialized = JSON.stringify(valueToStore);
                localStorage.setItem(key, serialized);
                setError(null);
            } catch (err) {
                if (err instanceof Error && err.name === 'QuotaExceededError') {
                    setError('Storage quota exceeded. Please clear some data.');
                } else {
                    const errorMessage =
                        err instanceof Error
                            ? err.message
                            : 'Failed to save data';
                    setError(errorMessage);
                }
                console.error(
                    `Error saving to localStorage (key: ${key}):`,
                    err
                );
            }
        },
        [key, value, isAvailable]
    );

    // Sync across tabs/windows if enabled
    useEffect(() => {
        if (!syncAcrossTabs || !isAvailable) {
            return;
        }

        const handleStorageChange = (e: StorageEvent): void => {
            if (e.key !== key || e.newValue === null) {
                return;
            }

            try {
                const parsed: unknown = JSON.parse(e.newValue);

                // Apply migration if provided
                const migratedData = migrate ? migrate(parsed) : parsed;

                // Validate data if validator provided
                if (validate && !validate(migratedData)) {
                    console.warn('Synced data failed validation');
                    return;
                }

                setValue(migratedData as T);
                setError(null);
            } catch (err) {
                console.error('Error syncing storage change:', err);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, syncAcrossTabs, isAvailable, validate, migrate]);

    return {
        value,
        setValue: updateValue,
        isLoading,
        error,
        isAvailable,
    };
}

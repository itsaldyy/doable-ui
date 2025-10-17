/**
 * Unit tests for useLocalStorage hook
 *
 * Tests cover:
 * - localStorage read/write operations
 * - Error handling for unavailable storage
 * - Data validation and fallback behavior
 * - Cross-tab synchronization
 * - Quota exceeded scenarios
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
    const TEST_KEY = 'test-key';
    const INITIAL_VALUE = { count: 0 };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Basic functionality', () => {
        it('should return initial value when no stored value exists', () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual(INITIAL_VALUE);
            expect(result.current.error).toBeNull();
            expect(result.current.isAvailable).toBe(true);
        });

        it('should load stored value from localStorage', async () => {
            const storedValue = { count: 42 };
            localStorage.setItem(TEST_KEY, JSON.stringify(storedValue));

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual(storedValue);
            expect(result.current.error).toBeNull();
        });

        it('should save value to localStorage when setValue is called', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const newValue = { count: 99 };

            act(() => {
                result.current.setValue(newValue);
            });

            expect(result.current.value).toEqual(newValue);
            expect(localStorage.getItem(TEST_KEY)).toBe(
                JSON.stringify(newValue)
            );
        });

        it('should support functional updates', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setValue((prev) => ({ count: prev.count + 1 }));
            });

            expect(result.current.value).toEqual({ count: 1 });
        });
    });

    describe('Data validation', () => {
        it('should validate loaded data using provided validator', async () => {
            const invalidData = { invalid: 'data' };
            localStorage.setItem(TEST_KEY, JSON.stringify(invalidData));

            const validator = (data: unknown): data is { count: number } => {
                return (
                    typeof data === 'object' &&
                    data !== null &&
                    'count' in data &&
                    typeof (data as { count: unknown }).count === 'number'
                );
            };

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    validate: validator,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual(INITIAL_VALUE);
            expect(result.current.error).toBeTruthy();
            expect(result.current.error).toContain('validation');
        });

        it('should accept valid data when validator passes', async () => {
            const validData = { count: 42 };
            localStorage.setItem(TEST_KEY, JSON.stringify(validData));

            const validator = (data: unknown): data is { count: number } => {
                return (
                    typeof data === 'object' &&
                    data !== null &&
                    'count' in data &&
                    typeof (data as { count: unknown }).count === 'number'
                );
            };

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    validate: validator,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual(validData);
            expect(result.current.error).toBeNull();
        });
    });

    describe('Data migration', () => {
        it('should migrate old data format using provided migration function', async () => {
            const oldData = { counter: 42 }; // Old format
            localStorage.setItem(TEST_KEY, JSON.stringify(oldData));

            const migrate = (data: unknown): { count: number } => {
                if (
                    typeof data === 'object' &&
                    data !== null &&
                    'counter' in data
                ) {
                    return { count: (data as { counter: number }).counter };
                }
                return { count: 0 };
            };

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, { migrate })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual({ count: 42 });
            expect(result.current.error).toBeNull();
        });
    });

    describe('Error handling', () => {
        it('should handle localStorage unavailability gracefully', async () => {
            // Mock localStorage to throw error
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
            setItemSpy.mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should still work with in-memory state
            act(() => {
                result.current.setValue({ count: 10 });
            });

            expect(result.current.value).toEqual({ count: 10 });

            setItemSpy.mockRestore();
        });

        it('should handle quota exceeded error', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Mock quota exceeded error
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
            const quotaError = new Error('QuotaExceededError');
            quotaError.name = 'QuotaExceededError';
            setItemSpy.mockImplementation(() => {
                throw quotaError;
            });

            act(() => {
                result.current.setValue({ count: 999 });
            });

            expect(result.current.error).toContain('quota');

            setItemSpy.mockRestore();
        });

        it('should handle invalid JSON in localStorage', async () => {
            localStorage.setItem(TEST_KEY, 'invalid json{');

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.value).toEqual(INITIAL_VALUE);
            expect(result.current.error).toBeTruthy();
        });

        it('should set error message when localStorage is unavailable', async () => {
            // Mock localStorage availability check
            const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
            const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

            setItemSpy.mockImplementation(() => {
                throw new Error('Not available');
            });

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAvailable).toBe(false);
            expect(result.current.error).toContain('not available');

            getItemSpy.mockRestore();
            setItemSpy.mockRestore();
            removeItemSpy.mockRestore();
        });
    });

    describe('Cross-tab synchronization', () => {
        it('should sync changes from other tabs when enabled', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    syncAcrossTabs: true,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const newValue = { count: 777 };

            // Simulate storage event from another tab
            act(() => {
                const storageEvent = new StorageEvent('storage', {
                    key: TEST_KEY,
                    newValue: JSON.stringify(newValue),
                    oldValue: JSON.stringify(INITIAL_VALUE),
                    storageArea: localStorage,
                });
                window.dispatchEvent(storageEvent);
            });

            await waitFor(() => {
                expect(result.current.value).toEqual(newValue);
            });
        });

        it('should not sync when syncAcrossTabs is disabled', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    syncAcrossTabs: false,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalValue = result.current.value;
            const newValue = { count: 777 };

            // Simulate storage event from another tab
            act(() => {
                const storageEvent = new StorageEvent('storage', {
                    key: TEST_KEY,
                    newValue: JSON.stringify(newValue),
                    oldValue: JSON.stringify(INITIAL_VALUE),
                    storageArea: localStorage,
                });
                window.dispatchEvent(storageEvent);
            });

            // Value should not change
            expect(result.current.value).toEqual(originalValue);
        });

        it('should ignore storage events for different keys', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    syncAcrossTabs: true,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalValue = result.current.value;

            // Simulate storage event for different key
            act(() => {
                const storageEvent = new StorageEvent('storage', {
                    key: 'different-key',
                    newValue: JSON.stringify({ count: 999 }),
                    storageArea: localStorage,
                });
                window.dispatchEvent(storageEvent);
            });

            // Value should not change
            expect(result.current.value).toEqual(originalValue);
        });

        it('should validate synced data', async () => {
            const validator = (data: unknown): data is { count: number } => {
                return (
                    typeof data === 'object' &&
                    data !== null &&
                    'count' in data &&
                    typeof (data as { count: unknown }).count === 'number'
                );
            };

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE, {
                    syncAcrossTabs: true,
                    validate: validator,
                })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalValue = result.current.value;

            // Simulate storage event with invalid data
            act(() => {
                const storageEvent = new StorageEvent('storage', {
                    key: TEST_KEY,
                    newValue: JSON.stringify({ invalid: 'data' }),
                    storageArea: localStorage,
                });
                window.dispatchEvent(storageEvent);
            });

            // Value should not change due to validation failure
            expect(result.current.value).toEqual(originalValue);
        });
    });

    describe('Loading state', () => {
        it('should set isLoading to false after loading', async () => {
            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, INITIAL_VALUE)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('Complex data types', () => {
        it('should handle arrays', async () => {
            const arrayValue = [1, 2, 3, 4, 5];

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, arrayValue)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const newArray = [6, 7, 8];

            act(() => {
                result.current.setValue(newArray);
            });

            expect(result.current.value).toEqual(newArray);
            expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toEqual(
                newArray
            );
        });

        it('should handle nested objects', async () => {
            const nestedValue = {
                user: {
                    name: 'John',
                    settings: {
                        theme: 'dark',
                        notifications: true,
                    },
                },
            };

            const { result } = renderHook(() =>
                useLocalStorage(TEST_KEY, nestedValue)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setValue(nestedValue);
            });

            expect(result.current.value).toEqual(nestedValue);
        });

        it('should handle null values', async () => {
            const { result } = renderHook(() =>
                useLocalStorage<string | null>(TEST_KEY, null)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setValue('test');
            });

            expect(result.current.value).toBe('test');

            act(() => {
                result.current.setValue(null);
            });

            expect(result.current.value).toBeNull();
        });
    });
});

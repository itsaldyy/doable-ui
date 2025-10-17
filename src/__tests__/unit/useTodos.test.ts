/**
 * Unit tests for useTodos hook
 *
 * Tests CRUD operations, localStorage integration, error handling, and loading states
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';
import * as storage from '../../utils/storage';
import type { Todo } from '../../types/todo';

// Mock the storage module
jest.mock('../../utils/storage');

const mockedStorage = storage as jest.Mocked<typeof storage>;

describe('useTodos', () => {
    // Sample test data
    const mockTodo1: Todo = {
        id: 'test-id-1',
        text: 'Test todo 1',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    const mockTodo2: Todo = {
        id: 'test-id-2',
        text: 'Test todo 2',
        completed: true,
        createdAt: new Date('2024-01-02T10:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockedStorage.loadTodos.mockReturnValue([]);
        mockedStorage.saveTodos.mockImplementation(() => {});
        mockedStorage.generateId.mockReturnValue('generated-id');
    });

    describe('Initialization and Loading', () => {
        it('should load todos from storage on mount', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1, mockTodo2]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockedStorage.loadTodos).toHaveBeenCalledTimes(1);
            expect(result.current.todos).toHaveLength(2);
        });

        it('should sort todos by newest first', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1, mockTodo2]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // mockTodo2 has a later createdAt date, so it should be first
            expect(result.current.todos[0].id).toBe('test-id-2');
            expect(result.current.todos[1].id).toBe('test-id-1');
        });

        it('should handle empty storage', async () => {
            mockedStorage.loadTodos.mockReturnValue([]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.todos).toEqual([]);
            expect(result.current.error).toBeNull();
        });
    });

    describe('Error Handling on Load', () => {
        it('should handle StorageUnavailableError', async () => {
            mockedStorage.loadTodos.mockImplementation(() => {
                throw new storage.StorageUnavailableError();
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toContain(
                'localStorage is not available'
            );
            expect(result.current.todos).toEqual([]);
        });

        it('should handle InvalidDataError', async () => {
            mockedStorage.loadTodos.mockImplementation(() => {
                throw new storage.InvalidDataError();
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toContain('corrupted');
            expect(result.current.todos).toEqual([]);
        });

        it('should handle generic errors', async () => {
            mockedStorage.loadTodos.mockImplementation(() => {
                throw new Error('Unknown error');
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toContain('Failed to load todos');
            expect(result.current.todos).toEqual([]);
        });
    });

    describe('addTodo', () => {
        it('should add a new todo', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('New todo');
            });

            expect(result.current.todos).toHaveLength(1);
            expect(result.current.todos[0].text).toBe('New todo');
            expect(result.current.todos[0].completed).toBe(false);
            expect(result.current.todos[0].id).toBe('generated-id');
            expect(mockedStorage.saveTodos).toHaveBeenCalledWith(
                result.current.todos
            );
        });

        it('should trim whitespace from todo text', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('  Todo with spaces  ');
            });

            expect(result.current.todos[0].text).toBe('Todo with spaces');
        });

        it('should add new todos at the beginning (newest first)', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1]);
            mockedStorage.generateId.mockReturnValue('new-id');

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('Newest todo');
            });

            expect(result.current.todos[0].id).toBe('new-id');
            expect(result.current.todos[0].text).toBe('Newest todo');
            expect(result.current.todos[1].id).toBe('test-id-1');
        });

        it('should reject empty todo text', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('');
            });

            expect(result.current.todos).toHaveLength(0);
            expect(result.current.error).toContain('cannot be empty');
            expect(mockedStorage.saveTodos).not.toHaveBeenCalled();
        });

        it('should reject whitespace-only todo text', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('   ');
            });

            expect(result.current.todos).toHaveLength(0);
            expect(result.current.error).toContain('cannot be empty');
        });

        it('should reject todo text exceeding max length', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const longText = 'a'.repeat(501);

            act(() => {
                result.current.addTodo(longText);
            });

            expect(result.current.todos).toHaveLength(0);
            expect(result.current.error).toContain('cannot exceed');
        });

        it('should clear error on successful add', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // First, create an error
            act(() => {
                result.current.addTodo('');
            });

            expect(result.current.error).not.toBeNull();

            // Then add a valid todo
            act(() => {
                result.current.addTodo('Valid todo');
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('updateTodo', () => {
        beforeEach(() => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1, mockTodo2]);
        });

        it('should update todo text', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('test-id-1', {
                    text: 'Updated text',
                });
            });

            const updatedTodo = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            );
            expect(updatedTodo?.text).toBe('Updated text');
            expect(mockedStorage.saveTodos).toHaveBeenCalled();
        });

        it('should update todo completion status', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('test-id-1', { completed: true });
            });

            const updatedTodo = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            );
            expect(updatedTodo?.completed).toBe(true);
        });

        it('should update updatedAt timestamp', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalUpdatedAt = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            )?.updatedAt;

            act(() => {
                result.current.updateTodo('test-id-1', { text: 'Updated' });
            });

            const newUpdatedAt = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            )?.updatedAt;

            expect(newUpdatedAt).not.toEqual(originalUpdatedAt);
        });

        it('should trim whitespace when updating text', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('test-id-1', {
                    text: '  Updated with spaces  ',
                });
            });

            const updatedTodo = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            );
            expect(updatedTodo?.text).toBe('Updated with spaces');
        });

        it('should reject empty text update', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalText = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            )?.text;

            act(() => {
                result.current.updateTodo('test-id-1', { text: '' });
            });

            const updatedTodo = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            );
            expect(updatedTodo?.text).toBe(originalText);
            expect(result.current.error).toContain('cannot be empty');
        });

        it('should reject text update exceeding max length', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const longText = 'a'.repeat(501);

            act(() => {
                result.current.updateTodo('test-id-1', { text: longText });
            });

            expect(result.current.error).toContain('cannot exceed');
        });

        it('should handle non-existent todo ID', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('non-existent-id', {
                    text: 'Updated',
                });
            });

            expect(result.current.error).toContain('not found');
        });

        it('should update multiple fields at once', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('test-id-1', {
                    text: 'New text',
                    completed: true,
                });
            });

            const updatedTodo = result.current.todos.find(
                (t) => t.id === 'test-id-1'
            );
            expect(updatedTodo?.text).toBe('New text');
            expect(updatedTodo?.completed).toBe(true);
        });
    });

    describe('deleteTodo', () => {
        beforeEach(() => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1, mockTodo2]);
        });

        it('should delete a todo by ID', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.todos).toHaveLength(2);

            act(() => {
                result.current.deleteTodo('test-id-1');
            });

            expect(result.current.todos).toHaveLength(1);
            expect(result.current.todos[0].id).toBe('test-id-2');
            expect(mockedStorage.saveTodos).toHaveBeenCalled();
        });

        it('should handle non-existent todo ID', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const originalLength = result.current.todos.length;

            act(() => {
                result.current.deleteTodo('non-existent-id');
            });

            expect(result.current.todos).toHaveLength(originalLength);
            expect(result.current.error).toContain('not found');
        });

        it('should clear error on successful delete', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // First, create an error
            act(() => {
                result.current.deleteTodo('non-existent-id');
            });

            expect(result.current.error).not.toBeNull();

            // Then delete a valid todo
            act(() => {
                result.current.deleteTodo('test-id-1');
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('localStorage Integration', () => {
        it('should persist todos after adding', async () => {
            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('New todo');
            });

            expect(mockedStorage.saveTodos).toHaveBeenCalledTimes(1);
            expect(mockedStorage.saveTodos).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ text: 'New todo' }),
                ])
            );
        });

        it('should persist todos after updating', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateTodo('test-id-1', { completed: true });
            });

            expect(mockedStorage.saveTodos).toHaveBeenCalled();
        });

        it('should persist todos after deleting', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1, mockTodo2]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.deleteTodo('test-id-1');
            });

            expect(mockedStorage.saveTodos).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ id: 'test-id-2' }),
                ])
            );
            expect(mockedStorage.saveTodos).toHaveBeenCalledWith(
                expect.not.arrayContaining([
                    expect.objectContaining({ id: 'test-id-1' }),
                ])
            );
        });

        it('should handle StorageUnavailableError on save', async () => {
            mockedStorage.saveTodos.mockImplementation(() => {
                throw new storage.StorageUnavailableError();
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('New todo');
            });

            expect(result.current.error).toContain(
                'localStorage is not available'
            );
            // Todo should still be added to state even if save fails
            expect(result.current.todos).toHaveLength(1);
        });

        it('should handle StorageQuotaExceededError on save', async () => {
            mockedStorage.saveTodos.mockImplementation(() => {
                throw new storage.StorageQuotaExceededError();
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addTodo('New todo');
            });

            expect(result.current.error).toContain('quota exceeded');
            // Todo should still be added to state even if save fails
            expect(result.current.todos).toHaveLength(1);
        });
    });

    describe('Loading States', () => {
        it('should set isLoading to false after successful load', async () => {
            mockedStorage.loadTodos.mockReturnValue([mockTodo1]);

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBeNull();
        });

        it('should set isLoading to false after failed load', async () => {
            mockedStorage.loadTodos.mockImplementation(() => {
                throw new Error('Load failed');
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).not.toBeNull();
        });
    });
});

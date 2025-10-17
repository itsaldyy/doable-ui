/**
 * Custom hook for managing todo state and operations
 *
 * This hook provides CRUD operations for todos with localStorage persistence,
 * error handling, and loading state management. Todos are sorted with newest first.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types/todo';
import { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from '../types/todo';
import { loadTodos, saveTodos, generateId } from '../utils/storage';
import {
    StorageUnavailableError,
    StorageQuotaExceededError,
    InvalidDataError,
} from '../utils/storage';

/**
 * Return type for useTodos hook
 */
export interface UseTodosReturn {
    /**
     * Array of todos sorted by creation date (newest first)
     */
    todos: Todo[];

    /**
     * Add a new todo
     */
    addTodo: (text: string) => void;

    /**
     * Update an existing todo
     */
    updateTodo: (
        id: string,
        updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
    ) => void;

    /**
     * Delete a todo by ID
     */
    deleteTodo: (id: string) => void;

    /**
     * Loading state indicator
     */
    isLoading: boolean;

    /**
     * Error message if any operation fails
     */
    error: string | null;
}

/**
 * Validates todo text
 *
 * @param text - Text to validate
 * @returns Error message if invalid, null if valid
 */
const validateTodoText = (text: string): string | null => {
    const trimmed = text.trim();

    if (trimmed.length < MIN_TEXT_LENGTH) {
        return 'Todo text cannot be empty';
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
        return `Todo text cannot exceed ${MAX_TEXT_LENGTH} characters`;
    }

    return null;
};

/**
 * Sorts todos by creation date (newest first)
 *
 * @param todos - Array of todos to sort
 * @returns Sorted array (does not mutate original)
 */
const sortTodosByNewest = (todos: Todo[]): Todo[] => {
    return [...todos].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
};

/**
 * Custom hook for managing todos with localStorage persistence
 *
 * @returns Object containing todos array, CRUD operations, and state indicators
 *
 * @example
 * ```tsx
 * const { todos, addTodo, updateTodo, deleteTodo, isLoading, error } = useTodos();
 *
 * // Add a new todo
 * addTodo('Buy groceries');
 *
 * // Update a todo
 * updateTodo('todo-id', { completed: true });
 *
 * // Delete a todo
 * deleteTodo('todo-id');
 * ```
 */
export function useTodos(): UseTodosReturn {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load todos from localStorage on mount
    useEffect(() => {
        const loadInitialTodos = (): void => {
            try {
                setIsLoading(true);
                setError(null);

                const loadedTodos = loadTodos();
                const sortedTodos = sortTodosByNewest(loadedTodos);

                setTodos(sortedTodos);
            } catch (err) {
                let errorMessage = 'Failed to load todos';

                if (err instanceof StorageUnavailableError) {
                    errorMessage =
                        'localStorage is not available. Your todos will not be saved.';
                } else if (err instanceof InvalidDataError) {
                    errorMessage =
                        'Stored data is corrupted. Starting with empty list.';
                } else if (
                    err instanceof Error &&
                    err.message.includes('not available')
                ) {
                    errorMessage =
                        'localStorage is not available. Your todos will not be saved.';
                }

                setError(errorMessage);
                console.error('Error loading todos:', err);

                // Start with empty array on error
                setTodos([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialTodos();
    }, []);

    // Persist todos to localStorage whenever they change
    const persistTodos = useCallback((updatedTodos: Todo[]): boolean => {
        try {
            saveTodos(updatedTodos);
            return true;
        } catch (err) {
            let errorMessage = 'Failed to save todos';

            if (err instanceof StorageUnavailableError) {
                errorMessage =
                    'localStorage is not available. Changes will not be saved.';
            } else if (err instanceof StorageQuotaExceededError) {
                errorMessage =
                    'Storage quota exceeded. Please delete some todos.';
            } else if (err instanceof Error) {
                // Check for quota exceeded in error name or message
                if (
                    err.name === 'QuotaExceededError' ||
                    err.message.includes('quota')
                ) {
                    errorMessage =
                        'Storage quota exceeded. Please delete some todos.';
                } else if (
                    err.message.includes('Storage') ||
                    err.message.includes('unavailable')
                ) {
                    errorMessage = 'Storage error. Changes may not be saved.';
                }
            }

            setError(errorMessage);
            console.error('Error saving todos:', err);
            return false;
        }
    }, []);

    /**
     * Add a new todo
     */
    const addTodo = useCallback(
        (text: string): void => {
            // Validate text
            const validationError = validateTodoText(text);
            if (validationError) {
                setError(validationError);
                return;
            }

            // Clear any previous errors before attempting to add
            setError(null);

            const trimmedText = text.trim();
            const now = new Date();

            const newTodo: Todo = {
                id: generateId(),
                text: trimmedText,
                completed: false,
                createdAt: now,
                updatedAt: now,
            };

            const updatedTodos = [newTodo, ...todos];
            setTodos(updatedTodos);

            // Persist will set error if it fails
            persistTodos(updatedTodos);
        },
        [todos, persistTodos]
    );

    /**
     * Update an existing todo
     */
    const updateTodo = useCallback(
        (
            id: string,
            updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
        ): void => {
            // Validate text if it's being updated
            if (updates.text !== undefined) {
                const validationError = validateTodoText(updates.text);
                if (validationError) {
                    setError(validationError);
                    return;
                }
                updates.text = updates.text.trim();
            }

            const todoIndex = todos.findIndex((todo) => todo.id === id);

            if (todoIndex === -1) {
                setError('Todo not found');
                return;
            }

            // Clear any previous errors before attempting to update
            setError(null);

            const updatedTodos = [...todos];
            updatedTodos[todoIndex] = {
                ...updatedTodos[todoIndex],
                ...updates,
                updatedAt: new Date(),
            };

            // Re-sort if needed (though updates shouldn't change order)
            const sortedTodos = sortTodosByNewest(updatedTodos);
            setTodos(sortedTodos);

            // Persist will set error if it fails
            persistTodos(sortedTodos);
        },
        [todos, persistTodos]
    );

    /**
     * Delete a todo by ID
     */
    const deleteTodo = useCallback(
        (id: string): void => {
            const updatedTodos = todos.filter((todo) => todo.id !== id);

            if (updatedTodos.length === todos.length) {
                setError('Todo not found');
                return;
            }

            // Clear any previous errors before attempting to delete
            setError(null);

            setTodos(updatedTodos);

            // Persist will set error if it fails
            persistTodos(updatedTodos);
        },
        [todos, persistTodos]
    );

    return {
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        isLoading,
        error,
    };
}

import { useState, useEffect, useRef } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import { ErrorMessage } from './ErrorMessage';

/**
 * TodoApp is the main application component that integrates all todo functionality.
 *
 * Features:
 * - Manages todo state with useTodos hook
 * - Provides input for adding new todos
 * - Displays list of todos with full CRUD operations
 * - Handles localStorage persistence automatically
 * - Displays error messages with dismiss functionality
 * - Shows loading state during initial data load
 */
export function TodoApp(): JSX.Element {
    const { todos, addTodo, updateTodo, deleteTodo, isLoading, error } =
        useTodos();
    const [dismissedError, setDismissedError] = useState<boolean>(false);
    const previousErrorRef = useRef<string | null>(null);

    // Reset dismissed state when error changes
    useEffect(() => {
        if (error !== previousErrorRef.current) {
            setDismissedError(false);
            previousErrorRef.current = error;
        }
    }, [error]);

    const handleDismissError = (): void => {
        setDismissedError(true);
    };

    // Determine error type based on message content
    const getErrorType = (
        errorMessage: string
    ): 'error' | 'warning' | 'info' => {
        if (
            errorMessage.includes('not available') ||
            errorMessage.includes('not be saved')
        ) {
            return 'warning';
        }
        if (errorMessage.includes('corrupted')) {
            return 'info';
        }
        return 'error';
    };

    // Show error if exists and not dismissed
    const shouldShowError = error && !dismissedError;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        My Todo List
                    </h1>
                    <p className="text-gray-600">
                        Stay organized and productive
                    </p>
                </header>

                <main className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {/* Error Message */}
                    {shouldShowError && (
                        <ErrorMessage
                            message={error}
                            type={getErrorType(error)}
                            onDismiss={handleDismissError}
                        />
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-600">
                                    Loading your todos...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <TodoInput onSubmit={addTodo} />
                            <TodoList
                                todos={todos}
                                onUpdate={updateTodo}
                                onDelete={deleteTodo}
                            />
                        </>
                    )}
                </main>

                <footer className="text-center mt-8 text-gray-600 text-sm">
                    <p>Built with React, TypeScript, and Tailwind CSS</p>
                </footer>
            </div>
        </div>
    );
}

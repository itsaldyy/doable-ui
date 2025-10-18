import { useState, useEffect, useRef } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import { ErrorMessage } from './ErrorMessage';
import DoableIcon from '../assets/doable.svg?react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 py-8 px-4">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
            >
                Skip to main content
            </a>
            <div className="max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <a
                        href="/"
                        className="inline-flex items-center gap-3 group hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                        aria-label="Doable - Home"
                    >
                        <DoableIcon
                            className="w-10 h-10 flex-shrink-0"
                            aria-hidden="true"
                        />
                        <h1 className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                            Doable
                        </h1>
                    </a>
                    <p className="text-gray-700 mt-2">Anything is doable!</p>
                </header>

                <main
                    id="main-content"
                    className="bg-white rounded-xl shadow-lg p-6 space-y-6"
                    aria-label="Todo list application"
                >
                    {/* Error Message */}
                    {shouldShowError && (
                        <div aria-live="assertive" aria-atomic="true">
                            <ErrorMessage
                                message={error}
                                type={getErrorType(error)}
                                onDismiss={handleDismissError}
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div
                            className="flex items-center justify-center py-12"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="text-center">
                                <div
                                    className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"
                                    aria-hidden="true"
                                ></div>
                                <p className="text-gray-700">
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
            </div>
        </div>
    );
}

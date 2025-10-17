import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';

/**
 * TodoApp is the main application component that integrates all todo functionality.
 *
 * Features:
 * - Manages todo state with useTodos hook
 * - Provides input for adding new todos
 * - Displays list of todos with full CRUD operations
 * - Handles localStorage persistence automatically
 */
export function TodoApp(): JSX.Element {
    const { todos, addTodo, updateTodo, deleteTodo } = useTodos();

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
                    <TodoInput onSubmit={addTodo} />
                    <TodoList
                        todos={todos}
                        onUpdate={updateTodo}
                        onDelete={deleteTodo}
                    />
                </main>

                <footer className="text-center mt-8 text-gray-600 text-sm">
                    <p>Built with React, TypeScript, and Tailwind CSS</p>
                </footer>
            </div>
        </div>
    );
}

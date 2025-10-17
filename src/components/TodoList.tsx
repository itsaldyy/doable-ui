import type { Todo } from '../types/todo';
import { EmptyState } from './EmptyState';
import { TodoItem } from './TodoItem';

interface TodoListProps {
    todos: Todo[];
    onUpdate: (id: string, updates: Partial<Todo>) => void;
    onDelete: (id: string) => void;
}

/**
 * TodoList component renders a list of todo items or an empty state.
 *
 * Features:
 * - Displays EmptyState when no todos exist
 * - Renders TodoItem for each todo
 * - Passes callbacks to child components with correct todo IDs
 */
export function TodoList({
    todos,
    onUpdate,
    onDelete,
}: TodoListProps): JSX.Element {
    // Show empty state when no todos exist
    if (todos.length === 0) {
        return <EmptyState />;
    }

    // Render list of todo items
    return (
        <div className="space-y-3">
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onUpdate={(updates) => onUpdate(todo.id, updates)}
                    onDelete={() => onDelete(todo.id)}
                />
            ))}
        </div>
    );
}

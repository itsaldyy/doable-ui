import { useState, useEffect, useRef } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
    todo: Todo;
    onUpdate: (updates: Partial<Todo>) => void;
    onDelete: () => void;
}

/**
 * TodoItem component displays a single todo item with inline editing capabilities.
 *
 * Features:
 * - Toggle completion status via checkbox
 * - Inline editing via double-click
 * - Delete functionality
 * - Keyboard navigation (Enter to save, Escape to cancel)
 * - Full accessibility support with ARIA labels
 */
export function TodoItem({
    todo,
    onUpdate,
    onDelete,
}: TodoItemProps): JSX.Element {
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const editInputRef = useRef<HTMLInputElement>(null);

    /**
     * Toggle the completion status of the todo
     */
    const handleToggleComplete = (): void => {
        onUpdate({ completed: !todo.completed });
    };

    /**
     * Delete the todo item
     */
    const handleDelete = (): void => {
        onDelete();
    };

    /**
     * Enter edit mode when todo text is double-clicked
     */
    const handleDoubleClick = (): void => {
        setIsEditing(true);
        setEditText(todo.text);
    };

    /**
     * Handle keyboard events in edit mode
     * - Enter: Save changes if text is not empty
     * - Escape: Cancel editing and restore original text
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            const trimmedText = editText.trim();
            if (trimmedText) {
                onUpdate({ text: trimmedText });
                setIsEditing(false);
            }
        } else if (e.key === 'Escape') {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    /**
     * Focus the edit input when entering edit mode
     */
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    // Render edit mode
    if (isEditing) {
        return (
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Edit todo text"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        );
    }

    // Render normal view mode
    return (
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span
                className={`flex-1 text-gray-800 cursor-pointer select-none ${
                    todo.completed ? 'line-through text-gray-400' : ''
                }`}
                onDoubleClick={handleDoubleClick}
            >
                {todo.text}
            </span>
            <button
                aria-label="Delete todo"
                onClick={handleDelete}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                Delete
            </button>
        </div>
    );
}

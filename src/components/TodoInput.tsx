import { useState } from 'react';

interface TodoInputProps {
    onSubmit: (text: string) => void;
}

/**
 * TodoInput component for creating new todo items
 * Provides input validation and submission via Enter key or button click
 */
export function TodoInput({ onSubmit }: TodoInputProps): JSX.Element {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    /**
     * Validates if the input value is empty or contains only whitespace
     */
    const isInputEmpty = (input: string): boolean => {
        return !input.trim();
    };

    /**
     * Handles input value changes and clears validation errors
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = e.target.value;
        setValue(newValue);

        // Clear error when user enters valid text
        if (error && !isInputEmpty(newValue)) {
            setError('');
        }
    };

    /**
     * Validates and submits the todo item
     */
    const handleSubmit = (): void => {
        if (isInputEmpty(value)) {
            setError('Task cannot be empty');
            return;
        }

        const trimmedValue = value.trim();
        onSubmit(trimmedValue);

        // Reset form state after successful submission
        setValue('');
        setError('');
    };

    /**
     * Handles Enter key down for submission
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="What needs to be done?"
                    aria-label="New todo input"
                    aria-invalid={!!error}
                    aria-describedby={error ? 'todo-input-error' : undefined}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                    onClick={handleSubmit}
                    aria-label="Add todo"
                    className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-700 transition-colors"
                >
                    Add
                </button>
            </div>
            {error && (
                <div
                    id="todo-input-error"
                    role="alert"
                    className="text-red-600 text-sm px-1"
                >
                    {error}
                </div>
            )}
        </div>
    );
}

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoItem } from '../../components/TodoItem';
import type { Todo } from '../../types/todo';

describe('TodoItem', () => {
    const mockTodo: Todo = {
        id: '1',
        text: 'Test todo item',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render todo text', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByText('Test todo item')).toBeInTheDocument();
        });

        it('should render completion checkbox', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should render delete button', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).toBeInTheDocument();
        });
    });

    describe('Completion Toggle', () => {
        it('should call onUpdate with completed: true when checkbox is clicked', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const checkbox = screen.getByRole('checkbox');
            checkbox.click();

            expect(mockOnUpdate).toHaveBeenCalledWith({ completed: true });
        });

        it('should show visual indicator for completed todos', () => {
            const completedTodo: Todo = { ...mockTodo, completed: true };

            render(
                <TodoItem
                    todo={completedTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            expect(todoText).toHaveClass('line-through');
        });

        it('should reflect completion status in checkbox', () => {
            const completedTodo: Todo = { ...mockTodo, completed: true };

            render(
                <TodoItem
                    todo={completedTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
        });
    });

    describe('Delete Functionality', () => {
        it('should call onDelete when delete button is clicked', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            deleteButton.click();

            expect(mockOnDelete).toHaveBeenCalledTimes(1);
        });

        it('should have accessible delete button', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).toHaveAttribute('aria-label');
        });
    });

    describe('Inline Editing Mode', () => {
        it('should enter edit mode when todo text is double-clicked', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            expect(editInput).toBeInTheDocument();
        });

        it('should show input field with current text in edit mode', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue(
                'Test todo item'
            ) as HTMLInputElement;
            expect(editInput.value).toBe('Test todo item');
        });

        it('should hide normal view in edit mode', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            expect(
                screen.queryByText('Test todo item')
            ).not.toBeInTheDocument();
        });
    });

    describe('Edit Save Behavior', () => {
        it('should save edited text when Enter is pressed', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, { target: { value: 'Updated todo' } });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            expect(mockOnUpdate).toHaveBeenCalledWith({ text: 'Updated todo' });
        });

        it('should trim edited text before saving', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, {
                target: { value: '  Updated todo  ' },
            });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            expect(mockOnUpdate).toHaveBeenCalledWith({ text: 'Updated todo' });
        });

        it('should not save empty text', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, { target: { value: '   ' } });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            expect(mockOnUpdate).not.toHaveBeenCalled();
        });

        it('should exit edit mode after saving', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, { target: { value: 'Updated todo' } });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            // Should exit edit mode - the text input should not be present
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });

    describe('Edit Cancel Behavior', () => {
        it('should cancel edit when Escape is pressed', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, { target: { value: 'Changed text' } });
            fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' });

            expect(mockOnUpdate).not.toHaveBeenCalled();
        });

        it('should restore original text on cancel', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.change(editInput, { target: { value: 'Changed text' } });
            fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' });

            // Original text should be visible again
            expect(screen.getByText('Test todo item')).toBeInTheDocument();
        });

        it('should exit edit mode on cancel', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' });

            // Should exit edit mode - the text input should not be present
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });

    describe('Keyboard Navigation and Accessibility', () => {
        it('should have proper ARIA label for checkbox', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toHaveAttribute('aria-label');
        });

        it('should have proper ARIA label for delete button', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).toHaveAttribute('aria-label');
        });

        it('should focus edit input when entering edit mode', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            expect(editInput).toHaveFocus();
        });

        it('should have proper ARIA label for edit input', () => {
            render(
                <TodoItem
                    todo={mockTodo}
                    onUpdate={mockOnUpdate}
                    onDelete={mockOnDelete}
                />
            );

            const todoText = screen.getByText('Test todo item');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getByDisplayValue('Test todo item');
            expect(editInput).toHaveAttribute('aria-label');
        });
    });
});

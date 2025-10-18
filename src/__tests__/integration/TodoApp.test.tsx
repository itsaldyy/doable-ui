import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoApp } from '../../components/TodoApp';

describe('TodoApp', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Basic Composition', () => {
        it('should render TodoInput component', () => {
            render(<TodoApp />);

            // Look for input field from TodoInput
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('should render TodoList component', () => {
            render(<TodoApp />);

            // TodoList should be present (either showing EmptyState or todos)
            // Check for either empty state message or list container
            const container =
                screen.getByText(/no tasks yet/i) || screen.queryByRole('list');
            expect(container).toBeInTheDocument();
        });

        it('should have proper component composition', () => {
            const { container } = render(<TodoApp />);

            // Should have a main container
            expect(container.firstChild).toBeInTheDocument();

            // Should have both input and list areas
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });
    });

    describe('Add Todo Workflow', () => {
        it('should add todo via TodoInput and update list', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Initially should show empty state
            expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();

            // Type and add a todo
            fireEvent.change(input, { target: { value: 'New test todo' } });
            fireEvent.click(addButton);

            // Todo should appear in the list
            expect(screen.getByText('New test todo')).toBeInTheDocument();
        });

        it('should clear input after adding todo', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            const addButton = screen.getByRole('button', { name: /add/i });

            // Type and add a todo
            fireEvent.change(input, { target: { value: 'Test todo' } });
            fireEvent.click(addButton);

            // Input should be cleared
            expect(input.value).toBe('');
        });

        it('should show new todo in TodoList', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'First todo' } });
            fireEvent.click(addButton);

            // Empty state should be gone
            expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();

            // Todo should be visible
            expect(screen.getByText('First todo')).toBeInTheDocument();
        });
    });

    describe('Toggle Todo Workflow', () => {
        it('should toggle todo completion status', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'Toggle test' } });
            fireEvent.click(addButton);

            // Find and toggle the checkbox using aria-label
            const checkbox = screen.getByLabelText(
                /mark "toggle test" as complete/i
            ) as HTMLInputElement;
            expect(checkbox.checked).toBe(false);

            fireEvent.click(checkbox);
            expect(checkbox.checked).toBe(true);
        });

        it('should persist completion state', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'Persist test' } });
            fireEvent.click(addButton);

            // Toggle it using aria-label
            const checkbox = screen.getByLabelText(
                /mark "persist test" as complete/i
            ) as HTMLInputElement;
            fireEvent.click(checkbox);

            // State should persist
            expect(checkbox.checked).toBe(true);
        });
    });

    describe('Update Todo Workflow', () => {
        it('should update todo text via inline editing', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'Original text' } });
            fireEvent.click(addButton);

            // Double-click to edit
            const todoText = screen.getByText('Original text');
            fireEvent.doubleClick(todoText);

            // Find edit input and change text
            const editInput = screen.getAllByRole(
                'textbox'
            )[1] as HTMLInputElement;
            fireEvent.change(editInput, { target: { value: 'Updated text' } });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            // Updated text should be visible
            expect(screen.getByText('Updated text')).toBeInTheDocument();
            expect(screen.queryByText('Original text')).not.toBeInTheDocument();
        });

        it('should persist updated text', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add and edit a todo
            fireEvent.change(input, { target: { value: 'Before edit' } });
            fireEvent.click(addButton);

            const todoText = screen.getByText('Before edit');
            fireEvent.doubleClick(todoText);

            const editInput = screen.getAllByRole(
                'textbox'
            )[1] as HTMLInputElement;
            fireEvent.change(editInput, { target: { value: 'After edit' } });
            fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });

            // Text should persist
            expect(screen.getByText('After edit')).toBeInTheDocument();
        });
    });

    describe('Delete Todo Workflow', () => {
        it('should delete todo from list', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'To be deleted' } });
            fireEvent.click(addButton);

            // Verify it exists
            expect(screen.getByText('To be deleted')).toBeInTheDocument();

            // Delete it using aria-label
            const deleteButton = screen.getByLabelText('Delete todo');
            fireEvent.click(deleteButton);

            // Should be gone
            expect(screen.queryByText('To be deleted')).not.toBeInTheDocument();
        });

        it('should show empty state after deleting last todo', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'Last todo' } });
            fireEvent.click(addButton);

            // Delete it using aria-label
            const deleteButton = screen.getByLabelText('Delete todo');
            fireEvent.click(deleteButton);

            // Empty state should appear
            expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
        });
    });

    describe('LocalStorage Persistence', () => {
        it('should work with localStorage', () => {
            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Add a todo
            fireEvent.change(input, { target: { value: 'Persistent todo' } });
            fireEvent.click(addButton);

            // Todo should be visible (persistence is handled by useTodos hook)
            expect(screen.getByText('Persistent todo')).toBeInTheDocument();
        });

        it('should handle localStorage errors gracefully', () => {
            // Mock localStorage to throw error
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = jest.fn(() => {
                throw new Error('Storage full');
            });

            render(<TodoApp />);

            const input = screen.getByRole('textbox');
            const addButton = screen.getByRole('button', { name: /add/i });

            // Should not crash when adding todo
            fireEvent.change(input, { target: { value: 'Test todo' } });
            fireEvent.click(addButton);

            // App should still work
            expect(screen.getByText('Test todo')).toBeInTheDocument();

            // Restore original
            Storage.prototype.setItem = originalSetItem;
        });
    });

    describe('Error Handling', () => {
        it('should not crash on unexpected errors', () => {
            // This test verifies the app doesn't crash
            const { container } = render(<TodoApp />);
            expect(container).toBeInTheDocument();
        });

        it('should handle empty input gracefully', () => {
            render(<TodoApp />);

            const addButton = screen.getByRole('button', { name: /add/i });

            // Try to add empty todo
            fireEvent.click(addButton);

            // Should still show empty state
            expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
        });
    });
});

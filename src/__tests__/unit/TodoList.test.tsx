import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoList } from '../../components/TodoList';
import type { Todo } from '../../types/todo';

describe('TodoList', () => {
    const mockTodos: Todo[] = [
        {
            id: '1',
            text: 'Test todo 1',
            completed: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        },
        {
            id: '2',
            text: 'Test todo 2',
            completed: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
        },
    ];

    const mockCallbacks = {
        onUpdate: jest.fn(),
        onDelete: jest.fn(),
    };

    describe('Empty State', () => {
        it('should show EmptyState when todos array is empty', () => {
            render(
                <TodoList
                    todos={[]}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Look for empty state message
            expect(
                screen.getByText(/no tasks yet/i) ||
                    screen.getByText(/add your first/i)
            ).toBeInTheDocument();
        });

        it('should not show EmptyState when todos exist', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Empty state message should not be present
            expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
        });
    });

    describe('Todo List Rendering', () => {
        it('should render TodoItem for each todo', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Check that both todos are rendered
            expect(screen.getByText('Test todo 1')).toBeInTheDocument();
            expect(screen.getByText('Test todo 2')).toBeInTheDocument();
        });

        it('should render correct number of TodoItems', () => {
            const { container } = render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Count the number of todo items rendered
            // TodoItem components should have checkboxes
            const checkboxes = container.querySelectorAll(
                'input[type="checkbox"]'
            );
            expect(checkboxes).toHaveLength(mockTodos.length);
        });

        it('should pass correct props to each TodoItem', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Verify that todo data is passed correctly
            const firstTodo = screen.getByText('Test todo 1');
            const secondTodo = screen.getByText('Test todo 2');

            expect(firstTodo).toBeInTheDocument();
            expect(secondTodo).toBeInTheDocument();
        });
    });

    describe('Todo Operations', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should call onUpdate callback with correct todo ID and updates', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Toggle the first todo's completion
            const firstCheckbox = screen.getAllByRole('checkbox')[0];
            firstCheckbox.click();

            // Verify onUpdate was called with correct ID and updates
            expect(mockCallbacks.onUpdate).toHaveBeenCalledWith('1', {
                completed: true,
            });
        });

        it('should call onDelete callback with correct todo ID', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Click delete button for first todo
            const deleteButtons = screen.getAllByText('Delete');
            deleteButtons[0].click();

            // Verify onDelete was called with correct ID
            expect(mockCallbacks.onDelete).toHaveBeenCalledWith('1');
        });

        it('should pass callbacks correctly to each TodoItem', () => {
            render(
                <TodoList
                    todos={mockTodos}
                    onUpdate={mockCallbacks.onUpdate}
                    onDelete={mockCallbacks.onDelete}
                />
            );

            // Toggle second todo
            const secondCheckbox = screen.getAllByRole('checkbox')[1];
            secondCheckbox.click();

            // Verify onUpdate was called with second todo's ID
            expect(mockCallbacks.onUpdate).toHaveBeenCalledWith('2', {
                completed: false,
            });
        });
    });
});

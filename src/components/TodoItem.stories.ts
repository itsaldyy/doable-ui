import type { Meta, StoryObj } from '@storybook/react';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types/todo';

/**
 * TodoItem component displays a single todo item with inline editing capabilities.
 * It supports completion toggling, inline editing via double-click, and deletion.
 */
const meta = {
    title: 'Components/TodoItem',
    component: TodoItem,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        todo: {
            description: 'The todo item to display',
        },
        onUpdate: {
            description: 'Callback when todo is updated',
        },
        onDelete: {
            description: 'Callback when todo is deleted',
        },
    },
    args: {
        onUpdate: () => console.log('Todo updated'),
        onDelete: () => console.log('Todo deleted'),
    },
} satisfies Meta<typeof TodoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTodo: Todo = {
    id: '1',
    text: 'Complete project documentation',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const completedTodo: Todo = {
    id: '2',
    text: 'Review pull requests',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Normal state - An incomplete todo item
 */
export const Normal: Story = {
    args: {
        todo: mockTodo,
    },
};

/**
 * Completed state - A todo item that has been marked as complete
 * Shows strikethrough text and grayed out appearance
 */
export const Completed: Story = {
    args: {
        todo: completedTodo,
    },
};

/**
 * Long text - A todo item with a longer description
 * Demonstrates how the component handles longer text content
 */
export const LongText: Story = {
    args: {
        todo: {
            ...mockTodo,
            text: 'This is a much longer todo item that demonstrates how the component handles text that spans multiple lines and contains a lot of information about the task that needs to be completed',
        },
    },
};

/**
 * Completed with long text - Shows how completed items with long text are displayed
 */
export const CompletedLongText: Story = {
    args: {
        todo: {
            ...completedTodo,
            text: 'This is a completed todo item with a longer description that shows how the strikethrough effect works with multiple lines of text',
        },
    },
};

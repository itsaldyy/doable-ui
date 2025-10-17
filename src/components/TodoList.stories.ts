import type { Meta, StoryObj } from '@storybook/react';
import { TodoList } from './TodoList';

const meta = {
    title: 'Components/TodoList',
    component: TodoList,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TodoList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state shown when there are no todos in the list.
 */
export const Empty: Story = {
    args: {
        todos: [],
        onUpdate: () => {},
        onDelete: () => {},
    },
};

/**
 * List with a few todo items showing different states.
 */
export const WithFewItems: Story = {
    args: {
        onUpdate: () => {},
        onDelete: () => {},
        todos: [
            {
                id: '1',
                text: 'Buy groceries',
                completed: false,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: '2',
                text: 'Walk the dog',
                completed: true,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
            {
                id: '3',
                text: 'Finish project documentation',
                completed: false,
                createdAt: new Date('2024-01-03'),
                updatedAt: new Date('2024-01-03'),
            },
        ],
    },
};

/**
 * List with many todo items to demonstrate scrolling behavior.
 */
export const WithManyItems: Story = {
    args: {
        onUpdate: () => {},
        onDelete: () => {},
        todos: Array.from({ length: 10 }, (_, i) => ({
            id: `${i + 1}`,
            text: `Todo item ${i + 1}`,
            completed: i % 3 === 0,
            createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
            updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        })),
    },
};

/**
 * Responsive behavior on mobile devices.
 */
export const Mobile: Story = {
    args: {
        onUpdate: () => {},
        onDelete: () => {},
        todos: [
            {
                id: '1',
                text: 'Mobile todo item',
                completed: false,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: '2',
                text: 'Another mobile todo',
                completed: true,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
        ],
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};

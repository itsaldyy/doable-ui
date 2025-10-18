import type { Meta, StoryObj } from '@storybook/react';
import { TodoApp } from './TodoApp';

const meta = {
    title: 'App/TodoApp',
    component: TodoApp,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TodoApp>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The complete Todo application with all features integrated.
 * This is the main entry point showing the full user experience.
 */
export const Default: Story = {};

/**
 * The application on mobile devices.
 * Demonstrates responsive design and touch-friendly interface.
 */
export const Mobile: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};

/**
 * The application on tablet devices.
 * Shows how the layout adapts to medium-sized screens.
 */
export const Tablet: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'tablet',
        },
    },
};

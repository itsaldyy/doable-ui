import type { Meta, StoryObj } from '@storybook/react';
import { TodoInput } from './TodoInput';

/**
 * TodoInput component allows users to create new todo items.
 * It provides validation and supports submission via Enter key or button click.
 */
const meta = {
    title: 'Components/TodoInput',
    component: TodoInput,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        onSubmit: () => console.log('Todo submitted'),
    },
} satisfies Meta<typeof TodoInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty state of the TodoInput component.
 * Users can type in the input field and submit by pressing Enter or clicking the Add button.
 */
export const Default: Story = {
    args: {},
};

/**
 * Shows the TodoInput component with placeholder text visible.
 * This is the initial state users see when the input is empty.
 */
export const EmptyState: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'The empty state shows a placeholder prompting users to enter a task.',
            },
        },
    },
};

/**
 * Demonstrates the error state when user attempts to submit empty input.
 * The error message appears below the input field.
 */
export const WithError: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'Error state is shown when users try to submit an empty task or only whitespace. Click the Add button without entering text to see the error.',
            },
        },
    },
};

/**
 * Shows interaction behaviors:
 * - Typing updates the input value
 * - Enter key submits the form
 * - Button click submits the form
 * - Input clears after successful submission
 * - Error clears when valid text is entered
 */
export const InteractionBehaviors: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: `
### Interaction Behaviors

The TodoInput component supports multiple interaction patterns:

1. **Text Input**: Type directly into the input field
2. **Keyboard Submission**: Press Enter to submit
3. **Button Submission**: Click the Add button to submit
4. **Validation**: Empty or whitespace-only input shows an error
5. **Auto-clear**: Input clears after successful submission
6. **Error Recovery**: Error message clears when valid text is entered

### Accessibility Features

- Proper ARIA labels for screen readers
- Focus states for keyboard navigation
- Error announcements via role="alert"
- Semantic HTML structure
        `,
            },
        },
    },
};

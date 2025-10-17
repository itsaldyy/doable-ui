import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

/**
 * Integration tests for Requirement 1: Add new tasks
 *
 * User Story: As a user, I want to add new tasks to my to-do list,
 * so that I can keep track of things I need to accomplish.
 *
 * These tests validate the full user flow from input to display,
 * testing multiple components working together.
 */
describe('Requirement 1: Add new tasks', () => {
    describe('Acceptance Criterion 1.1: Add task via button', () => {
        it('WHEN user enters text AND clicks Add button THEN system SHALL create and display new task', () => {
            render(<App />);

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: /add/i });

            // User enters text
            fireEvent.change(input, { target: { value: 'Buy milk' } });

            // User clicks Add button
            fireEvent.click(button);

            // Verify task is created AND displayed
            expect(screen.getByText('Buy milk')).toBeInTheDocument();
        });
    });

    describe('Acceptance Criterion 1.2: Add task via Enter key', () => {
        it('WHEN user enters text AND presses Enter THEN system SHALL create and display new task', () => {
            render(<App />);

            const input = screen.getByRole('textbox');

            // User enters text
            fireEvent.change(input, { target: { value: 'Write tests' } });

            // User presses Enter
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

            // Verify task is created AND displayed
            expect(screen.getByText('Write tests')).toBeInTheDocument();
        });
    });

    describe('Acceptance Criterion 1.3: Validation for empty tasks', () => {
        it('WHEN user attempts to add empty task THEN system SHALL display validation message and not create task', () => {
            render(<App />);

            const button = screen.getByRole('button', { name: /add/i });

            // User clicks Add without entering text
            fireEvent.click(button);

            // Verify validation message is displayed
            expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();

            // Verify no task was created (only the empty state message should exist)
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        });

        it('WHEN user attempts to add whitespace-only task THEN system SHALL display validation message', () => {
            render(<App />);

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: /add/i });

            // User enters only whitespace
            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.click(button);

            // Verify validation message is displayed
            expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();

            // Verify no task was created
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        });
    });

    describe('Acceptance Criterion 1.4: Clear input after creation', () => {
        it('WHEN new task is created THEN system SHALL clear input field', () => {
            render(<App />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            // User enters text and submits
            fireEvent.change(input, { target: { value: 'Buy milk' } });
            fireEvent.click(button);

            // Verify input is cleared
            expect(input.value).toBe('');
        });

        it('WHEN new task is created THEN system SHALL display task in list', () => {
            render(<App />);

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: /add/i });

            // Add first task
            fireEvent.change(input, { target: { value: 'First task' } });
            fireEvent.click(button);

            // Add second task
            fireEvent.change(input, { target: { value: 'Second task' } });
            fireEvent.click(button);

            // Verify both tasks are displayed
            expect(screen.getByText('First task')).toBeInTheDocument();
            expect(screen.getByText('Second task')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should trim whitespace from task text', () => {
            render(<App />);

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: /add/i });

            // User enters text with leading/trailing whitespace
            fireEvent.change(input, { target: { value: '  Buy milk  ' } });
            fireEvent.click(button);

            // Verify task is displayed with trimmed text
            expect(screen.getByText('Buy milk')).toBeInTheDocument();
            expect(screen.queryByText('  Buy milk  ')).not.toBeInTheDocument();
        });

        it('should allow adding multiple tasks in sequence', () => {
            render(<App />);

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: /add/i });

            // Add multiple tasks
            const tasks = ['Task 1', 'Task 2', 'Task 3'];
            tasks.forEach((task) => {
                fireEvent.change(input, { target: { value: task } });
                fireEvent.click(button);
            });

            // Verify all tasks are displayed
            tasks.forEach((task) => {
                expect(screen.getByText(task)).toBeInTheDocument();
            });
        });
    });
});

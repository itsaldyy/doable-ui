import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoInput } from '../../components/TodoInput';

describe('TodoInput', () => {
    describe('Basic Rendering', () => {
        it('should render an input field', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('should render a submit button', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const button = screen.getByRole('button', { name: /add/i });
            expect(button).toBeInTheDocument();
        });
    });

    describe('Text Input Handling', () => {
        it('should update input value on change', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            expect(input.value).toBe('');

            fireEvent.change(input, { target: { value: 'New todo' } });

            expect(input.value).toBe('New todo');
        });

        it('should accept text correctly', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            fireEvent.change(input, { target: { value: 'Buy groceries' } });
            fireEvent.change(input, {
                target: { value: 'Buy groceries and milk' },
            });

            expect(input.value).toBe('Buy groceries and milk');
        });
    });

    describe('Validation', () => {
        it('should show validation error when trying to submit empty input', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.click(button);

            const error = screen.getByText(/cannot be empty/i);
            expect(error).toBeInTheDocument();
        });

        it('should clear error message when valid input is entered', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            // Trigger error
            fireEvent.click(button);
            expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();

            // Enter valid text
            fireEvent.change(input, { target: { value: 'Valid todo' } });

            expect(
                screen.queryByText(/cannot be empty/i)
            ).not.toBeInTheDocument();
        });

        it('should treat whitespace-only input as empty', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.click(button);

            const error = screen.getByText(/cannot be empty/i);
            expect(error).toBeInTheDocument();
        });
    });

    describe('Submission Behavior', () => {
        it('should submit valid input when Enter key is pressed', () => {
            const onSubmit = jest.fn();
            render(<TodoInput onSubmit={onSubmit} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            fireEvent.change(input, { target: { value: 'New task' } });
            fireEvent.keyDown(input, {
                key: 'Enter',
                code: 'Enter',
            });

            expect(onSubmit).toHaveBeenCalledWith('New task');
        });

        it('should submit valid input when button is clicked', () => {
            const onSubmit = jest.fn();
            render(<TodoInput onSubmit={onSubmit} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.change(input, { target: { value: 'New task' } });
            fireEvent.click(button);

            expect(onSubmit).toHaveBeenCalledWith('New task');
        });

        it('should clear input after successful submission', () => {
            const onSubmit = jest.fn();
            render(<TodoInput onSubmit={onSubmit} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.change(input, { target: { value: 'New task' } });
            fireEvent.click(button);

            expect(input.value).toBe('');
        });

        it('should not submit empty input', () => {
            const onSubmit = jest.fn();
            render(<TodoInput onSubmit={onSubmit} />);
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.click(button);

            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA label on input field', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox');

            expect(input).toHaveAttribute('aria-label', 'New todo input');
        });

        it('should have proper ARIA label on submit button', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const button = screen.getByRole('button', { name: /add todo/i });

            expect(button).toHaveAttribute('aria-label', 'Add todo');
        });

        it('should set aria-invalid to true when validation error occurs', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.click(button);

            expect(input).toHaveAttribute('aria-invalid', 'true');
        });

        it('should set aria-invalid to false when no error', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            expect(input).toHaveAttribute('aria-invalid', 'false');
        });

        it('should associate error message with input using aria-describedby', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.click(button);

            expect(input).toHaveAttribute(
                'aria-describedby',
                'todo-input-error'
            );
        });

        it('should announce error message with alert role', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const button = screen.getByRole('button', { name: /add/i });

            fireEvent.click(button);

            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveTextContent(/cannot be empty/i);
        });

        it('should remove aria-describedby when error is cleared', () => {
            render(<TodoInput onSubmit={jest.fn()} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            const button = screen.getByRole('button', { name: /add/i });

            // Trigger error
            fireEvent.click(button);
            expect(input).toHaveAttribute(
                'aria-describedby',
                'todo-input-error'
            );

            // Clear error
            fireEvent.change(input, { target: { value: 'Valid todo' } });
            expect(input).not.toHaveAttribute('aria-describedby');
        });

        it('should be keyboard accessible via Enter key', () => {
            const onSubmit = jest.fn();
            render(<TodoInput onSubmit={onSubmit} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            fireEvent.change(input, { target: { value: 'Keyboard task' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(onSubmit).toHaveBeenCalledWith('Keyboard task');
        });
    });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoInput } from './TodoInput';

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
            fireEvent.keyPress(input, {
                key: 'Enter',
                code: 'Enter',
                charCode: 13,
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
});

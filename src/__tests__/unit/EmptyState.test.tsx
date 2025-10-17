import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState } from '../../components/EmptyState';

describe('EmptyState', () => {
    describe('Rendering', () => {
        it('should render an encouraging message', () => {
            render(<EmptyState />);

            // Look for encouraging message text
            expect(
                screen.getByText(/no tasks yet/i) ||
                    screen.getByText(/get started/i) ||
                    screen.getByText(/add your first/i)
            ).toBeInTheDocument();
        });

        it('should render with proper semantic structure', () => {
            const { container } = render(<EmptyState />);

            // Should have a container element
            expect(container.firstChild).toBeInTheDocument();

            // Should have proper semantic HTML (div or section)
            const element = container.firstChild as HTMLElement;
            expect(['DIV', 'SECTION']).toContain(element.tagName);
        });

        it('should render with accessible text content', () => {
            const { container } = render(<EmptyState />);

            // Should have some text content visible
            expect(container.textContent).toBeTruthy();
            expect(container.textContent?.length).toBeGreaterThan(0);
        });
    });
});

import type { ReactNode } from 'react';

interface ErrorMessageProps {
    /**
     * Error message to display
     */
    message: string;

    /**
     * Optional callback when error is dismissed
     */
    onDismiss?: () => void;

    /**
     * Type of error (affects styling)
     */
    type?: 'error' | 'warning' | 'info';
}

/**
 * ErrorMessage component displays error, warning, or info messages
 * with optional dismiss functionality.
 *
 * Features:
 * - Accessible with role="alert"
 * - Dismissible with close button
 * - Different visual styles for error types
 * - Responsive design
 */
export function ErrorMessage({
    message,
    onDismiss,
    type = 'error',
}: ErrorMessageProps): JSX.Element {
    const getStyles = (): {
        container: string;
        icon: ReactNode;
        iconColor: string;
    } => {
        switch (type) {
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    iconColor: 'text-yellow-500',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    ),
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200 text-blue-800',
                    iconColor: 'text-blue-500',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    ),
                };
            case 'error':
            default:
                return {
                    container: 'bg-red-50 border-red-200 text-red-800',
                    iconColor: 'text-red-500',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    ),
                };
        }
    };

    const styles = getStyles();

    return (
        <div
            role="alert"
            className={`${styles.container} border rounded-lg p-4 flex items-start gap-3`}
        >
            <svg
                className={`${styles.iconColor} h-5 w-5 flex-shrink-0 mt-0.5`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                {styles.icon}
            </svg>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{message}</p>
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 ml-auto -mr-1 -mt-1 p-1 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
                    aria-label="Dismiss error"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}

# Design Document

## Overview

The To Do List application will be built as a single-page application (SPA) using React with TypeScript for type safety and better developer experience. The application will use Tailwind CSS for utility-first styling, ensuring a clean and responsive design. Data persistence will be handled through the browser's localStorage API, making it a truly frontend-only solution.

### Technology Version Strategy

This project uses **stable, production-ready versions** of all technologies to ensure:

- **Reliability**: Battle-tested versions with known stability
- **Compatibility**: All dependencies work seamlessly together
- **Long-term Support**: Node.js 20 LTS is supported until April 2026
- **Ecosystem Maturity**: React 18.3.1 has extensive documentation and community support
- **Learning-Friendly**: Stable versions have more tutorials and resources available

**Version Selection Criteria:**

1. **Node.js 20.19.5**: Latest LTS "Iron" release, optimal for modern JavaScript tooling
2. **React 18.3.1**: Latest stable React 18, avoiding React 19's breaking changes for simplicity
3. **Latest Stable Tooling**: Vite 7, TypeScript 5.9, Tailwind 4 - all current stable releases
4. **Jest Testing Framework**: Industry-standard testing framework with extensive workplace adoption
5. **Modern ESLint 9**: Latest flat config system for better configuration management

## Architecture

### Technology Stack

#### Core Runtime & Build Tools

- **Node.js:** v20.19.5 (LTS "Iron" - Active until April 2026)
- **Package Manager:** npm v10.8.2 (bundled with Node 20.19.5)
- **Build Tool:** Vite v7.1.10 (latest stable)

#### Frontend Framework & Language

- **Frontend Framework:** React v18.3.1 (latest stable React 18)
- **React DOM:** v18.3.1 (matches React version)
- **TypeScript:** v5.9.3 (latest stable)

#### Styling

- **CSS Framework:** Tailwind CSS v3.4.18 (stable - downgraded from v4 for compatibility)
- **PostCSS:** v8.5.6 (required by Tailwind)
- **Autoprefixer:** v10.4.21 (CSS vendor prefixing)

**Note:** Initially planned to use Tailwind v4, but downgraded to v3 due to compatibility issues with Vite and PostCSS plugin architecture. See `docs/knowledge-transfer/architecture/css-versioning-compatibility-lessons.md` for details.

#### State Management & Data

- **State Management:** React useState and useEffect hooks (built-in)
- **Data Persistence:** Browser localStorage API (native Web API)

#### Code Quality & Formatting

- **Linter:** ESLint v9.37.0 (latest stable)
- **Formatter:** Prettier v3.6.2 (latest stable)
- **TypeScript ESLint:** @typescript-eslint/parser and @typescript-eslint/eslint-plugin (latest compatible)

#### Testing & Documentation

- **Test Runner:** Jest v30.2.0 (latest stable, industry-standard testing framework)
- **TypeScript Support:** ts-jest v29.4.5 (TypeScript preprocessor for Jest)
- **Test Environment:** jest-environment-jsdom v30.2.0 (DOM environment for React testing)
- **Testing Library:** @testing-library/react v16.3.0 (latest stable for React 18)
- **Testing Utilities:** @testing-library/jest-dom v6.x, @testing-library/user-event v14.x
- **Type Definitions:** @types/jest v30.0.0 (TypeScript types for Jest)
- **Component Documentation:** Storybook v9.1.10 (latest stable, visual component documentation)

#### Development Tools

- **Type Definitions:** @types/react v18.x, @types/react-dom v18.x, @types/node v20.x
- **Vite Plugins:** @vitejs/plugin-react (for React Fast Refresh and JSX support)

### Application Structure

```
src/
├── components/
│   ├── TodoApp.tsx          # Main application component
│   ├── TodoList.tsx         # List container component
│   ├── TodoItem.tsx         # Individual task component
│   ├── TodoInput.tsx        # Task input form component
│   ├── EmptyState.tsx       # Empty list placeholder
│   └── ErrorMessage.tsx     # Error display component
├── hooks/
│   └── useTodos.ts          # Custom hook for todo operations (includes localStorage)
├── types/
│   └── todo.ts              # TypeScript type definitions
├── utils/
│   └── storage.ts           # Storage utility functions
├── index.css                # Global styles and Tailwind imports
├── App.css                  # App-specific styles
├── App.tsx                  # Root application component
└── main.tsx                 # Application entry point
```

**Implementation Notes:**

- `useLocalStorage` hook was integrated directly into `useTodos` for simplicity
- Added `ErrorMessage` component for user feedback
- Added `ErrorBoundary` component for React error handling

## Components and Interfaces

### Core Types

```typescript
interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface TodoState {
    todos: Todo[];
    isLoading: boolean;
    error: string | null;
}
```

### Component Hierarchy

#### TodoApp (Main Container)

- **Purpose:** Root component that manages global state and layout
- **Props:** None
- **State:** Manages todos array and application-level state
- **Responsibilities:**
    - Initialize application and load data from localStorage
    - Provide todo operations to child components
    - Handle global error states

#### TodoInput (Task Creation)

- **Purpose:** Input form for creating new tasks
- **Props:** `onAddTodo: (text: string) => void`
- **State:** Input value and validation state
- **Responsibilities:**
    - Handle user input and validation
    - Submit new tasks to parent component
    - Clear input after successful submission

#### TodoList (List Container)

- **Purpose:** Container for rendering the list of todos
- **Props:** `todos: Todo[]`, `onUpdateTodo: (id: string, updates: Partial<Todo>) => void`, `onDeleteTodo: (id: string) => void`
- **Responsibilities:**
    - Render TodoItem components for each task
    - Handle empty state display
    - Manage list-level interactions

#### TodoItem (Individual Task)

- **Purpose:** Render and manage individual todo items
- **Props:** `todo: Todo`, `onUpdate: (updates: Partial<Todo>) => void`, `onDelete: () => void`
- **State:** Editing mode and temporary edit value
- **Responsibilities:**
    - Display task text and completion status
    - Handle inline editing functionality
    - Manage completion toggle and deletion

#### EmptyState (Placeholder)

- **Purpose:** Display when no todos exist
- **Props:** None
- **Responsibilities:**
    - Show encouraging message for new users
    - Provide visual indication of empty state

### Custom Hooks

#### useTodos

```typescript
interface UseTodosReturn {
    todos: Todo[];
    addTodo: (text: string) => void;
    updateTodo: (id: string, updates: Partial<Todo>) => void;
    deleteTodo: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}
```

#### useLocalStorage

```typescript
interface UseLocalStorageReturn<T> {
    value: T;
    setValue: (value: T) => void;
    isLoading: boolean;
    error: string | null;
}
```

## Data Models

### Todo Entity

- **id:** Unique identifier (UUID v4)
- **text:** Task description (string, 1-500 characters)
- **completed:** Completion status (boolean)
- **createdAt:** Creation timestamp (Date)
- **updatedAt:** Last modification timestamp (Date)

### Storage Schema

```typescript
interface StorageSchema {
    todos: Todo[];
    version: string; // For future migration support
}
```

## Error Handling

### Client-Side Error Scenarios

1. **localStorage Unavailable:** Graceful degradation to session-only storage
2. **Storage Quota Exceeded:** Display warning and suggest clearing old data
3. **Invalid Data Format:** Reset to empty state with user notification
4. **Network Errors:** Not applicable for frontend-only app

### Error Display Strategy

- **Toast Notifications:** For temporary errors and success messages
- **Inline Validation:** For form input errors
- **Fallback UI:** For critical errors that prevent normal operation

### Error Recovery

- Automatic retry for transient localStorage errors
- Data validation and sanitization on load
- Graceful fallback to empty state when data is corrupted

## Testing Strategy

### Testing Framework Strategy

This project uses a **three-tier testing approach** aligned with industry best practices:

1. **Jest (v30.2.0)** - Test Runner & Assertion Library
    - Industry-standard testing framework with widespread workplace adoption
    - Comprehensive mocking capabilities and snapshot testing
    - Excellent TypeScript support via ts-jest
    - Built-in code coverage reporting

2. **React Testing Library (v16.3.0)** - Component Testing
    - User-centric testing approach (tests behavior, not implementation)
    - Encourages accessibility best practices
    - Works seamlessly with Jest
    - Recommended by React team for component testing

3. **Storybook (v9.1.10)** - Visual Component Documentation
    - Interactive component development and documentation
    - Visual regression testing capabilities
    - Isolated component development environment
    - Living documentation for design system

### Unit Testing

- **Components:** Test rendering, user interactions, and prop handling using React Testing Library
- **Hooks:** Test state management and side effects with Jest and React Testing Library hooks
- **Utilities:** Test storage operations and data transformations with Jest
- **Coverage:** Jest's built-in coverage reporting with Istanbul

### Integration Testing

- **User Workflows:** Complete CRUD operations
- **Storage Integration:** localStorage read/write operations
- **Responsive Behavior:** Different screen sizes and orientations

### Test Coverage Goals

- **Components:** 90%+ coverage for critical user paths
- **Utilities:** 100% coverage for storage and data operations
- **Hooks:** 95%+ coverage for state management logic

### Testing Approach

```typescript
// Example test structure using Jest and React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('TodoApp', () => {
    describe('Adding todos', () => {
        it('should add a new todo when valid text is provided', () => {
            // Test implementation
        });

        it('should not add todo when text is empty', () => {
            // Test implementation
        });

        it('should clear input after successful addition', () => {
            // Test implementation
        });
    });

    describe('Editing todos', () => {
        it('should enable edit mode on double click', () => {
            // Test implementation
        });

        it('should save changes on Enter key', () => {
            // Test implementation
        });

        it('should cancel edit on Escape key', () => {
            // Test implementation
        });
    });
});
```

### Version Compatibility Matrix

| Technology            | Version | Compatibility Notes                           |
| --------------------- | ------- | --------------------------------------------- |
| Node.js               | 20.19.5 | LTS until April 2026                          |
| React                 | 18.3.1  | Stable, excellent ecosystem support           |
| TypeScript            | 5.9.3   | Full React 18 support                         |
| Vite                  | 7.1.10  | Optimized for Node 20+                        |
| Tailwind CSS          | 3.4.18  | Stable (downgraded from v4 for compatibility) |
| Jest                  | 30.2.0  | Industry-standard testing framework           |
| React Testing Library | 16.3.0  | Latest stable for React 18                    |
| Storybook             | 9.1.10  | Full Vite + React 18 support                  |
| ESLint                | 9.37.0  | Latest flat config support                    |

### Installation Commands

```bash
# Initialize project with Vite
npm create vite@latest todo-app -- --template react-ts

# Install core dependencies
npm install react@18.3.1 react-dom@18.3.1

# Install Tailwind CSS (v3 for compatibility)
npm install -D tailwindcss@^3 postcss@^8 autoprefixer@^10

# Initialize Tailwind config
npx tailwindcss init -p

# Install development tools
npm install -D typescript@~5.9.3 @types/react@^18 @types/react-dom@^18 @types/node@^24

# Install testing dependencies (Jest + React Testing Library)
npm install -D jest@^30 ts-jest@^29 jest-environment-jsdom@^30 @types/jest@^30
npm install -D @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
npm install -D identity-obj-proxy@^3.0.0

# Install Storybook
npx storybook@latest init

# Install code quality tools
npm install -D eslint@^9 prettier@^3 @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D husky@^9

# Setup Git hooks
npx husky init
```

**Actual Versions Installed:**

- Tailwind CSS: v3.4.18 (stable)
- Vite: v7.1.7
- React: v18.3.1
- TypeScript: v5.9.3
- Jest: v30.2.0
- Storybook: v9.1.10

## User Interface Design

### Design System

**Implemented Color Palette (Tricolor Scheme):**

- **Primary (Blue):** Main actions, branding, trust
    - Buttons: `bg-blue-500`, `hover:bg-blue-600`
    - Checkboxes: `text-blue-600`
    - Focus rings: `ring-blue-400`
    - Headers: `text-blue-600`

- **Secondary (Yellow):** Edit states, temporary actions
    - Edit mode background: `bg-yellow-50`
    - Edit mode borders: `border-yellow-300`
    - Focus in edit: `ring-yellow-400`

- **Accent (Orange):** Destructive actions
    - Delete buttons: `text-orange-600`, `hover:text-orange-700`
    - Delete hover: `hover:bg-orange-50`

- **Neutral (Black/Gray):** Readable text
    - Body text: `text-gray-800`
    - Completed tasks: `text-gray-400`
    - Borders: `border-gray-200`, `border-gray-300`

**Background:**

- Gradient: `bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50`

**Typography:**

- Tailwind's default font system
- Headers: `text-4xl font-bold` (h1), `text-2xl font-semibold` (h2)
- Body: `text-base` with `text-gray-800` for readability

**Spacing:**

- Tailwind's spacing scale (4px base unit)
- Component gaps: `gap-2`, `gap-3`, `gap-4`
- Padding: `p-4`, `p-6`, `px-4 py-2`

**Interactive Elements:**

- Hover states: `hover:bg-blue-600`, `hover:shadow-md`
- Focus states: `focus:ring-2 focus:ring-blue-400`
- Active states: `active:bg-blue-700`
- Transitions: `transition-colors`, `transition-all`

See `docs/knowledge-transfer/architecture/color-palette.md` for complete color system documentation.

### Responsive Breakpoints

- **Mobile:** 320px - 768px (single column layout)
- **Tablet:** 768px - 1024px (optimized touch targets)
- **Desktop:** 1024px+ (enhanced keyboard navigation)

### Accessibility Features

- **Keyboard Navigation:** Full keyboard support for all interactions
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Color Contrast:** WCAG AA compliance for all text and interactive elements
- **Focus Management:** Clear focus indicators and logical tab order

### Visual Hierarchy

1. **Primary Action:** Add new todo (prominent button/input)
2. **Secondary Actions:** Edit, complete, delete (contextual controls)
3. **Content:** Todo list with clear visual separation
4. **Status Indicators:** Completion state, empty state, loading states

## Implementation Notes & Lessons Learned

### CSS Framework Decision

**Original Plan:** Tailwind CSS v4.1.14 (latest at project start)

**Actual Implementation:** Tailwind CSS v3.4.18 (stable)

**Reason for Change:**
Tailwind v4 (beta) had compatibility issues with our Vite + React setup:

- New PostCSS plugin architecture (`@tailwindcss/postcss`) incompatible with Vite
- Different import syntax (`@import 'tailwindcss'` vs `@tailwind` directives)
- No `tailwind.config.js` required (CSS-based configuration)
- Limited ecosystem support and documentation

**Resolution:**
Downgraded to Tailwind v3 for:

- ✅ Stable, production-ready version
- ✅ Full Vite compatibility
- ✅ Extensive documentation and community support
- ✅ Traditional configuration approach

**Documentation:** See `docs/knowledge-transfer/architecture/css-versioning-compatibility-lessons.md`

### Color Palette Evolution

**Original Plan:** Tailwind's default colors

**Actual Implementation:** Custom tricolor palette (blue, yellow, orange)

**Rationale:**

- Blue as primary for trust and professionalism
- Yellow for edit states (warm, temporary)
- Orange for destructive actions (caution without alarm)
- Black/gray for readable body text (accessibility)

**Documentation:** See `docs/knowledge-transfer/architecture/color-palette.md`

### Component Architecture

**Implemented Components:**

1. **TodoApp** - Main container with state management
2. **TodoInput** - Input with validation and error handling
3. **TodoItem** - Individual todo with inline editing
4. **TodoList** - List container with empty state
5. **EmptyState** - Friendly empty state message
6. **ErrorMessage** - User feedback for errors
7. **ErrorBoundary** - React error boundary for crash recovery

**Key Decisions:**

- Integrated localStorage directly into `useTodos` hook (simpler than separate hook)
- Added comprehensive error handling and user feedback
- Implemented inline editing with double-click activation
- Used controlled components for all form inputs

### Testing Approach

**Framework:** Jest + React Testing Library

**Coverage:**

- 19 tests across all components
- Focus on user behavior over implementation details
- Accessibility testing included
- 100% passing test suite

**Key Patterns:**

- Test user interactions (click, type, keyboard)
- Test accessibility (ARIA labels, keyboard navigation)
- Test error states and edge cases
- Mock localStorage for consistent tests

### Accessibility Features Implemented

- ✅ Full keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader support with proper roles
- ✅ Focus management and visible focus indicators
- ✅ WCAG AA color contrast compliance
- ✅ Error announcements with `role="alert"`

**Documentation:** See `docs/knowledge-transfer/architecture/todoinput-accessibility-audit.md`

### Future Scalability Considerations

**CSS Architecture:**
For future growth, consider implementing:

- Design token system (semantic color names)
- Component composition with `class-variance-authority`
- Storybook for component documentation
- Theme management for dark mode

**Documentation:** See `docs/knowledge-transfer/architecture/scalable-css-architecture-recommendations.md`

**Deployment:**
For production deployment, recommended approach:

- AWS S3 + CloudFront (~$1-10/month)
- Global CDN for performance
- HTTPS by default
- Easy CI/CD integration

**Documentation:** See `docs/knowledge-transfer/deployment/aws-deployment-options-frontend.md`

## References

### Documentation

- **Project Overview:** `docs/knowledge-transfer/architecture/project-completion-summary.md`
- **CSS Lessons:** `docs/knowledge-transfer/architecture/css-versioning-compatibility-lessons.md`
- **Color System:** `docs/knowledge-transfer/architecture/color-palette.md`
- **Scalable CSS:** `docs/knowledge-transfer/architecture/scalable-css-architecture-recommendations.md`
- **Deployment:** `docs/knowledge-transfer/deployment/aws-deployment-options-frontend.md`
- **Task Documentation:** `docs/knowledge-transfer/tasks/`

### External Resources

- [Tailwind CSS v3 Documentation](https://tailwindcss.com/docs)
- [React 18 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

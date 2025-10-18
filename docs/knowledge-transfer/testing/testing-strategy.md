# Testing Strategy

## Overview

This document outlines the testing strategy for the todo-list-app project. It defines what types of tests we write, when to use each approach, and how tests are organized.

## Testing Philosophy

**Core Principle:** Tests should validate requirements, not just code execution.

Our tests answer the question: "Does this prove the requirement is satisfied?" rather than "Does this code run without errors?"

## Testing Pyramid

```
        /\
       /E2E\         <- Not used in this project
      /------\
     /Integration\   <- 80% of our tests (Component Integration)
    /------------\
   /  Unit Tests  \  <- 20% of our tests (Pure functions, utilities)
  /----------------\
```

## Testing Levels

### Component Integration Tests (Primary Strategy)

**What:** Test components with their immediate children, validating user flows end-to-end.

**When to use:**

- Testing user interactions and flows
- Validating requirements
- Testing component composition
- Verifying state management across components

**Example:**

```typescript
describe('Requirement 1: Add new tasks', () => {
  it('WHEN user enters text AND clicks Add THEN system SHALL create and display task', () => {
    render(<TodoApp />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.click(button);

    // Verify requirement: task is created AND displayed
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(input.value).toBe('');
  });
});
```

**Benefits:**

- ✅ Validates actual requirements
- ✅ Tests multiple components working together
- ✅ Resilient to refactoring (tests behavior, not implementation)
- ✅ Mirrors how users interact with the app
- ✅ High confidence with fewer tests

**Tradeoffs:**

- ⚠️ Slightly slower than pure unit tests (still fast)
- ⚠️ More setup required
- ⚠️ May need to mock external dependencies (localStorage, APIs)

### Unit Tests (Supporting Strategy)

**What:** Test isolated functions, utilities, and complex logic.

**When to use:**

- Pure functions with no side effects
- Complex business logic
- Utility functions (validation, formatting, calculations)
- Custom hooks with intricate state management

**Example:**

```typescript
describe('isValidTodo', () => {
    it('should return false for empty string', () => {
        expect(isValidTodo('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
        expect(isValidTodo('   ')).toBe(false);
    });

    it('should return true for valid text', () => {
        expect(isValidTodo('Buy milk')).toBe(true);
    });
});
```

**Benefits:**

- ✅ Very fast feedback loop
- ✅ Easy to test edge cases
- ✅ Simple to debug
- ✅ Good for TDD of algorithms

**Tradeoffs:**

- ⚠️ Doesn't prove components work together
- ⚠️ Can lead to testing implementation details
- ⚠️ More tests to maintain

### E2E Tests (Not Used)

**Why we skip E2E tests:**

- ❌ Slow (seconds per test vs milliseconds)
- ❌ Flaky (timing issues, browser quirks)
- ❌ Expensive to maintain
- ❌ Overkill for a learning project
- ❌ Component integration tests provide sufficient confidence

## Test Organization

### Directory Structure

```
src/
├── components/
│   ├── TodoInput.tsx
│   ├── TodoItem.tsx
│   └── TodoList.tsx
├── utils/
│   ├── validation.ts
│   └── todoHelpers.ts
├── App.tsx
└── __tests__/
    ├── integration/
    │   ├── AddTodo.test.tsx          // Requirement 1
    │   ├── ViewTodos.test.tsx        // Requirement 2
    │   ├── CompleteTodos.test.tsx    // Requirement 3
    │   ├── EditTodos.test.tsx        // Requirement 4
    │   ├── DeleteTodos.test.tsx      // Requirement 5
    │   └── Persistence.test.tsx      // Requirement 6
    └── unit/
        ├── validation.test.ts
        └── todoHelpers.test.ts
```

**Key principle:** Tests are organized by **requirements**, not by components.

### Naming Conventions

**Integration tests:**

- File: `[Requirement].test.tsx`
- Describe block: `Requirement X: [User Story]`
- Test cases: `WHEN [action] THEN system SHALL [outcome]` (mirrors acceptance criteria)

**Unit tests:**

- File: `[module].test.ts`
- Describe block: `[functionName]`
- Test cases: `should [expected behavior] when [condition]`

## Test Coverage Goals

### Coverage Targets

- **Overall:** 80%+ coverage
- **Critical paths:** 100% coverage (add, edit, delete, persist)
- **Utility functions:** 100% coverage
- **UI components:** Focus on behavior, not implementation

### What NOT to Test

- Third-party library internals (React, React Testing Library)
- Trivial getters/setters
- Constants and configuration
- Type definitions
- Storybook stories (they're documentation, not tests)

## Testing Tools

### Primary Tools

- **Jest:** Test runner and assertion library
- **React Testing Library:** Component testing utilities
- **@testing-library/jest-dom:** Custom matchers for DOM assertions
- **@testing-library/user-event:** Simulate user interactions (future enhancement)

### Mocking Strategy

**What to mock:**

- ✅ External APIs (fetch, axios)
- ✅ Browser APIs (localStorage, sessionStorage)
- ✅ Date/time functions (for deterministic tests)
- ✅ Third-party services

**What NOT to mock:**

- ❌ Child components (test them together)
- ❌ React hooks (useState, useEffect)
- ❌ Internal functions (test behavior, not implementation)

## TDD Workflow

### Red-Green-Refactor Cycle

1. **Red:** Write a failing test that validates a requirement
2. **Green:** Write minimal code to make the test pass
3. **Refactor:** Improve code quality while keeping tests green

### Integration Test TDD Process

```typescript
// 1. RED: Write failing test for requirement
describe('Requirement 1: Add new tasks', () => {
  it('should add task when user submits', () => {
    render(<TodoApp />);
    // ... test fails because TodoApp doesn't exist
  });
});

// 2. GREEN: Implement minimal code
export function TodoApp() {
  return <div>Todo App</div>;
}
// ... test still fails, add more code

// 3. REFACTOR: Improve code quality
// Extract components, improve naming, add comments
// Tests should still pass
```

## Best Practices

### Do's ✅

1. **Test user behavior, not implementation**
    - ✅ `expect(screen.getByText('Buy milk')).toBeInTheDocument()`
    - ❌ `expect(component.state.todos).toHaveLength(1)`

2. **Use semantic queries**
    - ✅ `getByRole('button', { name: /add/i })`
    - ❌ `getByTestId('add-button')`

3. **Test accessibility**
    - Verify ARIA labels
    - Test keyboard navigation
    - Ensure screen reader compatibility

4. **Write descriptive test names**
    - ✅ `should display error when user submits empty task`
    - ❌ `test 1`

5. **Organize by requirements**
    - Group tests by user stories
    - Reference acceptance criteria
    - Make traceability clear

### Don'ts ❌

1. **Don't test implementation details**
    - ❌ Testing internal state
    - ❌ Testing private methods
    - ❌ Testing component structure

2. **Don't mock everything**
    - Only mock external dependencies
    - Test components together when possible

3. **Don't write tests just for coverage**
    - Focus on valuable tests
    - Skip trivial code

4. **Don't duplicate tests**
    - If integration test covers it, don't unit test it
    - Avoid testing the same thing multiple ways

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- AddTodo.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests silently (for CI/CD)
npm test -- --silent
```

### CI/CD Integration

Tests run automatically on:

- Every commit (via git hooks)
- Pull requests
- Before deployment

## Maintenance

### When to Update Tests

- ✅ When requirements change
- ✅ When bugs are found (add regression test)
- ✅ When refactoring breaks tests
- ❌ When implementation details change (tests should still pass)

### Test Debt

If tests become a burden:

1. Review if they're testing behavior vs implementation
2. Consider if they're at the right level (unit vs integration)
3. Refactor tests to be more maintainable
4. Remove tests that don't add value

## Success Metrics

### Quality Indicators

- ✅ All requirements have corresponding tests
- ✅ Tests are easy to understand and maintain
- ✅ Tests catch real bugs before production
- ✅ Tests don't break during refactoring
- ✅ Test suite runs quickly (< 10 seconds)

### Red Flags

- 🚩 Tests break when refactoring working code
- 🚩 Tests are hard to understand
- 🚩 Tests take too long to run
- 🚩 Tests don't catch real bugs
- 🚩 Developers skip writing tests

## References

- [React Testing Library Documentation](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing JavaScript by Kent C. Dodds](https://testingjavascript.com/)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

_This strategy evolves as we learn. Update this document when we discover better approaches._

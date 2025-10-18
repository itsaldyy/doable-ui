---
title: Test-Driven Development (TDD) Practices
inclusion: always
---

# Test-Driven Development (TDD) Practices

## Core TDD Principle

**Red → Green → Refactor**

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green

## Why TDD?

- ✅ **Better Design**: Writing tests first forces you to think about the API
- ✅ **Confidence**: Tests prove the code works
- ✅ **Documentation**: Tests document expected behavior
- ✅ **Regression Prevention**: Tests catch breaking changes
- ✅ **Faster Debugging**: Know immediately when something breaks

## Task Structure for TDD

### ❌ WRONG (Implementation First)

```markdown
- [ ]   5. Build TodoInput component
    - Create input form with validation
    - Handle Enter key submission
    - Style with Tailwind CSS

- [ ] 5.1 Write unit tests for TodoInput
    - Test input validation
    - Test submission
```

### ✅ CORRECT (Tests First)

```markdown
- [ ]   5. Build TodoInput component (TDD)
- [ ] 5.1 Write failing tests for basic rendering
    - Test: Component renders input field
    - Test: Component renders submit button
- [ ] 5.2 Implement basic TodoInput structure
    - Create component with input and button
    - Make rendering tests pass
- [ ] 5.3 Write failing tests for text input handling
    - Test: Input value updates on change
    - Test: Input accepts text
- [ ] 5.4 Implement text input handling
    - Add onChange handler
    - Add state management
    - Make input tests pass
- [ ] 5.5 Write failing tests for validation
    - Test: Empty input shows error
    - Test: Valid input clears error
- [ ] 5.6 Implement validation logic
    - Add validation function
    - Add error state
    - Make validation tests pass
- [ ] 5.7 Refactor for code quality
    - Extract validation logic
    - Improve naming
    - Ensure all tests still pass
```

## TDD Workflow for Each Feature

### Step 1: Write Failing Test (Red)

```typescript
// TodoInput.test.tsx
describe('TodoInput', () => {
    it('should render an input field', () => {
        render(<TodoInput onSubmit={jest.fn()} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});

// Run test: npm test
// Result: ❌ FAIL - Component doesn't exist yet
```

### Step 2: Write Minimal Code (Green)

```typescript
// TodoInput.tsx
export function TodoInput({ onSubmit }: Props) {
    return <input type="text" />;
}

// Run test: npm test
// Result: ✅ PASS - Test passes!
```

### Step 3: Refactor (Keep Green)

```typescript
// TodoInput.tsx
export function TodoInput({ onSubmit }: Props) {
    return (
        <input
            type="text"
            className="border rounded px-4 py-2"
            aria-label="New todo"
        />
    );
}

// Run test: npm test
// Result: ✅ PASS - Still passes after refactoring!
```

### Step 4: Repeat for Next Behavior

Write next failing test → Implement → Refactor → Repeat

## Rules for Kiro Agent

### When Implementing Features

1. **ALWAYS write tests before implementation**
2. **Run tests after writing them** (they should fail)
3. **Write minimal code** to make tests pass
4. **Run tests again** (they should pass)
5. **Refactor if needed** (tests should still pass)
6. **Move to next behavior** and repeat

### Task Breakdown Pattern

For each component/feature:

```markdown
- [ ] X. Build [Component] (TDD)
- [ ] X.1 Write tests for [behavior 1]
- [ ] X.2 Implement [behavior 1]
- [ ] X.3 Write tests for [behavior 2]
- [ ] X.4 Implement [behavior 2]
- [ ] X.5 Write tests for [behavior 3]
- [ ] X.6 Implement [behavior 3]
- [ ] X.7 Refactor and polish
- [ ] X.8 Create Storybook stories (documentation)
```

### Test Granularity

Break down tests by behavior:

- **Rendering**: Does it show up?
- **Interaction**: Does it respond to user input?
- **Validation**: Does it handle invalid input?
- **Integration**: Does it work with other components?
- **Edge Cases**: Does it handle errors gracefully?

## Example: TodoInput Component (TDD)

### Iteration 1: Basic Rendering

```typescript
// 1. Write failing test
it('renders input field', () => {
    render(<TodoInput onSubmit={jest.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
});

// 2. Implement minimal code
export function TodoInput({ onSubmit }: Props) {
    return <input type="text" />;
}

// 3. Test passes ✅
```

### Iteration 2: Text Input

```typescript
// 1. Write failing test
it('updates input value on change', () => {
    render(<TodoInput onSubmit={jest.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New todo' } });
    expect(input).toHaveValue('New todo');
});

// 2. Implement
export function TodoInput({ onSubmit }: Props) {
    const [value, setValue] = useState('');
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
}

// 3. Test passes ✅
```

### Iteration 3: Submission

```typescript
// 1. Write failing test
it('calls onSubmit with input value on Enter', () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13 });
    expect(onSubmit).toHaveBeenCalledWith('New todo');
});

// 2. Implement
export function TodoInput({ onSubmit }: Props) {
    const [value, setValue] = useState('');

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && value.trim()) {
            onSubmit(value.trim());
            setValue('');
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
        />
    );
}

// 3. Test passes ✅
```

## Benefits of This Approach

1. **Incremental Progress**: Small, verifiable steps
2. **Always Working**: Code is always in a working state
3. **Clear Goals**: Each test defines what to build next
4. **Confidence**: Tests prove everything works
5. **Documentation**: Tests show how to use the code

## Anti-Patterns to Avoid

### ❌ Writing All Tests at Once

Don't write 20 tests and then implement everything. Write one test, implement, repeat.

### ❌ Writing Implementation First

Don't write code and then add tests. Tests should drive the implementation.

### ❌ Skipping the Red Phase

Don't write tests that pass immediately. See them fail first to ensure they're testing something.

### ❌ Over-Engineering

Don't add features that aren't tested. Only implement what the tests require.

## Summary

**TDD is not optional - it's the standard way we build features.**

Every feature follows: **Test → Implement → Refactor → Repeat**

This ensures high-quality, well-tested, maintainable code.

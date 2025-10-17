# Test File Reorganization

## Date

[Current Session]

## What Changed

Reorganized all test files to follow our documented testing strategy by consolidating them under the `src/__tests__/` directory.

## Before (Old Structure)

```
src/
├── components/
│   ├── TodoInput.tsx
│   ├── TodoInput.test.tsx          ❌ Test file in component folder
│   └── TodoInput.stories.ts
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useLocalStorage.test.ts     ❌ Test file in hooks folder
│   ├── useTodos.ts
│   └── useTodos.test.ts            ❌ Test file in hooks folder
└── __tests__/
    └── integration/
        └── AddTodo.test.tsx         ✅ Integration test in correct location
```

**Problems with old structure:**

- Test files scattered across multiple directories
- Inconsistent with documented testing strategy
- Harder to find and manage tests
- Doesn't clearly separate unit vs integration tests

## After (New Structure)

```
src/
├── components/
│   ├── TodoInput.tsx
│   └── TodoInput.stories.ts
├── hooks/
│   ├── useLocalStorage.ts
│   └── useTodos.ts
└── __tests__/
    ├── integration/                 ✅ All integration tests
    │   └── AddTodo.test.tsx
    └── unit/                        ✅ All unit tests
        ├── TodoInput.test.tsx
        ├── useLocalStorage.test.ts
        └── useTodos.test.ts
```

**Benefits of new structure:**

- All tests in one place (`src/__tests__/`)
- Clear separation: `integration/` vs `unit/`
- Aligns with documented testing strategy
- Easier to navigate and maintain
- Follows industry best practices

## Changes Made

### 1. Created Unit Test Directory

```bash
src/__tests__/unit/
```

### 2. Moved Test Files

**TodoInput component test:**

- From: `src/components/TodoInput.test.tsx`
- To: `src/__tests__/unit/TodoInput.test.tsx`
- Updated import: `from './TodoInput'` → `from '../../components/TodoInput'`

**useLocalStorage hook test:**

- From: `src/hooks/useLocalStorage.test.ts`
- To: `src/__tests__/unit/useLocalStorage.test.ts`
- Updated import: `from './useLocalStorage'` → `from '../../hooks/useLocalStorage'`

**useTodos hook test:**

- From: `src/hooks/useTodos.test.ts`
- To: `src/__tests__/unit/useTodos.test.ts`
- Updated imports:
    - `from './useTodos'` → `from '../../hooks/useTodos'`
    - `from '../utils/storage'` → `from '../../utils/storage'`
    - `from '../types/todo'` → `from '../../types/todo'`
- Updated mock: `jest.mock('../utils/storage')` → `jest.mock('../../utils/storage')`

### 3. Deleted Old Test Files

- ❌ Deleted: `src/components/TodoInput.test.tsx`
- ❌ Deleted: `src/hooks/useLocalStorage.test.ts`
- ❌ Deleted: `src/hooks/useTodos.test.ts`

## Test Results

**Before reorganization:** 69 tests passing ✅
**After reorganization:** 69 tests passing ✅

All tests continue to pass with the new structure!

```bash
Test Suites: 4 passed, 4 total
Tests:       69 passed, 69 total
Snapshots:   0 total
Time:        4.123 s
```

## Test File Breakdown

### Integration Tests (1 file, 8 tests)

- `src/__tests__/integration/AddTodo.test.tsx` - Requirement 1 validation

### Unit Tests (3 files, 61 tests)

- `src/__tests__/unit/TodoInput.test.tsx` - 11 tests (component behavior)
- `src/__tests__/unit/useLocalStorage.test.ts` - 31 tests (hook logic)
- `src/__tests__/unit/useTodos.test.ts` - 19 tests (hook logic)

## Alignment with Testing Strategy

This reorganization aligns with our documented testing strategy:

### From `docs/testing-strategy.md`:

> **Test Organization**
>
> Tests are organized by **requirements** (integration) and **type** (unit), not by component structure.

### Directory Structure Now Matches Documentation:

```
src/__tests__/
├── integration/          # Tests organized by requirements
│   ├── AddTodo.test.tsx          // Requirement 1
│   ├── ViewTodos.test.tsx        // Requirement 2 (future)
│   ├── CompleteTodos.test.tsx    // Requirement 3 (future)
│   └── ...
└── unit/                 # Tests organized by type
    ├── TodoInput.test.tsx         // Component tests
    ├── useLocalStorage.test.ts    // Hook tests
    ├── useTodos.test.ts           // Hook tests
    └── ...                        // Future utility tests
```

## Benefits for Future Development

### 1. Clear Test Location

**Question:** "Where do I put my test?"
**Answer:**

- Integration test (validates requirement)? → `__tests__/integration/`
- Unit test (tests isolated logic)? → `__tests__/unit/`

### 2. Easy Test Discovery

All tests are in one place, making it easy to:

- Run all tests: `npm test`
- Run only integration tests: `npm test -- integration`
- Run only unit tests: `npm test -- unit`
- Find tests for code review

### 3. Consistent with Industry Standards

This structure follows common patterns in React projects:

- Jest default configuration looks for `__tests__/` directories
- Clear separation of test types
- Easy to configure different test runners for different types

### 4. Scalability

As the project grows:

- Integration tests organized by requirement (easy to track coverage)
- Unit tests organized by type (components, hooks, utils)
- No confusion about where tests belong

## Migration Guide for Future Tests

### When Creating New Tests

**For Integration Tests (Requirement Validation):**

```bash
# Create in: src/__tests__/integration/
# Name: [RequirementName].test.tsx
# Example: src/__tests__/integration/EditTodos.test.tsx
```

**For Unit Tests (Component/Hook/Utility):**

```bash
# Create in: src/__tests__/unit/
# Name: [ComponentName].test.tsx or [hookName].test.ts
# Example: src/__tests__/unit/TodoItem.test.tsx
```

### Import Path Patterns

**From integration tests:**

```typescript
import App from '../../App';
import { SomeComponent } from '../../components/SomeComponent';
```

**From unit tests:**

```typescript
import { SomeComponent } from '../../components/SomeComponent';
import { useCustomHook } from '../../hooks/useCustomHook';
import { helperFunction } from '../../utils/helpers';
```

## Verification

To verify the reorganization was successful:

1. ✅ All tests pass
2. ✅ No test files remain in `components/` or `hooks/` directories
3. ✅ All test files are in `__tests__/integration/` or `__tests__/unit/`
4. ✅ Import paths are correct
5. ✅ Mock paths are correct
6. ✅ Test count remains the same (69 tests)

## Related Documentation

- [Testing Strategy](./testing-strategy.md) - Overall testing approach
- [Testing Decisions and Rationale](./testing-decisions-and-rationale.md) - Why we chose this strategy
- [Task 5 Refactoring Summary](./task-5-refactoring-summary.md) - Integration test implementation

---

_This reorganization improves code organization and aligns with our documented testing strategy._

# Task 3: Implement localStorage Custom Hook

## Task Summary & Goal

**Objective:** Create a reusable React custom hook (`useLocalStorage`) that provides a robust interface for managing localStorage operations with comprehensive error handling, data validation, migration support, and graceful degradation when localStorage is unavailable.

This task addresses Requirements 6.1, 6.2, and 6.3 from the requirements document:

- 6.1: Save changes to browser local storage
- 6.2: Load previously saved data from local storage
- 6.3: Handle localStorage unavailability with warning and session-only storage

## Analysis & Rationale

### Context & Background

The application requires persistent storage of todo items across browser sessions. While the `src/utils/storage.ts` file provides low-level storage utilities, we needed a React-friendly hook that:

1. Integrates seamlessly with React's state management
2. Handles loading states for better UX
3. Provides error boundaries for storage failures
4. Supports data validation and migration for future schema changes
5. Enables cross-tab synchronization for multi-window scenarios

### Thought Process & Rationale

**Key Design Decisions:**

1. **Generic Type Parameter (`<T>`)**: The hook uses TypeScript generics to support any data type while maintaining type safety. This makes it reusable across different storage needs beyond just todos.

2. **Options Pattern**: Instead of multiple parameters, we use an options object with three optional properties:
    - `validate`: Type guard function for runtime data validation
    - `migrate`: Function to transform old data formats to new ones
    - `syncAcrossTabs`: Boolean flag to enable/disable cross-tab synchronization

3. **Graceful Degradation**: When localStorage is unavailable (private browsing, quota exceeded, etc.), the hook continues to work with in-memory state only, setting an error message to inform the user.

4. **Functional Updates**: Following React's `useState` pattern, `setValue` supports both direct values and updater functions: `setValue(newValue)` or `setValue(prev => transform(prev))`.

5. **Storage Event Listener**: For cross-tab sync, we use the browser's native `storage` event, which fires when localStorage is modified in another tab/window.

6. **Error Classification**: Different error types (quota exceeded, invalid data, unavailable storage) are handled distinctly with appropriate user-facing messages.

**Alternatives Considered:**

- **Using Context API**: We could have created a StorageContext, but a hook is more flexible and doesn't require wrapping components in providers.
- **Automatic Retry Logic**: We decided against automatic retries for failed operations to avoid infinite loops and give users control.
- **Debouncing Writes**: Not implemented to keep the hook simple, but could be added as an option in the future.

## Deliverables & Outcomes

### Output

**1. `src/hooks/useLocalStorage.ts`** - The custom hook implementation with:

- Full TypeScript type safety with generics
- Comprehensive error handling for all failure scenarios
- Optional data validation via type guard functions
- Optional data migration for schema evolution
- Optional cross-tab synchronization
- Loading state management
- Availability detection

**2. `src/hooks/useLocalStorage.test.ts`** - Comprehensive test suite with 19 tests covering:

- Basic read/write operations
- Data validation with custom validators
- Data migration from old formats
- Error handling (unavailable storage, quota exceeded, invalid JSON)
- Cross-tab synchronization with validation
- Complex data types (arrays, nested objects, null values)
- Functional updates
- Loading states

### Benefits & Impact

**Direct Benefits:**

- **Type Safety**: Generic types prevent runtime type errors
- **Reusability**: Can be used for any localStorage needs, not just todos
- **Reliability**: Comprehensive error handling prevents app crashes
- **User Experience**: Loading states enable better UI feedback
- **Future-Proof**: Migration support allows schema changes without data loss

**Indirect Benefits:**

- **Developer Experience**: Clean API that follows React conventions
- **Testability**: Pure functions and clear interfaces make testing straightforward
- **Maintainability**: Well-documented code with JSDoc comments
- **Accessibility**: Error messages help users understand storage issues

**Test Coverage:**

- All 19 tests pass successfully
- Coverage includes happy paths, edge cases, and error scenarios
- Tests verify both functionality and error handling

## Synthesis & Future Implications

### Key Learnings

1. **React Hooks Lifecycle**: The useEffect hook runs after render, so initial loading state management requires careful consideration. We set `isLoading: true` initially and update it in the effect.

2. **Storage Event Limitations**: The `storage` event only fires in other tabs/windows, not the current one. This is by design in the browser API.

3. **Type Guards in TypeScript**: Using type guard functions (`(data: unknown): data is T`) provides runtime validation while maintaining compile-time type safety.

4. **Error Handling Strategy**: Distinguishing between different error types (quota, unavailability, invalid data) allows for more helpful user feedback.

### Next Steps

**Immediate Next Steps (Task 4):**

- Create `useTodos` hook that leverages `useLocalStorage`
- Implement CRUD operations for todo items
- Integrate with the storage utilities from `src/utils/storage.ts`
- Add todo-specific validation and sorting logic

**Future Enhancements:**

- Add debouncing option to reduce write frequency
- Implement automatic retry with exponential backoff
- Add compression for large datasets
- Support for IndexedDB fallback for larger data
- Add telemetry for storage errors

**Potential Improvements:**

- Consider adding a `clear()` method to the return value
- Add support for storage size monitoring
- Implement automatic cleanup of old data
- Add TypeScript strict mode compliance checks

### Integration Points

This hook will be consumed by:

1. **useTodos hook** (Task 4) - Main consumer for todo persistence
2. **Future hooks** - Can be reused for user preferences, app settings, etc.

The hook integrates with:

- Existing storage utilities in `src/utils/storage.ts`
- React's state management system
- Browser's localStorage and storage event APIs

# Jest SVG Import Fix for vite-plugin-svgr

## Task Summary & Goal

**Objective:** Fix failing integration tests caused by Jest's inability to resolve `*.svg?react` imports that are transformed by `vite-plugin-svgr` in the Vite build process.

**Error Message:**

```
FAIL  src/__tests__/integration/TodoApp.test.tsx
● Test suite failed to run

src/components/TodoApp.tsx:6:24 - error TS2307: Cannot find module '../assets/doable.svg?react' or its corresponding type declarations.

6 import DoableIcon from '../assets/doable.svg?react';
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Analysis & Rationale

### Context & Background

After implementing custom SVG icons using `vite-plugin-svgr`, the application worked perfectly in development and production builds. However, integration tests started failing because Jest's test environment doesn't use Vite's build pipeline.

**Referenced Files:**

- `src/components/TodoApp.tsx` - Component importing SVG with `?react` suffix
- `src/__tests__/integration/TodoApp.test.tsx` - Failing integration test
- `src/__tests__/integration/ErrorHandling.test.tsx` - Failing integration test
- `jest.config.js` - Jest configuration
- `tsconfig.app.json` - TypeScript configuration
- `src/vite-env.d.ts` - Type declarations

**Test Results Before Fix:**

```
PASS  src/__tests__/unit/TodoInput.test.tsx
PASS  src/__tests__/unit/useTodos.test.ts
PASS  src/__tests__/unit/TodoItem.test.tsx
PASS  src/__tests__/unit/useLocalStorage.test.ts
PASS  src/__tests__/unit/TodoList.test.tsx
PASS  src/__tests__/unit/EmptyState.test.tsx
FAIL  src/__tests__/integration/TodoApp.test.tsx
FAIL  src/__tests__/integration/ErrorHandling.test.tsx

Test Suites: 2 failed, 6 passed, 8 total
Tests:       102 passed, 102 total
```

### Thought Process & Rationale

**Understanding the Problem:**

1. **Vite's Build Process:**
    - Vite uses `vite-plugin-svgr` to transform SVG files
    - The `?react` suffix tells the plugin to convert SVG to React component
    - This transformation happens at build time

2. **Jest's Test Environment:**
    - Jest uses `ts-jest` to transform TypeScript files
    - Jest doesn't run through Vite's build pipeline
    - `ts-jest` doesn't know about `vite-plugin-svgr` transformations
    - TypeScript compiler can't find module declarations for `*.svg?react`

3. **Why Unit Tests Passed:**
    - Unit tests don't import `TodoApp` component
    - They test individual components that don't use SVG imports
    - Integration tests import the full `TodoApp` which includes the SVG

**Solution Approaches Considered:**

1. **Remove SVG imports from components** ❌
    - Would break the feature we just implemented
    - Not sustainable

2. **Use inline SVG in tests only** ❌
    - Would create test/production code divergence
    - Hard to maintain

3. **Mock SVG imports in Jest** ✅
    - Standard Jest pattern for asset mocking
    - Keeps production code unchanged
    - Tests focus on behavior, not visual rendering
    - Sustainable and maintainable

4. **Configure Jest to use Vite** ❌
    - Overly complex
    - Slower test execution
    - Not standard practice

**Why Option 3 (Mocking) is Best:**

- **Separation of Concerns**: Tests verify behavior, not SVG rendering
- **Performance**: Mocks are faster than real SVG processing
- **Standard Practice**: Jest documentation recommends mocking assets
- **Maintainable**: Clear, simple configuration
- **Scalable**: Works for all SVG imports automatically

## Deliverables & Outcomes

### Output

**1. SVG Mock Component** (`src/__mocks__/svgMock.tsx`)

```typescript
import * as React from 'react';

// Mock SVG component for Jest tests
// This replaces actual SVG imports with a simple svg element for testing
const SvgMock = React.forwardRef<
    SVGSVGElement,
    React.SVGProps<SVGSVGElement>
>((props, ref) => <svg ref={ref} {...props} data-testid="svg-mock" />);

SvgMock.displayName = 'SvgMock';

export default SvgMock;
```

**Key Design Decisions:**

- Uses `import * as React` instead of `import React` to avoid esModuleInterop issues
- Implements `forwardRef` to match real SVG component behavior
- Accepts all SVG props for flexibility
- Adds `data-testid="svg-mock"` for test queries if needed
- Sets `displayName` for better debugging

**2. Updated Jest Configuration** (`jest.config.js`)

```javascript
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  '\\.svg\\?react$': '<rootDir>/src/__mocks__/svgMock.tsx',  // ← Added
  '\\.svg$': '<rootDir>/src/__mocks__/svgMock.tsx',          // ← Added
},

transform: {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,  // ← Added to silence warnings
        types: [
          'vite/client',
          'vite-plugin-svgr/client',  // ← Added
          'jest',
          '@testing-library/jest-dom'
        ],
      },
    },
  ],
},
```

**Configuration Breakdown:**

- **`moduleNameMapper`**: Maps SVG imports to mock component
    - `\.svg\?react$` - Matches imports with `?react` suffix
    - `\.svg$` - Matches plain SVG imports (fallback)
    - Both point to the same mock for consistency

- **`transform.tsconfig`**: TypeScript config for ts-jest
    - `esModuleInterop: true` - Allows default imports from CommonJS modules
    - `types` array - Includes vite-plugin-svgr types for Jest environment

**3. Enhanced Type Declarations** (`src/vite-env.d.ts`)

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg?react' {
    import { FunctionComponent, SVGProps } from 'react';
    const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}

declare module '*.svg' {
    const content: string;
    export default content;
}
```

**Why Explicit Declarations:**

- `vite-plugin-svgr/client` types might not be picked up by ts-jest
- Explicit declarations ensure TypeScript recognizes the modules
- Works in both Vite and Jest environments
- Provides proper type checking and autocomplete

**4. Updated TypeScript Configuration** (`tsconfig.app.json`)

```json
{
    "compilerOptions": {
        "types": [
            "vite/client",
            "vite-plugin-svgr/client", // ← Added
            "jest",
            "@testing-library/jest-dom"
        ]
        // ... other options
    }
}
```

**Why This Matters:**

- Ensures vite-plugin-svgr types are available project-wide
- TypeScript can resolve type definitions in all contexts
- Prevents type errors in both IDE and test runner

### Benefits & Impact

**Immediate Benefits:**

- ✅ All 131 tests passing (was 102 passing, 2 suites failing)
- ✅ No TypeScript errors in test files
- ✅ No warnings during test execution
- ✅ Integration tests can now import components with SVG icons

**Developer Experience:**

- Tests run faster (mocks are lighter than real SVGs)
- Clear error messages if SVG imports fail
- Easy to debug with `data-testid` attribute
- Standard Jest patterns that developers recognize

**Code Quality:**

- Maintains separation between test and production code
- Tests focus on behavior, not implementation details
- Type-safe SVG imports in all contexts
- Consistent handling of all asset types (CSS, SVG, etc.)

**Maintainability:**

- Single mock file handles all SVG imports
- Adding new SVG icons requires no test changes
- Clear documentation for future developers
- Standard Jest configuration patterns

## Synthesis & Future Implications

### Key Learnings

1. **Build Tool vs Test Runner Differences:**
    - Vite and Jest have different module resolution strategies
    - Build-time transformations (like `?react` suffix) don't work in Jest
    - Need to bridge the gap with mocks and configuration

2. **TypeScript in Multiple Contexts:**
    - Type declarations must work in both Vite and Jest environments
    - `ts-jest` uses its own TypeScript configuration
    - Explicit module declarations provide better compatibility

3. **Asset Mocking in Jest:**
    - Standard practice for images, SVGs, CSS, etc.
    - Keeps tests fast and focused on behavior
    - `moduleNameMapper` is the key configuration

4. **Import Syntax Matters:**
    - `import React from 'react'` requires `esModuleInterop`
    - `import * as React from 'react'` works without it
    - Choose syntax based on project configuration

### Best Practices Established

**For Future Asset Imports:**

1. **Always add moduleNameMapper entries:**

    ```javascript
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
      '\\.svg\\?react$': '<rootDir>/src/__mocks__/svgMock.tsx',
    }
    ```

2. **Create type-safe mocks:**

    ```typescript
    // Good: Type-safe, matches real component API
    const Mock = React.forwardRef<HTMLElement, Props>((props, ref) => ...);

    // Bad: Untyped, might miss prop issues
    const Mock = () => <div />;
    ```

3. **Document mock purpose:**

    ```typescript
    // Mock SVG component for Jest tests
    // This replaces actual SVG imports with a simple svg element for testing
    ```

4. **Include test identifiers:**
    ```typescript
    <svg {...props} data-testid="svg-mock" />
    // Allows tests to query: screen.getByTestId('svg-mock')
    ```

### Next Steps

**Potential Enhancements:**

1. **Create additional asset mocks:**

    ```javascript
    // For images
    src / __mocks__ / imageMock.tsx;

    // For fonts
    src / __mocks__ / fontMock.ts;
    ```

2. **Add SVG-specific test utilities:**

    ```typescript
    // src/__tests__/utils/svgTestUtils.ts
    export const getSvgIcon = () => screen.getByTestId('svg-mock');
    export const assertIconRendered = () =>
        expect(getSvgIcon()).toBeInTheDocument();
    ```

3. **Document testing patterns:**

    ```markdown
    # Testing Components with Icons

    When testing components that use SVG icons:

    - Icons are mocked as simple <svg> elements
    - Focus on component behavior, not icon rendering
    - Use aria-labels for accessibility testing
    ```

4. **Consider visual regression testing:**
    - For actual SVG rendering verification
    - Use tools like Storybook + Chromatic
    - Separate from unit/integration tests

### Troubleshooting Guide

**If SVG imports fail in tests:**

1. **Check moduleNameMapper:**

    ```javascript
    // Ensure pattern matches your import
    '\\.svg\\?react$': '<rootDir>/src/__mocks__/svgMock.tsx'
    ```

2. **Verify mock file exists:**

    ```bash
    ls -la src/__mocks__/svgMock.tsx
    ```

3. **Check TypeScript types:**

    ```typescript
    // Ensure vite-env.d.ts has module declarations
    declare module '*.svg?react' { ... }
    ```

4. **Verify ts-jest configuration:**

    ```javascript
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: {
          types: ['vite-plugin-svgr/client', ...]
        }
      }]
    }
    ```

5. **Clear Jest cache:**
    ```bash
    npx jest --clearCache
    npm test
    ```

**If esModuleInterop warnings appear:**

1. **Add to ts-jest config:**

    ```javascript
    tsconfig: {
        esModuleInterop: true;
    }
    ```

2. **Or update mock imports:**
    ```typescript
    // Use namespace import
    import * as React from 'react';
    ```

**If types are not recognized:**

1. **Check tsconfig.app.json:**

    ```json
    "types": ["vite-plugin-svgr/client"]
    ```

2. **Restart TypeScript server:**
    - VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

3. **Verify node_modules:**
    ```bash
    ls node_modules/vite-plugin-svgr/client.d.ts
    ```

### Testing Verification

**Commands to verify the fix:**

```bash
# Run all tests
npm test

# Run only integration tests
npm test -- integration

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TodoApp.test.tsx
```

**Expected Output:**

```
PASS  src/__tests__/unit/EmptyState.test.tsx
PASS  src/__tests__/unit/TodoItem.test.tsx
PASS  src/__tests__/unit/TodoList.test.tsx
PASS  src/__tests__/unit/TodoInput.test.tsx
PASS  src/__tests__/unit/useLocalStorage.test.ts
PASS  src/__tests__/unit/useTodos.test.ts
PASS  src/__tests__/integration/TodoApp.test.tsx
PASS  src/__tests__/integration/ErrorHandling.test.tsx

Test Suites: 8 passed, 8 total
Tests:       131 passed, 131 total
Snapshots:   0 total
Time:        ~3-5s
```

## Related Documentation

- [Jest Configuration - Handling Static Assets](https://jestjs.io/docs/webpack#handling-static-assets)
- [vite-plugin-svgr Documentation](https://github.com/pd4d10/vite-plugin-svgr)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [ts-jest Configuration](https://kulshekhar.github.io/ts-jest/docs/getting-started/options)

## References

- Custom SVG Icon Implementation: `docs/knowledge-transfer/development-process/custom-svg-icon-implementation.md`
- Jest Best Practices: `docs/knowledge-transfer/testing/`
- TypeScript Configuration: `tsconfig.app.json`, `tsconfig.json`

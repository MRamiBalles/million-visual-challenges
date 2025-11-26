# Testing Guide - Millennium Problems Platform

## Overview

Este proyecto usa **Vitest** como framework de testing, con React Testing Library para tests de componentes.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/
  components/
    problem/
      __tests__/
        ProblemHeader.test.tsx
        DifficultySelector.test.tsx
        ReferenceCard.test.tsx
        VisualizationContainer.test.tsx
  test/
    setup.ts
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useYourHook } from './useYourHook';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

it('fetches data correctly', async () => {
  const { result } = renderHook(() => useYourHook(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

## Current Test Coverage

### Component Library (4/4 components tested)
- ✅ ProblemHeader
- ✅ DifficultySelector  
- ✅ ReferenceCard + ReferenceList
- ✅ VisualizationContainer

### Pending Tests
- [ ] Custom hooks (useMillenniumProblem, useUserProgress)
- [ ] Navier-Stokes visualizations
- [ ] Page components (integration tests)

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test behavior, not implementation**: Focus on user interactions
3. **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
4. **Mock external dependencies**: Supabase, APIs, etc.
5. **Keep tests fast**: Unit tests should be < 100ms

## Mocking

### Supabase
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));
```

### React Router
```typescript
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <YourComponent />
  </BrowserRouter>
);
```

## CI/CD Integration

Tests run automatically on:
- Every push to main
- Every pull request
- Pre-commit hooks (optional)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

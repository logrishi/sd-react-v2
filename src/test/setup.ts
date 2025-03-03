import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock React Query
vi.mock('@tanstack/react-query', () => {
  const actual = vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    QueryClient: vi.fn().mockImplementation(() => ({
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    })),
    useQueryClient: vi.fn().mockReturnValue({
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    }),
  };
});

// Mock QuerySuspense
vi.mock('@/components/common', () => ({
  QuerySuspense: ({ children, fallback, errorFallback }: any) => (
    <div data-testid="query-suspense">
      <div data-testid="fallback">{fallback}</div>
      <div data-testid="error-fallback">{errorFallback}</div>
      {children}
    </div>
  ),
}));

beforeAll(() => {
  // Suppress React error logging
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Inside a test, React does not maintain state between renders')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

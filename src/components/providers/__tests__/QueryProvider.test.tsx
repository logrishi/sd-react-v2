import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryProvider } from '../QueryProvider';
import { QueryClient } from '@tanstack/react-query';

// Mock useEffect to prevent hydration
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual as any,
    useEffect: vi.fn((fn) => fn()),
  };
});

// Mock QueryClient
const queryClient = new QueryClient();
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => queryClient),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-provider">{children}</div>,
  hydrate: vi.fn(),
}));

describe('QueryProvider', () => {
  it('should render children with fallback components', () => {
    render(
      <QueryProvider>
        <div data-testid="child">Test Child</div>
      </QueryProvider>
    );

    const child = screen.getByTestId('child');
    const provider = screen.getByTestId('query-provider');
    const suspense = screen.getByTestId('query-suspense');

    expect(child).toHaveTextContent('Test Child');
    expect(provider).toContainElement(suspense);
    expect(suspense).toContainElement(child);
  });

  it('should hydrate state when provided', () => {
    const mockState = { queries: [] };
    render(
      <QueryProvider dehydratedState={mockState}>
        <div>Test</div>
      </QueryProvider>
    );

    const provider = screen.getByTestId('query-provider');
    expect(provider).toBeInTheDocument();
  });

  it('should render loading fallback when provided', () => {
    render(
      <QueryProvider loadingFallback={<div>Loading...</div>}>
        <div>Content</div>
      </QueryProvider>
    );

    const fallback = screen.getByTestId('fallback');
    expect(fallback).toHaveTextContent('Loading...');
  });

  it('should render error fallback when provided', () => {
    render(
      <QueryProvider errorFallback={<div>Error!</div>}>
        <div>Content</div>
      </QueryProvider>
    );

    const errorFallback = screen.getByTestId('error-fallback');
    expect(errorFallback).toHaveTextContent('Error!');
  });
});

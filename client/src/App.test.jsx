import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

describe('App', () => {
  it('renders app title', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('LearnQuest')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import RegisterPage from './RegisterPage';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('RegisterPage', () => {
  it('renders registration form', () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    expect(screen.getByText('LearnQuest')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入家庭名称')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入4位PIN码')).toBeInTheDocument();
    expect(screen.getByText('开始冒险')).toBeInTheDocument();
  });
});

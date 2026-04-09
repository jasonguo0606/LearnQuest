import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import RecordsPage from './RecordsPage';

vi.mock('../services/recordService', () => ({
  getCalendar: vi.fn().mockResolvedValue({
    '2026-04-01': { totalPoints: 40 },
    '2026-04-05': { totalPoints: 15 },
  }),
}));

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

test('renders records page with calendar heading', async () => {
  render(<RecordsPage />, { wrapper: createWrapper() });
  expect(await screen.findByText('学习记录')).toBeInTheDocument();
});

test('renders month navigation controls', async () => {
  render(<RecordsPage />, { wrapper: createWrapper() });
  expect(await screen.findByText('◀')).toBeInTheDocument();
  expect(await screen.findByText('▶')).toBeInTheDocument();
});

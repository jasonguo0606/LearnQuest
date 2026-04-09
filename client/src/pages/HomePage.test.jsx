import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import HomePage from './HomePage';

vi.mock('../services/petService', () => ({
  getPets: vi.fn().mockResolvedValue({
    owned: [
      { _id: 'pet1', type: 'cat', name: '咪咪', level: 3, mood: 'happy', exp: 20, isActive: true },
    ],
  }),
  feedPet: vi.fn(),
}));

vi.mock('../services/statsService', () => ({
  getBalance: vi.fn().mockResolvedValue(50),
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

test('renders home page with pet and feed button', async () => {
  render(<HomePage />, { wrapper: createWrapper() });
  const headings = await screen.findAllByText('首页');
  expect(headings.length).toBeGreaterThan(0);
  expect(await screen.findByText('喂食', { exact: false })).toBeInTheDocument();
});

test('shows pet name when pet is loaded', async () => {
  render(<HomePage />, { wrapper: createWrapper() });
  expect(await screen.findByText('咪咪')).toBeInTheDocument();
});

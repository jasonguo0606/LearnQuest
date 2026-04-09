import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ShopPage from './ShopPage';

vi.mock('../services/rewardService', () => ({
  getRewards: vi.fn().mockResolvedValue([
    { _id: 'r1', name: '看电影', icon: '🎬', cost: 30 },
    { _id: 'r2', name: '买玩具', icon: '🧸', cost: 50 },
  ]),
}));

vi.mock('../services/petService', () => ({
  getPets: vi.fn().mockResolvedValue({
    available: [
      { type: 'dragon', name: '小龙龙', description: '霸气的龙', unlockCost: 100, owned: false },
    ],
    owned: [],
  }),
}));

vi.mock('../services/statsService', () => ({
  getBalance: vi.fn().mockResolvedValue(20),
}));

vi.mock('../services/redemptionService', () => ({
  redeem: vi.fn(),
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

test('renders shop page with rewards tab', async () => {
  render(<ShopPage />, { wrapper: createWrapper() });
  const headings = await screen.findAllByText('商城');
  expect(headings.length).toBeGreaterThanOrEqual(1);
  expect(await screen.findByText('看电影')).toBeInTheDocument();
  expect(await screen.findByText('买玩具')).toBeInTheDocument();
});

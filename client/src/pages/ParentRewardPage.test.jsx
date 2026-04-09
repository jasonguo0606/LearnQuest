import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ParentRewardPage from './ParentRewardPage';

vi.mock('../services/rewardService', () => ({
  getRewards: vi.fn().mockResolvedValue([
    { _id: 'r1', name: '看电影', icon: '🎬', cost: 30 },
  ]),
  createReward: vi.fn().mockResolvedValue({ _id: 'r2', name: '买玩具', icon: '🧸', cost: 50 }),
  updateReward: vi.fn().mockResolvedValue({}),
  deleteReward: vi.fn().mockResolvedValue({}),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider>
  );
};

test('renders reward management with existing rewards', async () => {
  render(<ParentRewardPage onBack={() => {}} />, { wrapper: createWrapper() });
  expect(await screen.findByText('管理奖励')).toBeInTheDocument();
  expect(await screen.findByText('看电影')).toBeInTheDocument();
});

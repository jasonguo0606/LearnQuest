import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import AchievementsPage from './AchievementsPage';

vi.mock('../services/achievementService', () => ({
  getAchievements: vi.fn().mockResolvedValue([
    { _id: 'a1', title: '初次记录', description: '完成第一条学习记录', icon: '⭐', isUnlocked: true, progress: 1, target: 1 },
    { _id: 'a2', title: '学习达人', description: '学习10次', icon: '🏆', isUnlocked: false, progress: 3, target: 10 },
  ]),
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

test('renders achievements wall with badge count', async () => {
  render(<AchievementsPage />, { wrapper: createWrapper() });
  expect(await screen.findByText('成就墙')).toBeInTheDocument();
  expect(await screen.findByText('1/2 已达成')).toBeInTheDocument();
});

test('renders achievement badges', async () => {
  render(<AchievementsPage />, { wrapper: createWrapper() });
  expect(await screen.findByText('初次记录')).toBeInTheDocument();
  expect(await screen.findByText('未达成')).toBeInTheDocument();
});

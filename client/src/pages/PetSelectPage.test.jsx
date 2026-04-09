import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import PetSelectPage from './PetSelectPage';

vi.mock('../services/petService', () => ({
  getPets: vi.fn().mockResolvedValue({
    available: [
      { type: 'cat', name: '小猫咪', unlockCost: 0, description: '可爱的猫咪' },
      { type: 'dog', name: '小狗狗', unlockCost: 0, description: '忠实的狗狗' },
      { type: 'rabbit', name: '小兔子', unlockCost: 0, description: '活泼的兔子' },
    ],
  }),
  choosePet: vi.fn(),
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

test('renders pet selection with 3 initial pets', async () => {
  render(<PetSelectPage />, { wrapper: createWrapper() });
  expect(await screen.findByText('选择你的宠物')).toBeInTheDocument();
  expect(screen.getByText('小猫咪')).toBeInTheDocument();
  expect(screen.getByText('小狗狗')).toBeInTheDocument();
  expect(screen.getByText('小兔子')).toBeInTheDocument();
});

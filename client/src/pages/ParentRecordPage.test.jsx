import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ParentRecordPage from './ParentRecordPage';

vi.mock('../services/recordService', () => ({
  getSubjects: vi.fn().mockResolvedValue([
    {
      _id: 's1',
      name: '数学',
      icon: '📐',
      taskTemplates: [
        { name: '口算练习', points: 10 },
        { name: '应用题', points: 15 },
      ],
    },
  ]),
  createRecord: vi.fn().mockResolvedValue({ newAchievements: [] }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

test('renders record form with subject selector', async () => {
  render(<ParentRecordPage onBack={() => {}} />, { wrapper: createWrapper() });
  expect(await screen.findByText('记录成绩')).toBeInTheDocument();
  expect(screen.getByText('选择科目')).toBeInTheDocument();
});

test('shows task templates after selecting a subject', async () => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  render(<ParentRecordPage onBack={() => {}} />, { wrapper: createWrapper() });
  await screen.findByText(/数学/);
  const select = screen.getByDisplayValue('选择科目');
  await user.selectOptions(select, 's1');
  expect(await screen.findByText(/口算练习/)).toBeInTheDocument();
});

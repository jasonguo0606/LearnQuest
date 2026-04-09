import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomTabs from './BottomTabs';

test('renders all 4 tabs', () => {
  render(
    <MemoryRouter>
      <BottomTabs />
    </MemoryRouter>
  );
  expect(screen.getByText('首页')).toBeInTheDocument();
  expect(screen.getByText('成就')).toBeInTheDocument();
  expect(screen.getByText('商城')).toBeInTheDocument();
  expect(screen.getByText('记录')).toBeInTheDocument();
});

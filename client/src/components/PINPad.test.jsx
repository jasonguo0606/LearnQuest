import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PINPad from './PINPad';

test('renders PIN pad with title and digits', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<PINPad title="输入PIN" onSubmit={onSubmit} onClose={() => {}} />);

  expect(screen.getByText('输入PIN')).toBeInTheDocument();

  await user.click(screen.getByText('1'));
  await user.click(screen.getByText('2'));
  await user.click(screen.getByText('3'));
  await user.click(screen.getByText('4'));

  expect(onSubmit).toHaveBeenCalledWith('1234');
});

import { render, screen } from '@testing-library/react';
import PetDisplay from './PetDisplay';

test('renders cat with level badge and mood', () => {
  render(<PetDisplay type="cat" level={3} mood="happy" />);
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('adds hat at level 5+', () => {
  const { container } = render(<PetDisplay type="dog" level={5} mood="normal" />);
  expect(container.querySelector('span.text-2xl')).toBeInTheDocument();
});

test('adds wings at level 10+', () => {
  const { container } = render(<PetDisplay type="rabbit" level={10} mood="hungry" />);
  expect(container.querySelector('span.text-3xl')).toBeInTheDocument();
});

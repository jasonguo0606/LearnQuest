import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isParent">{String(auth.isParent)}</span>
      <span data-testid="familyName">{auth.family?.name ?? ''}</span>
      <button onClick={() => auth.login({ familyId: 'test', name: 'Guo Family', isParent: false })}>
        Login
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides auth context with login and logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');

    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('familyName')).toHaveTextContent('Guo Family');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });
});

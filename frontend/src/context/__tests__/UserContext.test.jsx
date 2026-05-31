import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import api from '../../services/api';
import {
  getStoredUser,
  setStoredUser,
  UserProvider,
  useUser,
} from '../UserContext';

/**
 * Use the manual mock at src/services/__mocks__/api.js
 */
vi.mock('../../services/api');

// ── TestConsumer ────────────────────────────────────────────────────────────────
// A small component that consumes the UserContext so we can inspect values
// from inside the provider during tests.
let contextValues;
function TestConsumer() {
  contextValues = useUser();
  return (
    <span data-testid="username">
      {contextValues.user?.username || 'none'}
    </span>
  );
}

// ── Helper to render UserProvider + TestConsumer ─────────────────────────────
function renderWithProvider() {
  return render(
    <UserProvider>
      <TestConsumer />
    </UserProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('UserContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    contextValues = undefined;
  });

  // ── getStoredUser ────────────────────────────────────────────────────────

  describe('getStoredUser', () => {
    it('returns parsed user from localStorage', () => {
      const mockUser = { id: '1', username: 'john' };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = getStoredUser();

      expect(result).toEqual(mockUser);
    });

    it('returns null when no user is stored', () => {
      const result = getStoredUser();

      expect(result).toBeNull();
    });

    it('returns null for corrupted JSON (covers catch branch)', () => {
      // Simulate corrupted JSON that will cause JSON.parse to throw
      localStorage.getItem.mockReturnValue('{broken');

      const result = getStoredUser();

      expect(result).toBeNull();
    });
  });

  // ── setStoredUser ────────────────────────────────────────────────────────

  describe('setStoredUser', () => {
    it('stores user in localStorage when user is provided', () => {
      const mockUser = { id: '1', username: 'john' };

      setStoredUser(mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('removes user from localStorage when called with null', () => {
      setStoredUser(null);

      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  // ── UserProvider ─────────────────────────────────────────────────────────

  describe('UserProvider', () => {
    it('fetches and sets user on mount (happy path)', async () => {
      const mockUser = { username: 'john' };
      api.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderWithProvider();

      // Wait for the refreshUser useEffect to resolve
      await waitFor(() => {
        expect(screen.getByTestId('username')).toHaveTextContent('john');
      });

      expect(api.get).toHaveBeenCalledWith('/users/me');
      expect(contextValues.user).toEqual(mockUser);
      expect(contextValues.isLoading).toBe(false);
    });

    it('handles refreshUser failure gracefully (covers catch branch)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.get.mockRejectedValueOnce(new Error('Network Error'));

      renderWithProvider();

      // Wait for the failed refreshUser to complete
      await waitFor(() => {
        expect(contextValues.isLoading).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch user profile:',
        expect.any(Error)
      );
      // User should remain whatever it was (null since nothing in localStorage)
      expect(screen.getByTestId('username')).toHaveTextContent('none');

      consoleSpy.mockRestore();
    });

    it('updateUser calls API and updates user state', async () => {
      // Mock the initial mount refreshUser call
      api.get.mockResolvedValueOnce({
        data: { user: { username: 'john' } },
      });

      renderWithProvider();

      // Wait for mount to finish
      await waitFor(() => {
        expect(screen.getByTestId('username')).toHaveTextContent('john');
      });

      // Now mock the updateUser PUT call
      api.put.mockResolvedValueOnce({
        data: { user: { username: 'updated_john' } },
      });

      await act(async () => {
        const result = await contextValues.updateUser({
          username: 'updated_john',
        });
        expect(result).toEqual({ username: 'updated_john' });
      });

      expect(api.put).toHaveBeenCalledWith('/users/profile', {
        username: 'updated_john',
      });
      expect(screen.getByTestId('username')).toHaveTextContent('updated_john');
    });

    it('clearUser clears user state and localStorage', async () => {
      // Mock the initial mount refreshUser call
      api.get.mockResolvedValueOnce({
        data: { user: { username: 'john' } },
      });

      renderWithProvider();

      // Wait for mount to finish
      await waitFor(() => {
        expect(screen.getByTestId('username')).toHaveTextContent('john');
      });

      await act(async () => {
        contextValues.clearUser();
      });

      expect(contextValues.user).toBeNull();
      expect(screen.getByTestId('username')).toHaveTextContent('none');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  // ── useUser outside provider ─────────────────────────────────────────────

  describe('useUser', () => {
    it('throws error when used outside UserProvider', () => {
      // Suppress React error boundary / console.error noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      function BadConsumer() {
        useUser();
        return null;
      }

      expect(() => render(<BadConsumer />)).toThrow(
        'useUser must be used within UserProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});

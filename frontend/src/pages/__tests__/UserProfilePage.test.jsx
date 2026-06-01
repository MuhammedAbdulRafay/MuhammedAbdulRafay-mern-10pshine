import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserProfilePage from '../UserProfilePage';
import api from '../../services/api';
import { ThemeProvider } from '../../context/ThemeContext';
import { UserProvider } from '../../context/UserContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/api');

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <div {...domProps}>{children}</div>;
      },
      button: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <button {...domProps}>{children}</button>;
      },
      aside: ({ children, ...props }) => {
        const { initial, animate, exit, transition, layout, whileHover, whileTap, ...domProps } = props;
        return <aside {...domProps}>{children}</aside>;
      },
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify({ username: 'john', name: 'John', email: 'john@test.com', _id: '123' });
      if (key === 'token') return 'fake-token';
      if (key === 'notes-theme') return 'light';
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/users/me') {
        return Promise.resolve({
          data: { user: { username: 'john', name: 'John', email: 'john@test.com', _id: '123' } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    api.put.mockResolvedValue({
      data: { user: { username: 'john', name: 'John', email: 'john@test.com', _id: '123' } },
    });
  });

  const renderProfile = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <UserProvider>
            <UserProfilePage />
          </UserProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  /**
   * Helper: wait for profile page to fully load (sidebar + profile content)
   */
  const waitForProfileLoad = async () => {
    await waitFor(() => {
      // The profile page shows "Save Changes" button when user is loaded
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  };

  /**
   * TEST 1: Renders user profile data
   */
  it('should render user profile with user data', async () => {
    renderProfile();
    await waitForProfileLoad();

    // Component uses form.username (which is 'john' lowercase)
    expect(screen.getAllByText('john').length).toBeGreaterThan(0);
  });

  /**
   * TEST 2: Shows loading state
   */
  it('should show loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'notes-theme') return 'light';
      return null;
    });

    renderProfile();

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  /**
   * TEST 3: Logout clears token and navigates
   */
  it('should logout and navigate to login', async () => {
    const user = userEvent.setup();
    renderProfile();
    await waitForProfileLoad();

    // There are multiple Logout buttons (sidebar + profile footer)
    const logoutButtons = screen.getAllByText('Logout');
    await user.click(logoutButtons[logoutButtons.length - 1]);

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  /**
   * TEST 4: Toggle password section
   */
  it('should toggle password change section', async () => {
    const user = userEvent.setup();
    renderProfile();
    await waitForProfileLoad();

    const changePasswordBtn = screen.getByText('Change password');
    await user.click(changePasswordBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });
  });

  /**
   * TEST 5: Save changes calls API
   */
  it('should call save on Save Changes click', async () => {
    const user = userEvent.setup();
    renderProfile();
    await waitForProfileLoad();

    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
    });
  });

  /**
   * TEST 6: Close button navigates to dashboard
   */
  it('should navigate to dashboard when close button is clicked', async () => {
    const user = userEvent.setup();
    renderProfile();
    await waitForProfileLoad();

    const closeButton = screen.getByLabelText('Close profile');
    await user.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

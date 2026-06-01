import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import api from '../../../services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../services/api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'test-reset-token' }),
  };
});

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
  };

  /**
   * TEST 1: Renders form correctly
   */
  it('should render the reset password form', () => {
    renderComponent();

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  /**
   * TEST 2: Shows error when fields are empty
   */
  it('should show error when fields are empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill all fields')).toBeInTheDocument();
    });
  });

  /**
   * TEST 3: Shows error when passwords don't match
   */
  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByPlaceholderText('Enter new password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'different456');

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  /**
   * TEST 4: Shows error when password too short
   */
  it('should show error when password is too short', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByPlaceholderText('Enter new password'), 'abc');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'abc');

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  /**
   * TEST 5: Calls API and shows success on valid submit
   */
  it('should call API and show success on valid submit', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValueOnce({ data: { message: 'Password reset' } });

    renderComponent();

    await user.type(screen.getByPlaceholderText('Enter new password'), 'newpass123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'newpass123');

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        resetToken: 'test-reset-token',
        newPassword: 'newpass123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument();
    });
  });
});

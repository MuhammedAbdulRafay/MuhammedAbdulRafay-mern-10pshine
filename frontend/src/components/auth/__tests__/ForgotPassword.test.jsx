import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
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
  };
});

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
  };

  /**
   * TEST 1: Renders form correctly
   */
  it('should render the forgot password form', () => {
    renderComponent();

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  /**
   * TEST 2: Shows error on empty email
   */
  it('should show error when submitting empty email', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByText('Send Reset Link');
    await user.click(submitButton);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  /**
   * TEST 3: Calls API and shows success on valid submit
   */
  it('should call API and show success view on valid submit', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValueOnce({ data: { message: 'Email sent' } });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByText('Send Reset Link');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
    });

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
  });

  /**
   * TEST 4: Shows error on API failure
   */
  it('should show error on API failure', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'User not found' } },
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'bad@example.com');

    const submitButton = screen.getByText('Send Reset Link');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  /**
   * TEST 5: Has login link
   */
  it('should have a link to login page', () => {
    renderComponent();

    expect(screen.getByText('Login here')).toBeInTheDocument();
  });
});

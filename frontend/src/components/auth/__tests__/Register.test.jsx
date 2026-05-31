import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from "../../../pages/SignupPage";
import axios from 'axios';
import { vi } from "vitest";

/**
 * Mock axios so tests don't call real backend
 */
vi.mock('axios');

/**
 * Mock framer-motion so it renders instantly without animations
 */
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  const componentCache = {};
  const motionProxy = new Proxy({}, {
    get: (_, tag) => {
      if (!componentCache[tag]) {
        const MotionComponent = ({ children, initial, animate, exit, transition, layout, whileHover, whileTap, whileInView, ...props }) => {
          const Tag = tag;
          return <Tag {...props}>{children}</Tag>;
        };
        MotionComponent.displayName = `motion.${tag}`;
        componentCache[tag] = MotionComponent;
      }
      return componentCache[tag];
    },
  });
  return {
    ...actual,
    motion: motionProxy,
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

/**
 * Mock React Router so navigation works in tests
 */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Test Suite for Register Component
 */
describe('Register Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  };

  /**
   * TEST 1: Component renders correctly
   */
  it('should render register form correctly', () => {
    renderRegister();

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  /**
   * TEST 2: Shows validation - doesn't submit when fields are empty
   * The form uses HTML5 required attributes, so empty submit won't trigger API
   */
  it('should not call API when fields are empty', async () => {
    renderRegister();

    const registerButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerButton);

    // API should NOT be called because HTML required validation prevents submit
    expect(axios.post).not.toHaveBeenCalled();
  });

  /**
   * TEST 3: Shows password minimum length hint
   */
  it('should display password requirement hint', () => {
    renderRegister();

    expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
  });

  /**
   * TEST 4: Calls API on valid submit
   */
  it('should call register API with correct data on valid submit', async () => {
    const user = userEvent.setup();
    renderRegister();

    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { message: 'User created' }
    });

    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);

    await user.type(nameInput, 'john');
    await user.type(emailInput, 'john@gmail.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/register',
        {
          username: 'john',
          email: 'john@gmail.com',
          password: 'password123'
        }
      );
    });
  });

  /**
   * TEST 5: Navigates to login page on successful registration
   */
  it('should navigate to login on successful registration', async () => {
    const user = userEvent.setup();
    renderRegister();

    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { message: 'User created' }
    });

    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);

    await user.type(nameInput, 'john');
    await user.type(emailInput, 'john@gmail.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  /**
   * TEST 6: Shows alert on signup failure
   */
  it('should show alert on signup failure', async () => {
    const user = userEvent.setup();
    renderRegister();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } }
    });

    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);

    await user.type(nameInput, 'john');
    await user.type(emailInput, 'john@gmail.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Email already exists');
    });

    alertSpy.mockRestore();
  });

  /**
   * TEST 7: Toggles password visibility
   */
  it('should toggle password visibility when clicking the toggle button', () => {
    renderRegister();

    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    expect(passwordInput.type).toBe('password');

    const toggleButton = passwordInput.closest('.relative').querySelector('button[type="button"]');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});
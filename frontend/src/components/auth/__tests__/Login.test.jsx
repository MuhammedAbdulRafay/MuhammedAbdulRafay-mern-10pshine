import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from "../../../pages/LoginPage";
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
 * Test Suite for Login Component
 * Groups all login tests together
 */
describe('Login Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper function to render Login inside Router
   * (Router is needed for navigation to work)
   */
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  /**
   * TEST 1: Component renders correctly
   * What we're testing: Does the login form appear?
   * Why: Make sure all fields are present
   */
  it('should render login form correctly', () => {
    renderLogin();

    // Check if "Welcome back" heading exists
    expect(screen.getByText('Welcome back')).toBeInTheDocument();

    // Check if email input exists
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();

    // Check if password input exists
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

    // Check if login button exists
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  /**
   * TEST 2: Shows error on empty submit (HTML5 required validation)
   * What we're testing: If user clicks login without entering anything, form won't submit
   * Why: The inputs have HTML required attribute so the form uses native validation
   */
  it('should not call API when submitting empty form', async () => {
    renderLogin();

    // Get the login button
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    // Click it without filling form
    fireEvent.click(loginButton);

    // API should NOT be called because HTML required validation prevents submit
    expect(axios.post).not.toHaveBeenCalled();
  });

  /**
   * TEST 3: Calls API on valid submit
   * What we're testing: When user enters email and password and clicks login, API is called
   * Why: Make sure login actually tries to authenticate
   */
  it('should call login API with correct data on valid submit', async () => {
    const user = userEvent.setup();
    renderLogin();

    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user: { id: '123', email: 'test@gmail.com', username: 'john' }
      }
    });

    // Get input fields
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    // Simulate user typing email and password
    await user.type(emailInput, 'test@gmail.com');
    await user.type(passwordInput, 'password123');

    // Submit the form by clicking the submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for API call to happen
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        {
          email: 'test@gmail.com',
          password: 'password123'
        }
      );
    });
  });

  /**
   * TEST 4: Navigates to dashboard on successful login
   * What we're testing: After successful login, user is redirected
   * Why: UX — user should land on dashboard after login
   */
  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup();
    renderLogin();

    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user: { id: '123', email: 'test@gmail.com', username: 'john' }
      }
    });

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'test@gmail.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  /**
   * TEST 5: Shows error on API failure
   * What we're testing: If API returns error, error message displays via alert
   * Why: Handle login failures gracefully
   */
  it('should show alert on login failure', async () => {
    const user = userEvent.setup();
    renderLogin();

    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock API error response
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } }
    });

    // Get inputs
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    // Fill form with wrong credentials
    await user.type(emailInput, 'test@gmail.com');
    await user.type(passwordInput, 'wrongpassword');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for alert to be called
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Invalid email or password');
    });

    alertSpy.mockRestore();
  });

  /**
   * TEST 6: Toggles password visibility
   * What we're testing: Clicking the eye icon toggles password field between hidden and visible
   * Why: Covers the setShowPassword(!showPassword) handler in LoginForm
   */
  it('should toggle password visibility when toggle button is clicked', () => {
    renderLogin();

    // Get the password input
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    // Initially the input type should be 'password' (hidden)
    expect(passwordInput.type).toBe('password');

    // Find the toggle button inside the same .relative container
    const toggleButton = passwordInput.closest('.relative').querySelector('button[type="button"]');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});
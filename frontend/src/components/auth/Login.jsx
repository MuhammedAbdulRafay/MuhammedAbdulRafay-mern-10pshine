import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

/**
 * Login Component
 * Form for authenticating users
 */
const Login = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State for error messages
  const [error, setError] = useState('');

  // State for success message (from registration redirect)
  const [successMessage, setSuccessMessage] = useState('');

  // State for loading
  const [loading, setLoading] = useState(false);

  // Hook to navigate to other pages
  const navigate = useNavigate();

  // Hook to get location (for messages from other pages)
  const location = useLocation();

  /**
   * useEffect - runs when component mounts
   * Check if there's a success message from registration
   */
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Validate inputs
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);

      // Call login API
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Extract token and user info from response
      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Save user info to localStorage (optional, for later use)
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Handle login errors
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>

        {/* Success message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Link to register */}
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
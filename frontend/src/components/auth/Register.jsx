import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

/**
 * Register Component
 * Form for creating a new user account
 */
const Register = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // State for error messages
  const [error, setError] = useState('');

  // State for loading (show spinner while submitting)
  const [loading, setLoading] = useState(false);

  // Hook to navigate to other pages
  const navigate = useNavigate();

  /**
   * Handle input change
   * Updates state when user types in form fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setError('');
  };

  /**
   * Handle form submission
   * Called when user clicks "Register" button
   */
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault();

    // Clear previous error
    setError('');

    // Validate inputs
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Show loading spinner
      setLoading(true);

      // Call register API
      const response = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // If registration successful, show success message
      if (response.status === 201) {
        // Navigate to login page
        navigate('/login', {
          state: { message: 'Registration successful! Please login.' }
        });
      }
    } catch (err) {
      // Handle errors from backend
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Create Account</h1>

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

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
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Link to login */}
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * If user is not logged in, redirects to /login
 */
const ProtectedRoute = ({ children }) => {
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');

  // If no token, user is not logged in
  if (!token) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the component
  return children;
};

export default ProtectedRoute;
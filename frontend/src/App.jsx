import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

/**
 * Main App Component
 * Sets up all routes for the application
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        
        {/* Register Route */}
        <Route path="/register" element={<Register />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (require authentication) */}
        
        {/* Dashboard Route - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="dashboard-placeholder">
                <h1>Dashboard</h1>
                <p>Dashboard content coming in Phase 9...</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Root Route - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all - Any undefined route goes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
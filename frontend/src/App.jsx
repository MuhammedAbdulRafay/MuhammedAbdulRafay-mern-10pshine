import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

import "./App.css";

const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

function ProtectedApp({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <ProtectedRoute>{children}</ProtectedRoute>
      </UserProvider>
    </ThemeProvider>
  );
}

/**
 * Main App Component
 */
function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedApp>
                <Dashboard />
              </ProtectedApp>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedApp>
                <UserProfilePage />
              </ProtectedApp>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

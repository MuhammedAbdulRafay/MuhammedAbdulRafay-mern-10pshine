import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";

import "./App.css";

const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function DashboardRoute() {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <Dashboard user={getStoredUser()} />
      </ProtectedRoute>
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
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
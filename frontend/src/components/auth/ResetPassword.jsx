import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

/**
 * Reset Password Component
 * User sets new password with token from email
 */
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call backend API
      await api.post('/auth/reset-password', {
        resetToken: token,
        newPassword: password
      });

      setSuccess(true);
      toast.success('Password reset successful!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-12 flex flex-col gap-8 text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              ✅ Success!
            </h2>
            
            <div className="flex flex-col gap-6">
              <p className="text-slate-600 dark:text-slate-400 text-base leading-loose">
                Your password has been reset successfully.
              </p>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-loose">
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        
        <div className="p-12 flex flex-col gap-12">
          
          {/* Header */}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Set New Password
          </h1>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm leading-loose">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Password Field */}
            <div className="flex flex-col gap-3">
              <label className="text-base font-semibold text-slate-800 dark:text-slate-200">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={loading}
                className="input-field w-full px-4 py-3 text-base"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-3">
              <label className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={loading}
                className="input-field w-full px-4 py-3 text-base"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors text-base"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
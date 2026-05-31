import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/auth/forgot-password', { email });

      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-12 flex flex-col gap-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Check Your Email
            </h2>
            
            <div className="flex flex-col gap-6">
              <p className="text-slate-600 dark:text-slate-400 text-base leading-loose">
                We've sent a password reset link to <strong className="text-slate-900 dark:text-white">{email}</strong>
              </p>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-loose">
                The link expires in 1 hour. If you don't see it, check your spam folder.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-black dark:bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors text-base"
            >
              Back to Login
            </button>
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Reset Password
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm leading-loose">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Email Field */}
            <div className="flex flex-col gap-3">
              <label className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Email Address
              </label>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="input-field w-full px-4 py-3 text-base"
              />
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-loose">
                We'll send you a link to reset your password
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors text-base"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-base text-slate-600 dark:text-slate-400 leading-loose">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Lock, ArrowRight, RefreshCw, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
        token,
        password
      });
      setMessage(response.data.message || 'Password reset successful! You can now sign in.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#050811] p-4 select-none">
        <GlassCard className="w-full max-w-md p-8 border border-red-500/20 text-center relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center font-black mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase">Invalid or Expired Link</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The password reset link is missing. Please request a new link from the forgot password page.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/forgot-password"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-tr from-neonPurple to-cyberBlue text-white hover:opacity-90 transition text-center"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition mt-3"
            >
              Back to Login
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#050811] p-4 select-none">
      <GlassCard className="w-full max-w-md p-8 border border-slate-200 dark:border-slate-800/40 relative z-10">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-neonPurple to-cyberBlue flex items-center justify-center text-white font-black shadow-lg mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-2">
            Enter and confirm your new secure account password below.
          </p>
        </div>

        {message ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-450 text-xs font-semibold leading-relaxed text-center">
              {message}
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-250 dark:hover:bg-slate-850 transition-all text-center block"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-900 text-xs text-slate-800 dark:text-white pl-10 pr-10 py-3 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-650" size={14} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-900 text-xs text-slate-800 dark:text-white pl-10 pr-10 py-3 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-650" size={14} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-4 rounded-xl text-xs font-bold bg-gradient-to-tr from-neonPurple to-cyberBlue text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  Update Password <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
};

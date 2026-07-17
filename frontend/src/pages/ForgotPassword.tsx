import React, { useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Mail, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Direct post request to forgot-password auth endpoint
      const response = await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setMessage(response.data.message || 'If an account exists for this email, password reset instructions have been sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#050811] p-4 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-neonPurple/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <GlassCard className="w-full max-w-md p-8 border border-slate-200 dark:border-slate-800/40 relative z-10">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-neonPurple to-cyberBlue flex items-center justify-center text-white font-black shadow-lg mx-auto mb-4">
            <KeyRound size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase">Forgot Password</h2>
          <p className="text-xs text-slate-500 mt-2">
            Enter your registered email below, and we will send you password reset instructions.
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
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-900 text-xs text-slate-800 dark:text-white pl-10 pr-4 py-3 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-650" size={14} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 rounded-xl text-xs font-bold bg-gradient-to-tr from-neonPurple to-cyberBlue text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Sending link...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-xs text-slate-500 hover:text-cyberBlue transition">
                Remember your password? Login
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
};

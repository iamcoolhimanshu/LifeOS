import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, BrainCircuit } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    const success = await register({ username, email, password });
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-transparent relative overflow-hidden px-4">
      {/* Background Neon Orbs */}
      <div className="absolute top-[20%] left-[30%] w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-[20%] right-[30%] w-96 h-96 bg-cyberBlue/10 rounded-full blur-[120px] animate-pulse-glow"></div>

      <div className="w-full max-w-md glass-card p-8 border border-slate-200 dark:border-darkBorder relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-neonPurple to-cyberBlue shadow-[0_0_20px_rgba(0,229,255,0.4)] mb-4 animate-float">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-slate-800 dark:text-white bg-gradient-to-r from-slate-800 to-cyberBlue dark:from-white dark:to-cyberBlue bg-clip-text text-transparent">LifeOS</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">Register Your Second Brain</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || validationError) && (
            <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium text-center">
              {error || validationError}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                required
                className="input-cyber py-2.5 pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-slate-500" size={15} />
              <input
                type="email"
                placeholder="Choose email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                required
                className="input-cyber py-2.5 pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-500" size={15} />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                required
                className="input-cyber py-2.5 pl-10"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-500" size={15} />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); }}
                required
                className="input-cyber py-2.5 pl-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-cyber py-3 mt-4 flex items-center justify-center font-bold text-white text-sm"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="flex items-center gap-2">
                Register Brain <Sparkles size={14} />
              </span>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 font-semibold">
            Already registered?{' '}
            <Link to="/login" className="text-cyberBlue hover:underline transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

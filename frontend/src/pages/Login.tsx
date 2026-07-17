import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Sparkles, BrainCircuit, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const success = await login({ username, password });
    if (success) {
      useThemeStore.getState().setTheme('dark');
      navigate('/');
    }
  };

  // Husky pupil movement offsets
  const pupilX = Math.min(5, Math.max(-5, (username.length - 8) * 0.4));
  const pupilY = isPasswordFocused ? -1.5 : 1;

  // Peek-a-boo paw variables
  const isLeftPawCovering = isPasswordFocused && !showPassword;
  const isRightPawCovering = isPasswordFocused;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Background Neural Digital Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Animated Digital Mesh Nodes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-cyberBlue rounded-full blur-[2px] animate-float opacity-40" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-[40%] left-[80%] w-4 h-4 bg-neonPurple rounded-full blur-[3px] animate-float opacity-50" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-[15%] left-[25%] w-2 h-2 bg-cyberBlue rounded-full blur-[1px] animate-float opacity-60" style={{ animationDelay: '3s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-[30%] right-[10%] w-3.5 h-3.5 bg-neonPurple/60 rounded-full blur-[2px] animate-float opacity-40" style={{ animationDelay: '0.8s', animationDuration: '7s' }}></div>
      </div>

      {/* Style injection for animations & neon keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes borderFlow {
          0% { border-color: rgba(168, 85, 247, 0.4); }
          50% { border-color: rgba(6, 182, 212, 0.6); }
          100% { border-color: rgba(168, 85, 247, 0.4); }
        }
        .animate-border-flow {
          animation: borderFlow 6s infinite ease-in-out;
        }
        @keyframes noseSniff {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(0.5px) scale(1.05); }
        }
        .animate-sniff {
          animation: noseSniff 1.2s infinite ease-in-out;
        }
      `}} />

      {/* Background Neon Orbs */}
      <div className="absolute top-[15%] left-[25%] w-[450px] h-[450px] bg-neonPurple/10 rounded-full blur-[130px] animate-pulse-glow"></div>
      <div className="absolute bottom-[15%] right-[25%] w-[450px] h-[450px] bg-cyberBlue/10 rounded-full blur-[130px] animate-pulse-glow"></div>

      {/* Outermost Glowing CyberBorder Wrapper */}
      <div className="w-full max-w-[460px] p-[1px] bg-gradient-to-tr from-neonPurple/20 via-cyberBlue/30 to-neonPurple/20 rounded-[28px] relative z-10 shadow-[0_0_60px_rgba(0,229,255,0.1)] dark:shadow-[0_0_60px_rgba(0,0,0,0.6)]">
        
        <div className="w-full bg-slate-950/90 backdrop-blur-2xl p-10 rounded-[27px] border border-slate-900/60 animate-fadeIn">
          
          {/* Header Logo */}
          <div className="flex flex-col items-center mb-2 select-none">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-neonPurple to-cyberBlue shadow-[0_0_25px_rgba(0,229,255,0.35)] mb-3 animate-float">
              <BrainCircuit size={26} className="text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-wide text-white bg-gradient-to-r from-white to-cyberBlue bg-clip-text text-transparent">LifeOS</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">Your AI Personal Digital Brain</p>
          </div>

          {/* Watch Husky Eyes Interactive Animation */}
          <div className="flex justify-center mb-5">
            <svg viewBox="0 0 200 160" className="w-40 h-32 overflow-visible select-none">
              {/* Ears */}
              <polygon points="40,60 20,20 60,35" fill="#334155" />
              <polygon points="48,53 32,28 60,38" fill="#cbd5e1" />
              <polygon points="160,60 180,20 140,35" fill="#334155" />
              <polygon points="152,53 168,28 140,38" fill="#cbd5e1" />
              
              {/* Face/Head Outer Coat */}
              <path d="M30,80 C30,35 170,35 170,80 C170,115 130,135 100,135 C70,135 30,115 30,80 Z" fill="#475569" />
              
              {/* Face Inner White Mask */}
              <path d="M50,80 C50,50 150,50 150,80 C150,110 125,130 100,130 C75,130 50,110 50,80 Z" fill="#f8fafc" />
              <path d="M100,75 C90,55 55,65 55,85 C55,100 80,115 100,115 C120,115 145,100 145,85 C145,65 110,75 100,75 Z" fill="#e2e8f0" />
              
              {/* Eyes */}
              <g>
                {/* Left Eye white */}
                <ellipse cx="73" cy="72" rx="14" ry="10" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
                {/* Left Pupil (Visible when not covered, or when peeking with showPassword) */}
                {!isLeftPawCovering && (
                  <>
                    <circle cx={73 + pupilX} cy={72 + pupilY} r="5" fill="#0f172a" />
                    <circle cx={75 + pupilX} cy={70 + pupilY} r="1.5" fill="#ffffff" />
                  </>
                )}
              </g>
              <g>
                {/* Right Eye white */}
                <ellipse cx="127" cy="72" rx="14" ry="10" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
                {/* Right Pupil (Always hidden when password field is focused) */}
                {!isRightPawCovering && (
                  <>
                    <circle cx={127 + pupilX} cy={72 + pupilY} r="5" fill="#0f172a" />
                    <circle cx={129 + pupilX} cy={70 + pupilY} r="1.5" fill="#ffffff" />
                  </>
                )}
              </g>
              
              {/* Nose/Muzzle */}
              <g className="animate-sniff">
                <polygon points="92,92 108,92 100,100" fill="#0f172a" />
                <path d="M96,104 Q100,108 104,104" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Cute little tongue sticking out when username has input */}
              {username.length > 0 && !isPasswordFocused && (
                <path d="M96,105 C96,113 104,113 104,105 Z" fill="#f43f5e" />
              )}

              {/* Paws (Hands covering eyes during password input) */}
              {/* Left paw (covers eye if password focused and showPassword is false) */}
              <g className="transition-all duration-350 ease-out" style={{ transform: isLeftPawCovering ? 'translate(23px, -66px)' : 'translate(0px, 0px)' }}>
                <circle cx="45" cy="142" r="15" fill="#475569" stroke="#334155" strokeWidth="1.5" />
                <circle cx="36" cy="130" r="4" fill="#cbd5e1" />
                <circle cx="45" cy="124" r="4" fill="#cbd5e1" />
                <circle cx="54" cy="130" r="4" fill="#cbd5e1" />
              </g>
              {/* Right paw (always covers eye when password is focused) */}
              <g className="transition-all duration-350 ease-out" style={{ transform: isRightPawCovering ? 'translate(-23px, -66px)' : 'translate(0px, 0px)' }}>
                <circle cx="155" cy="142" r="15" fill="#475569" stroke="#334155" strokeWidth="1.5" />
                <circle cx="146" cy="130" r="4" fill="#cbd5e1" />
                <circle cx="155" cy="124" r="4" fill="#cbd5e1" />
                <circle cx="164" cy="130" r="4" fill="#cbd5e1" />
              </g>
            </svg>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-shake">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearError(); }}
                  required
                  className="input-cyber pl-11 focus:ring-1 focus:ring-cyberBlue/35"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[10px] text-cyberBlue hover:underline font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  className="input-cyber pl-11 pr-11 focus:ring-1 focus:ring-cyberBlue/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyberBlue transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-cyber py-3.5 mt-2 flex items-center justify-center font-bold text-white text-sm active:scale-[0.98] transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <Sparkles size={14} />
                </span>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyberBlue hover:underline transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

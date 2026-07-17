import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { CheckCircle2, XCircle, RefreshCw, Mail, AlertTriangle } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('failed');
        setErrorMessage('Verification token is missing.');
        return;
      }

      try {
        await axios.get(`http://localhost:8080/api/auth/verify?token=${encodeURIComponent(token)}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('failed');
        setErrorMessage(err.response?.data?.message || 'Token is invalid or has expired.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#050811] p-4 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-neonPurple/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <GlassCard className="w-full max-w-md p-8 border border-slate-200 dark:border-slate-800/40 relative z-10 text-center">
        {status === 'verifying' && (
          <div className="space-y-4 py-8">
            <RefreshCw className="animate-spin text-cyberBlue mx-auto" size={40} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Verifying Email Address</h2>
            <p className="text-xs text-slate-500">
              Please wait while we validate your activation token on our security servers...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="h-16 w-16 bg-green-500/10 text-green-455 dark:text-green-450 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase">Verification Success</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Thank you! Your email address has been successfully verified. You can now access your LifeOS dashboard.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-tr from-neonPurple to-cyberBlue text-white hover:opacity-95 transition-all text-center block"
            >
              Sign In to LifeOS
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6 py-4">
            <div className="h-16 w-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <XCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase">Verification Failed</h2>
              <p className="text-xs text-red-400 font-semibold mt-2">
                {errorMessage || 'Verification link has expired or is invalid.'}
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Tokens expire after 24 hours. If your link has expired, request a new verification email.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/resend-verification"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-850 transition-all text-center block"
              >
                Resend Verification Email
              </Link>
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition mt-3"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

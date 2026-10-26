import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { SentinelLogo } from '../components/ui/SentinelLogo';
import { loginApi, forgotPasswordApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('admin@sentinel.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Global submission state
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal for Forgot Password
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed) &&
      !emailTrimmed.startsWith('admin')
    ) {
      setEmailError('Please enter a valid email address (e.g. name@company.com)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      // Map email or username to the login API
      const usernameInput = email.includes('@') ? email.split('@')[0] : email;
      const data = await loginApi({
        username: usernameInput,
        password,
        rememberMe,
      });

      login(data.token, { username: data.username, role: data.role });
      navigate('/dashboard');
    } catch (err: any) {
      // Generic unified error message prevents user enumeration attacks
      const msg = err?.message || '';
      if (msg.includes('locked') || msg.includes('Too many')) {
        setGeneralError(msg);
      } else {
        setGeneralError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotSubmitting(true);
    try {
      const res = await forgotPasswordApi(forgotEmail.trim());
      setForgotSuccess(res.message);
    } catch {
      setForgotSuccess(
        'If an account matches that email address, a password reset link has been dispatched.',
      );
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 bg-grid relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass rounded-3xl border border-blue-500/15 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <SentinelLogo size={48} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white mb-1">Sentinel</h1>
            <p className="text-slate-400 text-sm">Sign in to your fraud operations console</p>
          </div>

          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl p-3 mb-4 flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{generalError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    emailError ? 'text-rose-400' : 'text-slate-500'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`w-full bg-slate-900/60 border rounded-xl px-3.5 pl-10 py-2.5 text-white text-sm outline-none transition-all ${
                    emailError
                      ? 'border-rose-500/80 focus:border-rose-400 ring-1 ring-rose-500/30'
                      : 'border-slate-700/60 focus:border-blue-500'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-rose-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                  <span>•</span> {emailError}
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSuccess(null);
                    setForgotModalOpen(true);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors focus-ring rounded"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordError ? 'text-rose-400' : 'text-slate-500'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full bg-slate-900/60 border rounded-xl px-3.5 pl-10 pr-10 py-2.5 text-white text-sm outline-none transition-all ${
                    passwordError
                      ? 'border-rose-500/80 focus:border-rose-400 ring-1 ring-rose-500/30'
                      : 'border-slate-700/60 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-rose-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                  <span>•</span> {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me Persistent Session Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900/60 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span className="text-xs text-slate-300">Remember me</span>
              </label>

              <span className="text-[11px] text-slate-500">30-day session</span>
            </div>

            {/* Demo Hint */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-[11px] text-slate-400">
              <span className="text-blue-300 font-semibold">Demo credentials:</span>{' '}
              admin@sentinel.local / admin123
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition-all glow-blue focus-ring text-sm mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <Link
            to="/"
            className="block text-center text-slate-500 hover:text-slate-300 text-xs mt-5 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setForgotModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-3xl border border-blue-500/20 p-6 max-w-sm w-full relative z-10 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Enter your registered email address below. We will send you a secure, time-limited
                password reset link.
              </p>

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400 mt-0.5" />
                    <span>{forgotSuccess}</span>
                  </div>
                  <button
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900/60 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {forgotSubmitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

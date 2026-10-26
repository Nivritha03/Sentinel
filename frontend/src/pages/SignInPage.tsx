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
  UserPlus,
  LogIn,
} from 'lucide-react';
import { SentinelLogo } from '../components/ui/SentinelLogo';
import { loginApi, registerApi, forgotPasswordApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Global submission state
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal for Forgot Password
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setGeneralError(null);
    setGeneralSuccess(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
  };

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password');
        isValid = false;
      } else if (confirmPassword !== password) {
        setConfirmPasswordError('Passwords do not match');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setGeneralSuccess(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const usernameInput = email.includes('@') ? email.split('@')[0] : email;

      if (mode === 'signin') {
        const data = await loginApi({
          username: usernameInput,
          password,
          rememberMe,
        });

        login(data.token, { username: data.username, role: data.role });
        navigate('/dashboard');
      } else {
        // Sign up / Create account
        const data = await registerApi({
          username: usernameInput,
          password,
          role: 'ANALYST',
        });

        login(data.token, { username: data.username, role: data.role });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (mode === 'signin') {
        if (msg.includes('locked') || msg.includes('Too many')) {
          setGeneralError(msg);
        } else {
          setGeneralError('Invalid email or password. Please try again.');
        }
      } else {
        if (msg.includes('already exists') || msg.includes('Conflict')) {
          setGeneralError('An account with that email or username already exists. Please sign in instead.');
        } else {
          setGeneralError(msg || 'Failed to create account. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim();
    if (!targetEmail) return;

    setForgotSubmitting(true);
    setForgotSuccess(null);

    try {
      const res = await forgotPasswordApi(targetEmail);
      setForgotSuccess(res.message);
    } catch {
      // Show uniform positive hint to prevent enumeration
      setForgotSuccess(
        'If an account matches that email address, a password reset link has been dispatched.'
      );
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl border border-blue-500/20 p-8 shadow-2xl relative overflow-hidden">
          {/* Top Logo and Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="inline-block hover:scale-105 transition-transform mb-3">
              <SentinelLogo size={48} />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Welcome to Sentinel' : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {mode === 'signin'
                ? 'Sign in to access your fraud monitoring console and investigation workspace.'
                : 'Register as an analyst to access intelligent fraud monitoring and case triage.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn size={14} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus size={14} />
              Create Account
            </button>
          </div>

          {/* Global Error Banner */}
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{generalError}</span>
            </motion.div>
          )}

          {generalSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{generalSuccess}</span>
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
                {mode === 'signin' && (
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
                )}
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
                  placeholder="Enter your password (min 6 characters)"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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

            {/* Confirm Password (Only in Sign Up Mode) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      confirmPasswordError ? 'text-rose-400' : 'text-slate-500'
                    }`}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                    }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full bg-slate-900/60 border rounded-xl px-3.5 pl-10 pr-10 py-2.5 text-white text-sm outline-none transition-all ${
                      confirmPasswordError
                        ? 'border-rose-500/80 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-700/60 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-rose-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                    <span>•</span> {confirmPasswordError}
                  </p>
                )}
              </motion.div>
            )}

            {/* Remember Me Persistent Session Option (Sign In Mode) */}
            {mode === 'signin' && (
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition-all glow-blue focus-ring text-sm mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />{' '}
                  {mode === 'signin' ? 'Verifying Credentials...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}{' '}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch Prompt */}
          <div className="text-center text-xs text-slate-400 mt-5">
            {mode === 'signin' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          <Link
            to="/"
            className="block text-center text-slate-500 hover:text-slate-300 text-xs mt-4 transition-colors"
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
              <div className="flex items-center gap-2 mb-3">
                <Shield className="text-blue-400" size={20} />
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Enter your registered email address below. We will send you a secure, time-limited
                password reset link.
              </p>

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" />
                    <span>{forgotSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess(null);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      {forgotSubmitting && <Loader2 size={12} className="animate-spin" />}
                      Send Reset Link
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { SentinelLogo } from '../components/ui/SentinelLogo';
import { loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginApi({ username, password });
      login(data.token, { username: data.username, role: data.role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 bg-grid">
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
            <p className="text-slate-400 text-sm">AI Fraud Detection Platform</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 mb-4 flex items-center gap-2"
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full bg-slate-900/60 border border-slate-700/60 focus:border-blue-500 rounded-xl px-3.5 pl-10 py-2.5 text-white text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full bg-slate-900/60 border border-slate-700/60 focus:border-blue-500 rounded-xl px-3.5 pl-10 py-2.5 text-white text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-[11px] text-slate-400">
              <span className="text-blue-300 font-semibold">Demo credentials:</span> admin / admin123
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition-all glow-blue focus-ring text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <Link to="/" className="block text-center text-slate-500 hover:text-slate-300 text-xs mt-5 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

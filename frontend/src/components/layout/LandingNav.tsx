import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LogOut, User as UserIcon } from 'lucide-react';
import { SentinelLogo } from '../ui/SentinelLogo';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'About', href: '#about' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong border-b border-blue-500/10 shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <SentinelLogo size={30} />
              <span className="text-white font-bold text-lg tracking-tight">
                Sentinel
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 focus-ring rounded"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs text-blue-300">
                    <UserIcon size={13} />
                    <span className="font-semibold capitalize">{user?.username || 'Admin'}</span>
                    <span className="text-slate-400 font-mono text-[10px]">({user?.role || 'ADMIN'})</span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all glow-blue hover:scale-105 focus-ring"
                  >
                    Open Dashboard
                    <ChevronRight size={14} />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-sm font-medium px-3 py-2 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    title="Log Out"
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all focus-ring"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-in"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all glow-blue hover:scale-105 focus-ring"
                  >
                    Get Started
                    <ChevronRight size={14} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-slate-400 hover:text-white transition-colors focus-ring rounded-lg p-1.5"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong border-b border-blue-500/10 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-300 hover:text-white text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-blue-500/10 my-2 pt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-300">
                      <UserIcon size={14} />
                      <span>Logged in as <strong>{user?.username}</strong></span>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all"
                    >
                      Open Dashboard <ChevronRight size={14} />
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all border border-rose-500/20"
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="text-slate-300 hover:text-white text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all"
                    >
                      Get Started <ChevronRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  AlertTriangle,
  Search as SearchIcon,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Menu,
  X,
  Shield,
  LogOut,
  FlaskConical,
} from 'lucide-react';
import { SentinelLogo } from '../ui/SentinelLogo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Fraud Sandbox', href: '/sandbox', icon: FlaskConical },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Flagged', href: '/flagged', icon: AlertTriangle },
  { label: 'Investigations', href: '/investigations', icon: SearchIcon },
  { label: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
  mobile?: boolean;
}

function SidebarContent({ collapsed, onToggle, onClose, mobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 ${
        mobile ? 'w-64' : collapsed ? 'w-[68px]' : 'w-60'
      } bg-[#080f1e] border-r border-blue-500/10 relative`}
    >
      {/* Clickable Logo - navigates to Home page without logging out */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-blue-500/10 flex-shrink-0">
        <Link
          to="/"
          title="Back to Home"
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <SentinelLogo size={28} />
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-white font-bold text-base overflow-hidden whitespace-nowrap group-hover:text-blue-400 transition-colors"
              >
                Sentinel
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="ml-auto text-slate-500 hover:text-white focus-ring rounded-lg p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const active = location.pathname === item.href ||
            (item.href === '/transactions' && location.pathname.startsWith('/transactions'));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                active
                  ? 'text-white bg-blue-600/15 border border-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-blue-600/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <AnimatePresence>
                {(!collapsed || mobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.label === 'Flagged' && (!collapsed || mobile) && (
                <span className="ml-auto flex-shrink-0 relative z-10 bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="p-3 border-t border-blue-500/10 flex-shrink-0 space-y-2">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.02] ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-white text-xs font-semibold truncate capitalize">
                  {user?.username || 'Admin'}
                </p>
                <p className="text-slate-500 text-[10px] truncate uppercase font-mono tracking-wider">
                  {user?.role || 'ADMIN'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          title="Log Out"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ${
            collapsed && !mobile ? 'justify-center' : ''
          }`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      {!mobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 glass rounded-full border border-blue-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-all focus-ring z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </aside>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const breadcrumbMap: Record<string, string> = {
    '/dashboard': 'Overview',
    '/transactions': 'Transactions',
    '/flagged': 'Flagged Transactions',
    '/investigations': 'Investigations',
    '/audit-logs': 'Audit Logs',
    '/settings': 'Settings',
  };

  const getCurrentPage = () => {
    if (location.pathname.startsWith('/transactions/new')) return 'New Transaction';
    if (location.pathname.match(/^\/transactions\/.+/)) return 'Transaction Details';
    return breadcrumbMap[location.pathname] || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <SidebarContent
                collapsed={false}
                onToggle={() => {}}
                onClose={() => setMobileOpen(false)}
                mobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex-shrink-0 flex items-center gap-4 px-4 sm:px-6 border-b border-blue-500/10 bg-[#080f1e]/80 backdrop-blur-xl">
          <button
            className="md:hidden text-slate-400 hover:text-white focus-ring rounded-lg p-1.5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb with Home link */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
              title="Return to Home (remains logged in)"
            >
              <Shield size={14} className="text-blue-400" />
              <span>Sentinel</span>
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">{getCurrentPage()}</span>
          </div>

          <div className="flex-1" />

          {/* Search bar placeholder */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-blue-500/10 rounded-xl px-3 py-2 text-slate-500 text-sm w-48 cursor-default select-none">
            <SearchIcon size={14} />
            <span>Search...</span>
          </div>

          {/* Top bar Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all focus-ring"
            title="Log Out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-grid">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

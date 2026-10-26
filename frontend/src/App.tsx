import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { DashboardShell } from './components/layout/DashboardShell';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import DashboardOverview from './pages/DashboardOverview';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import NewTransactionPage from './pages/NewTransactionPage';
import FlaggedPage from './pages/FlaggedPage';
import InvestigationsPage from './pages/InvestigationsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import { FraudSandboxPage } from './pages/FraudSandboxPage';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />

            {/* Protected Dashboard Routes (Guarded: redirect to /sign-in if not authenticated) */}
            <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
            <Route path="/sandbox" element={<DashboardLayout><FraudSandboxPage /></DashboardLayout>} />
            <Route path="/transactions" element={<DashboardLayout><TransactionsPage /></DashboardLayout>} />
            <Route path="/transactions/new" element={<DashboardLayout><NewTransactionPage /></DashboardLayout>} />
            <Route path="/transactions/:id" element={<DashboardLayout><TransactionDetailPage /></DashboardLayout>} />
            <Route path="/flagged" element={<DashboardLayout><FlaggedPage /></DashboardLayout>} />
            <Route path="/investigations" element={<DashboardLayout><InvestigationsPage /></DashboardLayout>} />
            <Route path="/audit-logs" element={<DashboardLayout><AuditLogsPage /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

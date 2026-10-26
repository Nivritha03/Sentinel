import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const variantColors = {
    danger: { icon: 'text-rose-400', btn: 'bg-rose-600 hover:bg-rose-500 text-white', border: 'border-rose-500/30' },
    warning: { icon: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500 text-white', border: 'border-amber-500/30' },
    info: { icon: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-500 text-white', border: 'border-blue-500/30' },
  };
  const v = variantColors[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative glass-strong rounded-2xl p-6 w-full max-w-md border ${v.border} shadow-2xl`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors focus-ring rounded-lg p-1"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 mt-0.5 ${v.icon}`}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 id="dialog-title" className="text-white font-semibold text-lg mb-2">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-slate-600/50 hover:border-slate-500 hover:text-white transition-all focus-ring disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus-ring disabled:opacity-50 ${v.btn} flex items-center gap-2`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

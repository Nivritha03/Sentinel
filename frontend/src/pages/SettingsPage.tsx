import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Monitor, Bell, Palette, Info, Moon, Sun } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { SentinelLogo } from '../components/ui/SentinelLogo';

type ThemeOption = 'dark' | 'darker';
type DensityOption = 'compact' | 'comfortable' | 'spacious';

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [density, setDensity] = useState<DensityOption>('comfortable');
  const [notifications, setNotifications] = useState({
    highRisk: true,
    reviews: true,
    system: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Settings are UI-only in this prototype — not persisted to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-slate-300 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all focus-ring ${value ? 'bg-blue-600' : 'bg-slate-700'}`}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Display preferences and platform configuration"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Settings' }]}
        actions={
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all focus-ring ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {saved ? '✓ Saved' : 'Save Preferences'}
          </motion.button>
        }
      />

      <div className="max-w-2xl space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20">
          <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-400 text-sm leading-relaxed">
            These settings are display preferences only. They are not persisted to the backend in this prototype version.
          </p>
        </div>

        {/* Appearance */}
        <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-500/10 flex items-center gap-2">
            <Palette size={16} className="text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Appearance</h3>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">Color Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {(['dark', 'darker'] as ThemeOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all focus-ring ${theme === t ? 'border-blue-500/50 bg-blue-500/10 text-blue-300' : 'border-blue-500/15 text-slate-400 hover:text-white hover:border-blue-500/25'}`}
                  >
                    {t === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="text-sm capitalize">{t === 'dark' ? 'Midnight Dark' : 'Deep Space'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">Table Density</p>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'comfortable', 'spacious'] as DensityOption[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-3 py-2 rounded-xl border text-xs transition-all focus-ring ${density === d ? 'border-blue-500/50 bg-blue-500/10 text-blue-300' : 'border-blue-500/15 text-slate-400 hover:text-white'}`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-500/10 flex items-center gap-2">
            <Bell size={16} className="text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
          </div>
          <div className="p-5 space-y-4">
            <Toggle value={notifications.highRisk} onChange={(v) => setNotifications((p) => ({ ...p, highRisk: v }))} label="High-risk transaction alerts" />
            <Toggle value={notifications.reviews} onChange={(v) => setNotifications((p) => ({ ...p, reviews: v }))} label="Review queue updates" />
            <Toggle value={notifications.system} onChange={(v) => setNotifications((p) => ({ ...p, system: v }))} label="System notifications" />
          </div>
        </div>

        {/* About */}
        <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-500/10 flex items-center gap-2">
            <Info size={16} className="text-blue-400" />
            <h3 className="text-white font-semibold text-sm">About Sentinel</h3>
          </div>
          <div className="p-5 flex items-center gap-4">
            <SentinelLogo size={40} />
            <div>
              <p className="text-white font-semibold">Sentinel Fraud Detection Platform</p>
              <p className="text-slate-500 text-xs mt-0.5">Frontend v1.0.0 · React + Vite + TypeScript</p>
              <p className="text-slate-500 text-xs mt-0.5">Backend: Spring Boot + MongoDB Atlas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

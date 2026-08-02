import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { token, setToken } = useAuth();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  if (token) return <Navigate to="/campaigns" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter your admin token.');
      return;
    }
    setError('');
    setToken(trimmed);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-xl">
            <Zap size={32} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">HAL Leads</h1>
          <p className="text-slate-400 text-sm">Meta-to-WhatsApp Automation Platform</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-slate-200 font-semibold text-base mb-1">Sign in</h2>
          <p className="text-slate-400 text-sm mb-5">Enter your admin token to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="admin-token" className="block text-xs font-medium text-slate-400 mb-1.5">
                Admin Token
              </label>
              <div className="relative">
                <input
                  id="admin-token"
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="hal-admin-secret-token-…"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white
                             placeholder:text-slate-600 pr-10
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={show ? 'Hide token' : 'Show token'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5">
              Access Dashboard
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          HAL Leads Admin — Internal Tool Only
        </p>
      </div>
    </div>
  );
}

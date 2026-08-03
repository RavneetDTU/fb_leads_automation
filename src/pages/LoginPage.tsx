import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Logo theme="light" size="lg" />
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-elevated">
          <h2 className="text-slate-900 font-bold text-xl mb-1 tracking-tight">Sign in to Jarvis AI</h2>
          <p className="text-slate-500 text-xs mb-6 font-medium">Enter your admin security token to access dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label htmlFor="admin-token" className="block text-xs font-semibold text-slate-700 mb-2">
                Admin Token
              </label>
              <div className="relative">
                <input
                  id="admin-token"
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="jarvis-admin-secret-token-…"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900
                             placeholder:text-slate-400 pr-11
                             focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={show ? 'Hide token' : 'Show token'}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md">
              Access Dashboard
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          Jarvis AI — Enterprise Lead Automation Platform
        </p>
      </div>
    </div>
  );
}

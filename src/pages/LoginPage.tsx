import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { post } from '../lib/api';
import { Spinner } from '../components/ui/Spinner';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function LoginPage() {
  const { token, setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (token) return <Navigate to="/campaigns" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setError('Please enter both User ID and Password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await post<LoginResponse>('/api/auth/login', '', { username: u, password: p });
      if (res?.access_token) {
        setToken(res.access_token);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError((err as Error).message ?? 'Invalid User ID or Password.');
    } finally {
      setLoading(false);
    }
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
          <p className="text-slate-500 text-xs mb-6 font-medium">Enter your credentials to access the admin dashboard.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="user-id" className="block text-xs font-semibold text-slate-700 mb-1.5">
                User ID
              </label>
              <input
                id="user-id"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter User ID…"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           placeholder:text-slate-400
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password…"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                             placeholder:text-slate-400 pr-11
                             focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="btn-primary w-full justify-center py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? <Spinner size="sm" /> : 'Access Dashboard'}
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


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
    <div className="min-h-screen bg-forest-dark flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Logo theme="dark" size="lg" />
        </div>

        <div className="bg-forest/90 backdrop-blur-md border border-forest-hover rounded-2xl p-7 shadow-soft">
          <h2 className="text-white font-semibold text-lg mb-1 tracking-tight">Sign in to Jarvis AI</h2>
          <p className="text-neutral-divider/80 text-xs mb-6">Enter your admin security token to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label htmlFor="admin-token" className="block text-xs font-medium text-sage mb-1.5">
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
                  className="w-full rounded-lg border border-forest-hover bg-forest-dark/80 px-3.5 py-2.5 text-sm text-white
                             placeholder:text-neutral-muted pr-10
                             focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage hover:text-white transition-colors"
                  aria-label={show ? 'Hide token' : 'Show token'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5 shadow-soft">
              Access Dashboard
            </button>
          </form>
        </div>

        <p className="text-center text-sage/70 text-xs mt-6">
          Jarvis AI — Enterprise Lead Automation
        </p>
      </div>
    </div>
  );
}

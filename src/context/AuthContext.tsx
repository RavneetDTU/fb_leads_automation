import { createContext, useContext, useState, type ReactNode } from 'react';

// TODO(security): Token is stored in React memory state only.
// It is NOT persisted to localStorage or sessionStorage, preventing XSS-based token theft.
// The trade-off is the user must re-enter the token on page reload — acceptable for an internal admin tool.

interface AuthContextValue {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  function setToken(t: string) {
    setTokenState(t);
  }

  function clearToken() {
    setTokenState(null);
    // Force full page reload to clear all React Query cache on logout
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

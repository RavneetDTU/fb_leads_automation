import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authService } from '../services/auth';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login(formData);

            if (response.success || response.token) {
                // Store the token
                localStorage.setItem('authToken', response.token);
                // Redirect to dashboard
                navigate('/campaigns');
            }
        } catch (err) {
            console.error('Login Failed:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex bg-background overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-[480px] h-full flex flex-col justify-center px-8 lg:px-16 bg-white shrink-0 overflow-y-auto">
                <div className="mb-12">
                    <Link to="/" className="text-2xl font-heading font-semibold tracking-tight text-foreground">
                        JarvisCalling
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl mb-2 font-heading font-semibold">Welcome back</h1>
                    <p className="text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Your email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link to="#" className="text-sm text-[rgb(16,71,160)] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>

                    <div className="text-center">
                        <span className="text-muted-foreground text-sm">Don't have an account? </span>
                        <Link to="/signup" className="text-[rgb(16,71,160)] hover:underline text-sm font-medium">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>

            {/* Right Side - Content */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center relative overflow-hidden">
                {/* Animated dots background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-foreground rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 max-w-md px-8">
                    <div className="bg-white border border-border rounded-lg p-6 mb-4 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[rgba(167,175,175,0.19)] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold mb-2">Instant Lead Conversion</h3>
                                <p className="text-sm text-muted-foreground">
                                    Convert Meta ad leads into WhatsApp conversations automatically. No manual work required.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        Trusted by marketing teams worldwide
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

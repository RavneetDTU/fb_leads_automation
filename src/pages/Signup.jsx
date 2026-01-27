import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authService } from '../services/auth';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authService.signup(formData);
            if (response.success) {
                console.log('Signup Successful:', response);
                // In a real app, you would store the token here (e.g., localStorage or Context)
                localStorage.setItem('authToken', response.token);
                navigate('/campaigns');
            }
        } catch (err) {
            console.error('Signup Failed:', err);
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="min-h-screen flex bg-background">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="mb-12">
          <Link to="/" className="text-2xl font-heading font-semibold tracking-tight text-foreground">
            JarvisCalling
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl mb-2 font-heading font-semibold">Create your account</h1>
          <p className="text-muted-foreground">
            Enter your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
              required
            />
          </div>

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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
              required
            />
          </div>

          <button
            type="submit" 
            className="w-full px-8 py-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Sign Up
          </button>

          <div className="text-center">
            <span className="text-muted-foreground text-sm">Already have an account? </span>
            <Link to="/login" className="text-[rgb(20,75,166)] hover:underline text-sm font-medium">
              Sign In
            </Link>
          </div>
        </form>

        <p className="text-xs text-muted-foreground mt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Right Side - Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center relative overflow-hidden">
        {/* Animated dots background */}
        <div className="absolute inset-0 opacity-10">
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
              <div className="w-12 h-12 bg-[rgba(167,175,175,0.18)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Automated WhatsApp Outreach</h3>
                <p className="text-sm text-muted-foreground">
                  Turn Meta ad leads into conversations automatically. Scale your sales without adding headcount.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Join hundreds of marketers already using JarvisCalling
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

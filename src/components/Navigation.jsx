import { Link, useLocation } from 'react-router-dom';

function Navigation() {
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    return (
        <nav className="border-b border-border bg-background">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xl font-heading font-semibold">
                        JarvisCalling.ai
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Clock, MessageCircle, Settings, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/campaigns', icon: LayoutGrid, label: 'Campaigns' },
  { to: '/last-30-days', icon: Clock, label: 'Last 30 Days' },
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { clearToken } = useAuth();

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-forest text-neutral-divider sticky top-0 overflow-y-auto border-r border-forest-hover select-none shadow-soft">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-forest-hover/80">
        <Logo theme="dark" size="sm" />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-sage px-3 mb-2">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-forest-hover text-white font-semibold shadow-apple-sm border-l-2 border-terracotta'
                  : 'text-neutral-divider/80 hover:bg-forest-hover/50 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-terracotta' : 'text-sage'} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Calendar section */}
        <div className="pt-5 mt-4 border-t border-forest-hover/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sage px-3 mb-2">Calendar</p>
          <NavLink
            to="/settings/calendars"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-forest-hover text-white font-semibold shadow-apple-sm border-l-2 border-terracotta'
                  : 'text-neutral-divider/80 hover:bg-forest-hover/50 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CalendarPlus size={18} className={isActive ? 'text-terracotta' : 'text-sage'} />
                Add Calendar
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-forest-hover/80">
        <button
          onClick={clearToken}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-divider/70 hover:bg-forest-hover/50 hover:text-white transition-all duration-150"
        >
          <span className="text-sage font-mono">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

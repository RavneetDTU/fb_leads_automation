import { NavLink } from 'react-router-dom';
import { LayoutGrid, Clock, MessageCircle, Settings, CalendarPlus, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/campaigns', icon: LayoutGrid, label: 'Campaigns' },
  { to: '/last-30-days', icon: Clock, label: 'Last 30 Days' },
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { clearToken } = useAuth();

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-sidebar-bg text-sidebar-text sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sidebar-text-active text-sm font-bold leading-tight">HAL Leads</p>
          <p className="text-sidebar-text text-xs">Admin Dashboard</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 px-2 mb-2">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-brand-500' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Calendar section */}
        <div className="pt-4 mt-2 border-t border-sidebar-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 px-2 mb-2">Calendar</p>
          <NavLink
            to="/settings/calendars"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200'
              }`
            }
          >
            <CalendarPlus size={17} />
            Add Calendar
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={clearToken}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200 transition-colors"
        >
          <span className="text-base">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

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
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-slate-900 text-slate-400 sticky top-0 overflow-y-auto border-r border-slate-800/60 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-apple-sm">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight tracking-tight">HAL Leads</p>
          <p className="text-slate-400 text-[11px] font-normal">Admin Dashboard</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-apple-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Calendar section */}
        <div className="pt-5 mt-4 border-t border-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">Calendar</p>
          <NavLink
            to="/settings/calendars"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-apple-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CalendarPlus size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                Add Calendar
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <button
          onClick={clearToken}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-150"
        >
          <span className="text-slate-500 font-mono">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

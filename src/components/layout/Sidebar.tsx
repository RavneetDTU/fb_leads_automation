import { NavLink } from 'react-router-dom';
import { LayoutGrid, Clock, MessageCircle, Settings, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/campaigns', icon: LayoutGrid, label: 'Campaigns' },
  { to: '/last-30-days', icon: Clock, label: 'Last 30 Days' },
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp', badge: 'Live' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { clearToken } = useAuth();

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-[#0F172A] text-slate-400 sticky top-0 overflow-y-auto border-r border-slate-800/80 select-none shadow-xl">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80">
        <Logo theme="dark" size="sm" />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</p>
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Calendar section */}
        <div className="pt-6 mt-4 border-t border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">Calendar & Branch</p>
          <NavLink
            to="/settings/calendars"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CalendarPlus size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Store Branches</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="px-4 py-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={clearToken}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all duration-150"
        >
          <span className="text-indigo-400 font-mono">→</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

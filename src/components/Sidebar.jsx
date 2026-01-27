import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, Calendar, TrendingUp, MessageCircle, Settings, CalendarPlus, CalendarCheck } from 'lucide-react';
import { calendarManager } from '../utils/calendarManager';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState([]);

  // Load calendars from localStorage on mount
  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = () => {
    const allCalendars = calendarManager.getAll();
    setCalendars(allCalendars);
  };

  const handleAddCalendar = () => {
    const storeName = prompt('Enter store name:');
    if (!storeName || !storeName.trim()) return;

    try {
      const newCalendar = calendarManager.create(storeName.trim());
      loadCalendars(); // Refresh the list
      navigate(`/calendar/${newCalendar.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const navItems = [
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/daily-leads', label: 'Daily Leads', icon: Calendar },
    { path: '/promoted-leads', label: 'Promoted Leads', icon: TrendingUp },
    { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const calendarItems = [
    { path: '/calendar', label: 'Calendar', icon: CalendarCheck },
    { path: '/add-calendar', label: 'Add Calendar', icon: CalendarPlus },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-sidebar-border">
        <Link to="/campaigns" className="text-lg font-heading font-semibold text-sidebar-foreground tracking-tight">
          JarvisCalling
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {/* Main Navigation */}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/campaigns' && location.pathname === '/leads');

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Calendar Section */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <p className="text-xs font-medium text-sidebar-foreground/50 px-3 mb-2 uppercase tracking-wider">
            Calendar
          </p>
          <ul className="space-y-1">
            {/* Dynamic Calendar Links */}
            {calendars.map((calendar) => {
              const isActive = location.pathname === `/calendar/${calendar.id}`;

              return (
                <li key={calendar.id}>
                  <Link
                    to={`/calendar/${calendar.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                  >
                    <CalendarCheck className="w-5 h-5" />
                    <span className="text-sm">{calendar.storeName}</span>
                  </Link>
                </li>
              );
            })}

            {/* Add Calendar Button */}
            <li>
              <button
                onClick={handleAddCalendar}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <CalendarPlus className="w-5 h-5" />
                <span className="cursor-pointer text-sm">Add Calendar</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50">
          © 2024 JarvisCalling
        </p>
      </div>
    </aside>
  );
}


export default Sidebar;

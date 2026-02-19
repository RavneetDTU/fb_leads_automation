import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Layouts
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Campaigns } from './pages/Campaigns'
import { Leads } from './pages/Leads'
import { Settings } from './pages/Setting' // Check if Setting.jsx exports 'Settings' named or default. It exported named 'Settings'.
import DailyLeads from './pages/DailyLeads'
import PromotedLeads from './pages/PromotedLeads'
import Whatsapp from './pages/Whatsapp'
import { CalendarPage } from './pages/CalendarPage'
import BookCalendarEvent from './pages/BookCalendarEvent'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Login/Signup) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected Dashboard Routes (Sidebar Layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/daily-leads" element={<DailyLeads />} />
          <Route path="/promoted-leads" element={<PromotedLeads />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/calendar/:calendarId" element={<CalendarPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/book-calendar-event" element={<BookCalendarEvent />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

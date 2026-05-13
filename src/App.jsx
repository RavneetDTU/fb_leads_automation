import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout'
import { PublicLayout } from './layouts/PublicLayout'

// Pages
import PrivacyPolicy from './components/landingpage/privacy-policy'
import TermsOfService from './components/landingpage/terms-of-service'
import { CalendarPage } from './pages/CalendarPage'
import { CalendarSettings } from './pages/CalendarSettings'
import { Campaigns } from './pages/Campaigns'
import DailyLeads from './pages/DailyLeads'
import Last30DaysLeads from './pages/Last30DaysLeads'
import { Leads } from './pages/Leads'
import Login from './pages/Login'
import PromotedLeads from './pages/PromotedLeads'
import { Settings } from './pages/Setting'; // Check if Setting.jsx exports 'Settings' named or default. It exported named 'Settings'.
import Signup from './pages/Signup'
import Whatsapp from './pages/Whatsapp'
// import BookCalendarEvent from './pages/BookCalendarEvent' // Moved into LeadModal tab

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Login/Signup) */}
        <Route element={<PublicLayout />}>
          {/* Redirect root "/" to "/login" */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* <Route path="/" element={<LandingPageRoute />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* <Route path="/landing" element={<LandingPageRoute />} /> */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>

        {/* Protected Dashboard Routes (Sidebar Layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/daily-leads" element={<DailyLeads />} />
          <Route path="/last-30-days" element={<Last30DaysLeads />} />
          <Route path="/promoted-leads" element={<PromotedLeads />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/calendar/:calendarId" element={<CalendarPage />} />
          <Route path="/calendar/:calendarId/settings" element={<CalendarSettings />} />
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="/book-calendar-event" element={<BookCalendarEvent />} /> */} {/* Moved into LeadModal */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App

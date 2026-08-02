import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignLeadsPage } from './pages/CampaignLeadsPage';
import { LastThirtyDaysPage } from './pages/LastThirtyDaysPage';
import { WhatsAppInboxPage } from './pages/WhatsAppInboxPage';
import { SettingsPage } from './pages/SettingsPage';
import { CalendarsPage } from './pages/CalendarsPage';
import { CalendarConfigPage } from './pages/CalendarConfigPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id/leads" element={<CampaignLeadsPage />} />
          <Route path="/last-30-days" element={<LastThirtyDaysPage />} />
          <Route path="/whatsapp" element={<WhatsAppInboxPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/calendars" element={<CalendarsPage />} />
          <Route path="/settings/calendars/:id" element={<CalendarConfigPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/campaigns" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

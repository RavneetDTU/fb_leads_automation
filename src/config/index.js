export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  leadsApiBaseUrl: import.meta.env.VITE_LEADS_API_BASE_URL || 'https://leadsautoapis.jarviscalling.ai',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  appName: 'Mets Leads',
  version: '1.0.0',
};

import { config } from '../config';

// Change this to your actual API base URL when ready
const API_BASE_URL = config.apiBaseUrl;

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} - Response data
   */
  async signup(userData) {
    // --- REAL API IMPLEMENTATION ---
    /*
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
 
    return response.json();
    */

    // --- MOCK IMPLEMENTATION (Remove when API is ready) ---
    console.log('[AuthService] Simulating Signup:', userData);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    if (userData.email === 'error@example.com') {
      throw new Error('User already exists');
    }

    return {
      success: true,
      token: 'mock-jwt-token-xyz',
      user: { id: '1', name: userData.name, email: userData.email }
    };
  },

  /**
   * Login an existing user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Response data
   */
  async login(credentials) {
    // --- REAL API IMPLEMENTATION ---
    /*
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
 
    return response.json();
    */

    // --- MOCK IMPLEMENTATION (Strict Credentials) ---
    console.log('[AuthService] Verifying Credentials:', credentials.email);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

    // 1. Admin User
    if (credentials.email === 'admin@jarvis.com' && credentials.password === 'Admin@123') {
      return {
        success: true,
        token: 'mock-admin-token-123',
        user: { id: 'admin', name: 'Admin User', email: 'admin@jarvis.com', role: 'admin' }
      };
    }

    // 2. Test User
    if (credentials.email === 'test@jarvis.com' && credentials.password === 'Test@123') {
      return {
        success: true,
        token: 'mock-test-token-456',
        user: { id: 'test', name: 'Test User', email: 'test@jarvis.com', role: 'user' }
      };
    }

    // Invalid Credentials
    throw new Error('Invalid email or password');
  }
};

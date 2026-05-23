import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  role: localStorage.getItem('role') || null,
  credits: parseInt(localStorage.getItem('credits')) || 0,
  subscription: localStorage.getItem('subscription') || 'free',
  full_name: localStorage.getItem('full_name') || '',

  isLoggedIn: () => {
    return !!get().token;
  },

  isAdmin: () => {
    return get().role === 'admin';
  },

  login: (token, username, role, credits, subscription, full_name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    localStorage.setItem('credits', credits !== undefined ? credits : 5);
    localStorage.setItem('subscription', subscription || 'free');
    localStorage.setItem('full_name', full_name || '');
    set({ token, username, role, credits: credits !== undefined ? credits : 5, subscription: subscription || 'free', full_name: full_name || '' });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('credits');
    localStorage.removeItem('subscription');
    localStorage.removeItem('full_name');
    set({ token: null, username: null, role: null, credits: 0, subscription: 'free', full_name: '' });
  },

  setUserDetails: (details) => {
    const updates = {};
    if (details.credits !== undefined) {
      localStorage.setItem('credits', details.credits);
      updates.credits = details.credits;
    }
    if (details.subscription !== undefined) {
      localStorage.setItem('subscription', details.subscription);
      updates.subscription = details.subscription;
    }
    if (details.full_name !== undefined) {
      localStorage.setItem('full_name', details.full_name || '');
      updates.full_name = details.full_name || '';
    }
    if (details.username !== undefined) {
      localStorage.setItem('username', details.username);
      updates.username = details.username;
    }
    set(updates);
  }
}));


export default useAuthStore;

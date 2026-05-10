import { create } from 'zustand';
import { setTokenGetter, setOnUnauthorized } from '../api/client';
import { loginUser, registerUser, getProfile, refreshToken } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true, // true until initial auth check completes
  authError: null,

  /**
   * Initialize: wire up the API client to read tokens from this store.
   * Called once on app mount.
   */
  init: () => {
    setTokenGetter(() => get().accessToken);
    setOnUnauthorized(() => get().logout());

    // Try to restore session from sessionStorage (survives refresh, not tab close)
    const saved = sessionStorage.getItem('spark_auth');
    if (saved) {
      try {
        const { accessToken, refreshToken, user, isOnboarded } = JSON.parse(saved);
        set({ accessToken, refreshToken, user, isAuthenticated: true, isOnboarded, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  _persist: () => {
    const { accessToken, refreshToken, user, isOnboarded } = get();
    sessionStorage.setItem('spark_auth', JSON.stringify({ accessToken, refreshToken, user, isOnboarded }));
  },

  login: async (email, password) => {
    set({ authError: null });
    try {
      const tokens = await loginUser(email, password);
      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isAuthenticated: true,
        authError: null,
      });
      // Fetch profile after login
      const profile = await getProfile();
      set({ user: profile });
      get()._persist();
      return true;
    } catch (e) {
      set({ authError: e.message });
      return false;
    }
  },

  register: async (email, password, businessName) => {
    set({ authError: null });
    try {
      await registerUser(email, password, businessName);
      // Auto-login after register
      return await get().login(email, password);
    } catch (e) {
      set({ authError: e.message });
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('spark_auth');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isOnboarded: false,
      authError: null,
    });
  },

  setOnboarded: (value) => {
    set({ isOnboarded: value });
    get()._persist();
  },

  clearError: () => set({ authError: null }),
}));

export default useAuthStore;

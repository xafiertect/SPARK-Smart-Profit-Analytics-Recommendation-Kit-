import { create } from 'zustand';
import {
  getNotifications,
  getUnreadCount,
  updateNotificationStatus,
  checkNotifications,
} from '../api/notifications';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  panelOpen: false,
  selectedNotification: null,
  error: null,

  // Panel toggle
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false, selectedNotification: null }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen, selectedNotification: s.panelOpen ? null : s.selectedNotification })),

  // Select notification for detail view
  selectNotification: (notif) => set({ selectedNotification: notif }),
  clearSelection: () => set({ selectedNotification: null }),

  // Fetch all notifications
  fetchNotifications: async (status) => {
    set({ loading: true, error: null });
    try {
      const data = await getNotifications(status);
      set({ notifications: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // Fetch unread badge count
  fetchUnreadCount: async () => {
    try {
      const data = await getUnreadCount();
      set({ unreadCount: data.count });
    } catch (e) {
      /* silent — badge is non-critical */
    }
  },

  // Mark as read
  markRead: async (id) => {
    try {
      await updateNotificationStatus(id, 'READ');
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, status: 'READ' } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch (e) {
      set({ error: e.message });
    }
  },

  // Mark as done
  markDone: async (id) => {
    try {
      await updateNotificationStatus(id, 'DONE');
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, status: 'DONE' } : n
        ),
        selectedNotification: null,
      }));
    } catch (e) {
      set({ error: e.message });
    }
  },

  // Ignore
  dismiss: async (id) => {
    try {
      await updateNotificationStatus(id, 'IGNORED');
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, status: 'IGNORED' } : n
        ),
        selectedNotification: null,
      }));
    } catch (e) {
      set({ error: e.message });
    }
  },

  // Trigger check
  runCheck: async () => {
    set({ loading: true });
    try {
      await checkNotifications();
      // Refresh after check
      await get().fetchNotifications();
      await get().fetchUnreadCount();
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useNotificationStore;

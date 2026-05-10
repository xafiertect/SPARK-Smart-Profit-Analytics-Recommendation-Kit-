import { create } from 'zustand';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getInsights, generateInsights } from '../api/agent';
import { getSummary } from '../api/dashboard';

const useBusinessStore = create((set, get) => ({
  products: [],
  insights: [],
  dailySummary: null,
  weeklySummary: null,
  productsLoading: false,
  insightsLoading: false,
  summaryLoading: false,
  error: null,

  // ── Products ──────────────────────────────────────────
  fetchProducts: async () => {
    set({ productsLoading: true, error: null });
    try {
      const data = await listProducts();
      set({ products: data, productsLoading: false });
    } catch (e) {
      set({ error: e.message, productsLoading: false });
    }
  },

  addProduct: async (productData) => {
    try {
      const created = await createProduct(productData);
      set((s) => ({ products: [...s.products, created] }));
      return created;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const updated = await updateProduct(id, updates);
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? updated : p)),
      }));
      return updated;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  removeProduct: async (id) => {
    try {
      await deleteProduct(id);
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  // ── Insights ──────────────────────────────────────────
  fetchInsights: async () => {
    set({ insightsLoading: true });
    try {
      const data = await getInsights();
      set({ insights: data, insightsLoading: false });
    } catch (e) {
      set({ error: e.message, insightsLoading: false });
    }
  },

  triggerInsights: async () => {
    try {
      const result = await generateInsights();
      // Refresh insights list after generation
      await get().fetchInsights();
      return result;
    } catch (e) {
      set({ error: e.message });
    }
  },

  markInsightRead: (id) =>
    set((s) => ({
      insights: s.insights.map((i) => (i.id === id ? { ...i, is_read: true } : i)),
    })),

  dismissInsight: (id) =>
    set((s) => ({
      insights: s.insights.filter((i) => i.id !== id),
    })),

  // ── Dashboard Summary ─────────────────────────────────
  fetchSummary: async () => {
    set({ summaryLoading: true });
    try {
      const data = await getSummary();
      set({
        dailySummary: data.today,
        weeklySummary: data.week,
        summaryLoading: false,
      });
    } catch (e) {
      set({ error: e.message, summaryLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useBusinessStore;

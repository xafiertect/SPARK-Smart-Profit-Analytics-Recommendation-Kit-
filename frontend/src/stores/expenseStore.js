import { create } from 'zustand';
import {
  listExpenses,
  createExpense,
  updateExpense,
  confirmExpense,
  deleteExpense,
} from '../api/expenses';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await listExpenses(filters);
      set({ expenses: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  addExpense: async (data) => {
    try {
      const created = await createExpense(data);
      set((s) => ({ expenses: [created, ...s.expenses] }));
      return created;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  editExpense: async (id, data) => {
    try {
      const updated = await updateExpense(id, data);
      set((s) => ({
        expenses: s.expenses.map((ex) => (ex.id === id ? updated : ex)),
      }));
      return updated;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  confirmExpenseItem: async (id) => {
    try {
      const confirmed = await confirmExpense(id);
      set((s) => ({
        expenses: s.expenses.map((ex) => (ex.id === id ? confirmed : ex)),
      }));
      return confirmed;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  removeExpense: async (id) => {
    try {
      await deleteExpense(id);
      set((s) => ({ expenses: s.expenses.filter((ex) => ex.id !== id) }));
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useExpenseStore;

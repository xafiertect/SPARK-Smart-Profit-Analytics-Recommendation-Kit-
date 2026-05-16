import { create } from 'zustand';
import { listTransactions, createTransaction } from '../api/transactions';
import { scanReceipt } from '../api/ocr';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  pendingReceipt: null,
  transactionsLoading: false,
  error: null,

  fetchTransactions: async (dateFrom, dateTo) => {
    set({ transactionsLoading: true, error: null });
    try {
      const data = await listTransactions(dateFrom, dateTo);
      set({ transactions: data, transactionsLoading: false });
    } catch (e) {
      set({ error: e.message, transactionsLoading: false });
    }
  },

  /**
   * Upload receipt file → real Gemini Vision OCR → parsed JSON.
   * Sets pendingReceipt for the Validation page.
   */
  scanReceiptFile: async (file) => {
    set({ pendingReceipt: null, error: null });
    try {
      const parsed = await scanReceipt(file);
      set({ pendingReceipt: parsed });
      return parsed;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  setPendingReceipt: (receipt) => set({ pendingReceipt: receipt }),
  clearPendingReceipt: () => set({ pendingReceipt: null }),

  /**
   * Confirm & save a transaction (from validation screen).
   */
  confirmTransaction: async (transactionData) => {
    try {
      const created = await createTransaction(transactionData);
      set((s) => ({
        transactions: [created, ...s.transactions],
        pendingReceipt: null,
      }));
      return created;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useTransactionStore;

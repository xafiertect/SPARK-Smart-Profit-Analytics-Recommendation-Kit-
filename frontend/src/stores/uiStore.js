import { create } from 'zustand';

const useUiStore = create((set) => ({
  isLoading: false,
  scanStatus: 'idle', // idle | scanning | parsed | error
  activeModal: null,
  apiError: null, // global error message

  setLoading: (v) => set({ isLoading: v }),
  setScanStatus: (status) => set({ scanStatus: status }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  setApiError: (msg) => set({ apiError: msg }),
  clearApiError: () => set({ apiError: null }),
}));

export default useUiStore;

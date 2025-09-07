import { create } from 'zustand'
import type { Transaction } from '@/types'

interface TransactionState {
  selectedTransactions: string[]
  isAddingTransaction: boolean
  editingTransaction: Transaction | null
  
  selectTransaction: (id: string) => void
  deselectTransaction: (id: string) => void
  toggleTransaction: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setIsAddingTransaction: (isAdding: boolean) => void
  setEditingTransaction: (transaction: Transaction | null) => void
}

export const useTransactionStore = create<TransactionState>((set) => ({
  selectedTransactions: [],
  isAddingTransaction: false,
  editingTransaction: null,
  
  selectTransaction: (id) =>
    set((state) => ({
      selectedTransactions: [...state.selectedTransactions, id],
    })),
  
  deselectTransaction: (id) =>
    set((state) => ({
      selectedTransactions: state.selectedTransactions.filter((tid) => tid !== id),
    })),
  
  toggleTransaction: (id) =>
    set((state) => ({
      selectedTransactions: state.selectedTransactions.includes(id)
        ? state.selectedTransactions.filter((tid) => tid !== id)
        : [...state.selectedTransactions, id],
    })),
  
  selectAll: (ids) => set({ selectedTransactions: ids }),
  
  clearSelection: () => set({ selectedTransactions: [] }),
  
  setIsAddingTransaction: (isAddingTransaction) => set({ isAddingTransaction }),
  
  setEditingTransaction: (editingTransaction) => set({ editingTransaction }),
}))
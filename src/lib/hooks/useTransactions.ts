import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getTransactionsByDateRange,
  searchTransactions
} from '../db'
import type { Transaction } from '@/types'

export function useTransactions(dateRange?: { start: Date; end: Date }) {
  const start = dateRange?.start || startOfMonth(new Date())
  const end = dateRange?.end || endOfMonth(new Date())
  
  return useQuery({
    queryKey: ['transactions', format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')],
    queryFn: () => getTransactionsByDateRange(
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd')
    ),
  })
}

export function useSearchTransactions(query: string) {
  return useQuery({
    queryKey: ['transactions', 'search', query],
    queryFn: () => searchTransactions(query),
    enabled: query.length > 0,
  })
}

export function useAddTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncStatus'>) => 
      addTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) =>
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => deleteTransaction(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
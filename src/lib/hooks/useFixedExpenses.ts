import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../db'
import type { FixedExpense, Transaction } from '@/types'
import { nanoid } from 'nanoid'
import { addDays, addMonths, addWeeks, addYears, startOfMonth, setDate } from 'date-fns'

function calculateNextDueDate(dayOfMonth: number, frequency: FixedExpense['frequency'], fromDate?: Date): string {
  const today = fromDate || new Date()
  let nextDate: Date
  
  switch (frequency) {
    case 'weekly':
      nextDate = addWeeks(today, 1)
      break
    case 'monthly':
      const currentMonth = startOfMonth(today)
      const targetDate = setDate(currentMonth, Math.min(dayOfMonth, 31))
      if (targetDate <= today) {
        nextDate = setDate(addMonths(currentMonth, 1), Math.min(dayOfMonth, 31))
      } else {
        nextDate = targetDate
      }
      break
    case 'quarterly':
      nextDate = addMonths(today, 3)
      break
    case 'yearly':
      nextDate = addYears(today, 1)
      break
    default:
      nextDate = today
  }
  
  return nextDate.toISOString().split('T')[0]
}

function updateNextDueDates(expenses: FixedExpense[]): FixedExpense[] {
  const today = new Date()
  return expenses.map(expense => {
    const dueDate = new Date(expense.nextDueDate)
    if (dueDate < today && expense.isActive && !expense.autopay) {
      return {
        ...expense,
        nextDueDate: calculateNextDueDate(expense.dayOfMonth, expense.frequency, today)
      }
    }
    return expense
  })
}

export function useFixedExpenses() {
  const queryClient = useQueryClient()
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['fixedExpenses'],
    queryFn: async () => {
      const all = await db.fixedExpenses.toArray()
      return updateNextDueDates(all)
    }
  })
  
  const addExpense = useMutation({
    mutationFn: async (expense: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const id = nanoid()
      const nextDueDate = calculateNextDueDate(expense.dayOfMonth, expense.frequency)
      
      await db.fixedExpenses.add({
        ...expense,
        id,
        nextDueDate,
        createdAt: now,
        updatedAt: now
      })
      
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] })
    }
  })
  
  const updateExpense = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FixedExpense> }) => {
      const now = new Date().toISOString()
      
      if (updates.dayOfMonth || updates.frequency) {
        const expense = await db.fixedExpenses.get(id)
        if (expense) {
          updates.nextDueDate = calculateNextDueDate(
            updates.dayOfMonth || expense.dayOfMonth,
            updates.frequency || expense.frequency
          )
        }
      }
      
      await db.fixedExpenses.update(id, {
        ...updates,
        updatedAt: now
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] })
    }
  })
  
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      await db.fixedExpenses.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] })
    }
  })
  
  const markAsPaid = useMutation({
    mutationFn: async (expenseId: string) => {
      const expense = await db.fixedExpenses.get(expenseId)
      if (!expense) throw new Error('Expense not found')
      
      // Create transaction
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncStatus'> = {
        amount: expense.amount,
        category: expense.category,
        description: expense.name,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        account: '',
        tags: ['постоянный расход'],
        isRecurring: true,
        recurringId: expense.id,
        attachments: []
      }
      
      const now = new Date().toISOString()
      await db.transactions.add({
        ...transaction,
        id: nanoid(),
        syncStatus: 'local',
        version: 1,
        createdAt: now,
        updatedAt: now
      })
      
      // Update next due date
      const nextDueDate = calculateNextDueDate(
        expense.dayOfMonth,
        expense.frequency,
        new Date(expense.nextDueDate)
      )
      
      await db.fixedExpenses.update(expenseId, {
        lastPaidDate: now.split('T')[0],
        nextDueDate,
        updatedAt: now
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
  
  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      const expense = await db.fixedExpenses.get(id)
      if (!expense) throw new Error('Expense not found')
      
      await db.fixedExpenses.update(id, {
        isActive: !expense.isActive,
        updatedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] })
    }
  })
  
  const calculateFreeCash = (balance: number) => {
    const activeExpenses = expenses.filter(e => e.isActive)
    const monthlyTotal = activeExpenses.reduce((sum, e) => {
      switch (e.frequency) {
        case 'monthly':
          return sum + e.amount
        case 'weekly':
          return sum + (e.amount * 4.33)
        case 'quarterly':
          return sum + (e.amount / 3)
        case 'yearly':
          return sum + (e.amount / 12)
        default:
          return sum
      }
    }, 0)
    
    const criticalExpenses = activeExpenses
      .filter(e => e.priority === 'critical')
      .reduce((sum, e) => {
        switch (e.frequency) {
          case 'monthly':
            return sum + e.amount
          case 'weekly':
            return sum + (e.amount * 4.33)
          case 'quarterly':
            return sum + (e.amount / 3)
          case 'yearly':
            return sum + (e.amount / 12)
          default:
            return sum
        }
      }, 0)
    
    return {
      monthlyExpenses: monthlyTotal,
      criticalExpenses,
      freeCash: balance - monthlyTotal,
      safeToSpend: Math.max(0, balance - monthlyTotal)
    }
  }
  
  const getUpcomingExpenses = (days: number = 7) => {
    const today = new Date()
    const endDate = addDays(today, days)
    
    return expenses.filter(expense => {
      if (!expense.isActive) return false
      const dueDate = new Date(expense.nextDueDate)
      return dueDate >= today && dueDate <= endDate
    }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
  }
  
  const getOverdueExpenses = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return expenses.filter(expense => {
      if (!expense.isActive) return false
      const dueDate = new Date(expense.nextDueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today
    }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
  }
  
  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
    toggleActive,
    calculateFreeCash,
    getUpcomingExpenses,
    getOverdueExpenses
  }
}
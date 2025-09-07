import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../db'
import type { PlannedIncome, Transaction } from '@/types'
import { nanoid } from 'nanoid'
import { addDays, addMonths, addWeeks, startOfMonth, setDate } from 'date-fns'

function calculateNextExpectedDate(income: PlannedIncome): string {
  const today = new Date()
  let nextDate: Date

  switch (income.frequency) {
    case 'once':
      return income.expectedDate
    case 'weekly':
      nextDate = addWeeks(new Date(income.expectedDate), 1)
      break
    case 'biweekly':
      nextDate = addWeeks(new Date(income.expectedDate), 2)
      break
    case 'monthly':
      const currentMonth = startOfMonth(today)
      const dayOfMonth = new Date(income.expectedDate).getDate()
      const targetDate = setDate(currentMonth, Math.min(dayOfMonth, 31))
      if (targetDate <= today) {
        nextDate = setDate(addMonths(currentMonth, 1), Math.min(dayOfMonth, 31))
      } else {
        nextDate = targetDate
      }
      break
    default:
      nextDate = today
  }

  return nextDate.toISOString().split('T')[0]
}

export function usePlannedIncome() {
  const queryClient = useQueryClient()

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['plannedIncome'],
    queryFn: async () => {
      return await db.plannedIncome.toArray()
    }
  })

  const addIncome = useMutation({
    mutationFn: async (income: Omit<PlannedIncome, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const id = nanoid()

      await db.plannedIncome.add({
        ...income,
        id,
        createdAt: now,
        updatedAt: now
      })

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedIncome'] })
    }
  })

  const updateIncome = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PlannedIncome> }) => {
      const now = new Date().toISOString()

      await db.plannedIncome.update(id, {
        ...updates,
        updatedAt: now
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedIncome'] })
    }
  })

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      await db.plannedIncome.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedIncome'] })
    }
  })

  const confirmReceived = useMutation({
    mutationFn: async ({ 
      incomeId, 
      receivedAmount, 
      receivedDate 
    }: { 
      incomeId: string
      receivedAmount: number
      receivedDate?: string 
    }) => {
      const income = await db.plannedIncome.get(incomeId)
      if (!income) throw new Error('Income not found')

      const now = new Date().toISOString()
      const date = receivedDate || now.split('T')[0]

      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncStatus'> = {
        amount: receivedAmount,
        category: 'Доход',
        subcategory: income.source,
        description: income.name,
        date,
        type: 'income',
        account: '',
        tags: ['планируемый доход'],
        isRecurring: income.frequency !== 'once',
        recurringId: income.id,
        attachments: []
      }

      await db.transactions.add({
        ...transaction,
        id: nanoid(),
        syncStatus: 'local',
        version: 1,
        createdAt: now,
        updatedAt: now
      })

      const updates: Partial<PlannedIncome> = {
        isConfirmed: true,
        receivedDate: date,
        receivedAmount,
        updatedAt: now
      }

      if (income.frequency !== 'once') {
        updates.expectedDate = calculateNextExpectedDate(income)
        updates.isConfirmed = false
        updates.receivedDate = undefined
        updates.receivedAmount = undefined
      }

      await db.plannedIncome.update(incomeId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedIncome'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  const getUpcomingIncome = (days: number = 30) => {
    const today = new Date()
    const endDate = addDays(today, days)

    return incomes.filter(income => {
      if (income.isConfirmed && income.frequency === 'once') return false
      const expectedDate = new Date(income.expectedDate)
      return expectedDate >= today && expectedDate <= endDate
    }).sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())
  }

  const getPendingIncome = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return incomes.filter(income => {
      if (income.isConfirmed && income.frequency === 'once') return false
      const expectedDate = new Date(income.expectedDate)
      expectedDate.setHours(0, 0, 0, 0)
      return expectedDate <= today && !income.isConfirmed
    }).sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())
  }

  const calculateExpectedIncome = (days: number = 30) => {
    const upcoming = getUpcomingIncome(days)
    
    const totalExpected = upcoming.reduce((sum, income) => {
      const adjustedAmount = income.amount * (income.probability / 100)
      return sum + adjustedAmount
    }, 0)

    const guaranteedIncome = upcoming
      .filter(income => income.probability === 100)
      .reduce((sum, income) => sum + income.amount, 0)

    const probableIncome = upcoming
      .filter(income => income.probability >= 70)
      .reduce((sum, income) => sum + income.amount * (income.probability / 100), 0)

    return {
      totalExpected,
      guaranteedIncome,
      probableIncome,
      incomeCount: upcoming.length
    }
  }

  const getIncomeBySource = () => {
    const sourceMap = new Map<string, number>()
    
    incomes.forEach(income => {
      const current = sourceMap.get(income.source) || 0
      sourceMap.set(income.source, current + income.amount)
    })

    return Array.from(sourceMap.entries())
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  return {
    incomes,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    confirmReceived,
    getUpcomingIncome,
    getPendingIncome,
    calculateExpectedIncome,
    getIncomeBySource
  }
}
export interface Transaction {
  id: string
  amount: number
  category: string
  subcategory?: string
  description: string
  date: string
  type: 'income' | 'expense' | 'transfer'
  account: string
  tags: string[]
  isRecurring: boolean
  recurringId?: string
  attachments?: string[]
  syncStatus: 'local' | 'synced' | 'pending'
  version: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  budget?: number
  subcategories?: string[]
  isCustom: boolean
  order: number
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'debit' | 'credit' | 'savings'
  balance: number
  currency: string
  color: string
  isArchived: boolean
  order: number
}

export interface RecurringTransaction {
  id: string
  templateId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDate: string
  endDate?: string
  isActive: boolean
  lastProcessed?: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface Settings {
  currency: string
  dateFormat: string
  startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    budgetAlerts: boolean
    recurringReminders: boolean
    dailySummary: boolean
  }
  defaultAccount: string
  autoBackup: boolean
  lastBackup?: string
}

export interface ImportMapping {
  date: string
  amount: string
  description: string
  category?: string
  account?: string
  type?: string
}

export interface ExportOptions {
  format: 'json' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  accounts?: string[]
  categories?: string[]
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  category: string
  dayOfMonth: number
  frequency: 'monthly' | 'weekly' | 'quarterly' | 'yearly'
  isActive: boolean
  lastPaidDate?: string
  nextDueDate: string
  reminder: boolean
  reminderDays: number
  autopay: boolean
  notes?: string
  color: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt: string
}

export interface PlannedIncome {
  id: string
  name: string
  amount: number
  expectedDate: string
  dateUncertainty: number
  frequency: 'once' | 'monthly' | 'biweekly' | 'weekly'
  source: string
  probability: number
  isConfirmed: boolean
  receivedDate?: string
  receivedAmount?: number
  notes?: string
  color: string
  notifications: boolean
  createdAt: string
  updatedAt: string
}
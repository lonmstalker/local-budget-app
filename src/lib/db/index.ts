import { db } from './schema'
import { defaultCategories, defaultAccounts, defaultSettings } from './defaults'
import type { Transaction, Category, Account } from '@/types'
import { nanoid } from 'nanoid'

export { db }

export async function initializeDatabase() {
  try {
    const categoriesCount = await db.categories.count()
    
    if (categoriesCount === 0) {
      await db.categories.bulkAdd(defaultCategories)
    }
    
    const accountsCount = await db.accounts.count()
    
    if (accountsCount === 0) {
      await db.accounts.bulkAdd(defaultAccounts)
    }
    
    const settingsCount = await db.settings.count()
    
    if (settingsCount === 0) {
      await db.settings.add({ ...defaultSettings, id: '1' })
    }
    
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncStatus'>) {
  const now = new Date().toISOString()
  const transaction: Transaction = {
    ...data,
    id: nanoid(),
    syncStatus: 'local',
    version: 1,
    createdAt: now,
    updatedAt: now
  }
  
  const id = await db.transaction('rw', db.transactions, db.accounts, async () => {
    await db.transactions.add(transaction)
    
    if (transaction.type !== 'transfer') {
      const account = await db.accounts.get(transaction.account)
      if (account) {
        const amountChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
        await db.accounts.update(transaction.account, {
          balance: account.balance + amountChange
        })
      }
    }
    
    return transaction.id
  })
  
  return id
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const now = new Date().toISOString()
  
  await db.transaction('rw', db.transactions, db.accounts, async () => {
    const oldTransaction = await db.transactions.get(id)
    if (!oldTransaction) throw new Error('Transaction not found')
    
    await db.transactions.update(id, {
      ...updates,
      updatedAt: now,
      version: oldTransaction.version + 1,
      syncStatus: oldTransaction.syncStatus === 'synced' ? 'pending' : 'local'
    })
    
    if (oldTransaction.type !== 'transfer' && oldTransaction.account) {
      const account = await db.accounts.get(oldTransaction.account)
      if (account) {
        const oldAmount = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount
        const newAmount = updates.amount || oldTransaction.amount
        const newType = updates.type || oldTransaction.type
        const newAmountChange = newType === 'income' ? newAmount : -newAmount
        
        await db.accounts.update(oldTransaction.account, {
          balance: account.balance - oldAmount + newAmountChange
        })
      }
    }
  })
}

export async function deleteTransaction(id: string) {
  await db.transaction('rw', db.transactions, db.accounts, async () => {
    const transaction = await db.transactions.get(id)
    if (!transaction) return
    
    await db.transactions.delete(id)
    
    if (transaction.type !== 'transfer' && transaction.account) {
      const account = await db.accounts.get(transaction.account)
      if (account) {
        const amountChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
        await db.accounts.update(transaction.account, {
          balance: account.balance + amountChange
        })
      }
    }
  })
}

export async function getTransactionsByDateRange(startDate: string, endDate: string) {
  return db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function getTransactionsByCategory(categoryId: string, startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.transactions
      .where('[date+category]')
      .between([startDate, categoryId], [endDate, categoryId], true, true)
      .toArray()
  }
  
  return db.transactions
    .where('category')
    .equals(categoryId)
    .toArray()
}

export async function searchTransactions(query: string) {
  const lowerQuery = query.toLowerCase()
  return db.transactions
    .filter(tx => 
      tx.description.toLowerCase().includes(lowerQuery) ||
      tx.category.toLowerCase().includes(lowerQuery) ||
      tx.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .toArray()
}

export async function getAccountBalance(accountId: string) {
  const account = await db.accounts.get(accountId)
  return account?.balance || 0
}

export async function getAllAccounts() {
  return db.accounts
    .where('isArchived')
    .equals(0)
    .or('isArchived')
    .equals(false)
    .toArray()
}

export async function getAllCategories() {
  return db.categories.toArray()
}

export async function addCategory(category: Omit<Category, 'id'>) {
  const id = nanoid()
  await db.categories.add({ ...category, id })
  return id
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  await db.categories.update(id, updates)
}

export async function deleteCategory(id: string) {
  const transactionsCount = await db.transactions.where('category').equals(id).count()
  if (transactionsCount > 0) {
    throw new Error('Cannot delete category with existing transactions')
  }
  await db.categories.delete(id)
}

export async function addAccount(account: Omit<Account, 'id'>) {
  const id = nanoid()
  await db.accounts.add({ ...account, id })
  return id
}

export async function updateAccount(id: string, updates: Partial<Account>) {
  await db.accounts.update(id, updates)
}

export async function archiveAccount(id: string) {
  await db.accounts.update(id, { isArchived: true })
}

export async function getSettings() {
  const settings = await db.settings.get('1')
  if (!settings) {
    await db.settings.add({ ...defaultSettings, id: '1' })
    return defaultSettings
  }
  return settings
}

export async function updateSettings(updates: Partial<Omit<Settings, 'id'>>) {
  await db.settings.update('1', updates)
}
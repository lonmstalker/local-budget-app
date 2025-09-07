'use client'

import { useState, useEffect } from 'react'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Filter, Download } from 'lucide-react'
import { useTransactions, useSearchTransactions } from '@/lib/hooks/useTransactions'
import { useTransactionStore } from '@/stores/transactions'
import { startOfMonth, endOfMonth } from 'date-fns'
import type { Transaction } from '@/types'

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  
  const { isAddingTransaction, setIsAddingTransaction, editingTransaction, setEditingTransaction } = useTransactionStore()
  
  const { data: allTransactions = [] } = useTransactions(dateRange)
  const { data: searchResults = [] } = useSearchTransactions(searchQuery)
  
  const transactions = searchQuery ? searchResults : allTransactions
  
  const handleDuplicate = (transaction: Transaction) => {
    const duplicated = {
      ...transaction,
      date: new Date().toISOString().split('T')[0],
    }
    setEditingTransaction(duplicated)
    setIsAddingTransaction(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Операции</h1>
          <p className="text-muted-foreground">
            Управляйте доходами и расходами
          </p>
        </div>
        <Button onClick={() => setIsAddingTransaction(true)}>
          Добавить операцию
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск операций..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>История операций</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={transactions}
            onEdit={(tx) => {
              setEditingTransaction(tx)
              setIsAddingTransaction(true)
            }}
            onDuplicate={handleDuplicate}
          />
        </CardContent>
      </Card>
      
      <Dialog 
        open={isAddingTransaction} 
        onOpenChange={setIsAddingTransaction}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Редактировать операцию' : 'Добавить операцию'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSuccess={() => {
              setIsAddingTransaction(false)
              setEditingTransaction(null)
            }}
            onCancel={() => {
              setIsAddingTransaction(false)
              setEditingTransaction(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
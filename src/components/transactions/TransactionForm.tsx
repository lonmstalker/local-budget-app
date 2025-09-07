'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useAddTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { useQuery } from '@tanstack/react-query'
import { getAllCategories, getAllAccounts } from '@/lib/db'
import { autoDetectCategory, parseAmount, suggestTags } from '@/lib/utils/categories'
import { parseCurrency } from '@/lib/utils/currency'
import type { Transaction } from '@/types'
import { toast } from 'sonner'

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const addTransaction = useAddTransaction()
  const updateTransaction = useUpdateTransaction()
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAllAccounts,
  })
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    category: transaction?.category || '',
    account: transaction?.account || accounts[0]?.id || '',
    type: transaction?.type || 'expense' as 'income' | 'expense',
    date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
    tags: transaction?.tags || [] as string[],
  })
  
  const [quickInput, setQuickInput] = useState('')
  
  useEffect(() => {
    if (accounts.length > 0 && !formData.account) {
      setFormData(prev => ({ ...prev, account: accounts[0].id }))
    }
  }, [accounts, formData.account])
  
  const handleQuickInput = (input: string) => {
    setQuickInput(input)
    const parsed = parseAmount(input)
    
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        amount: parsed.amount.toString(),
        description: parsed.description,
      }))
      
      const detectedCategory = autoDetectCategory(parsed.description)
      if (detectedCategory) {
        const category = categories.find(c => c.name === detectedCategory)
        if (category) {
          setFormData(prev => ({
            ...prev,
            category: category.id,
            type: category.type,
          }))
          
          const suggestedTags = suggestTags(parsed.description, detectedCategory)
          if (suggestedTags.length > 0) {
            setFormData(prev => ({
              ...prev,
              tags: suggestedTags,
            }))
          }
        }
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseCurrency(formData.amount)
    if (amount <= 0) {
      toast.error('Пожалуйста, введите корректную сумму')
      return
    }
    
    if (!formData.category) {
      toast.error('Пожалуйста, выберите категорию')
      return
    }
    
    const data = {
      amount,
      description: formData.description,
      category: formData.category,
      account: formData.account,
      type: formData.type,
      date: formData.date,
      tags: formData.tags,
      isRecurring: false,
    }
    
    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, updates: data })
        toast.success('Операция обновлена')
      } else {
        await addTransaction.mutateAsync(data)
        toast.success('Операция добавлена')
      }
      onSuccess?.()
    } catch (error) {
      toast.error('Не удалось сохранить операцию')
    }
  }
  
  const filteredCategories = categories.filter(c => c.type === formData.type)
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="quick-input">Быстрое добавление</Label>
        <Input
          id="quick-input"
          placeholder="например, кофе 250 или 1500 продукты"
          value={quickInput}
          onChange={(e) => handleQuickInput(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Тип</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'income' | 'expense') => 
              setFormData(prev => ({ ...prev, type: value, category: '' }))
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Расход</SelectItem>
              <SelectItem value="income">Доход</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="amount">Сумма</Label>
          <Input
            id="amount"
            type="text"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          placeholder="На что это?"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Категория</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="account">Счет</Label>
          <Select
            value={formData.account}
            onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}
          >
            <SelectTrigger id="account">
              <SelectValue placeholder="Выберите счет" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="date">Дата</Label>
        <div className="relative">
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {transaction ? 'Обновить' : 'Добавить'} операцию
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  )
}
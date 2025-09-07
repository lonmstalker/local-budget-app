'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useMemo } from 'react'

export function QuickStats() {
  const { data: transactions = [] } = useTransactions({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = income - expenses
    
    const dailyAverage = expenses / new Date().getDate()
    
    return { income, expenses, balance, dailyAverage }
  }, [transactions])
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Доходы</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +{formatCurrency(stats.income)}
          </div>
          <p className="text-xs text-muted-foreground">
            За текущий месяц
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Расходы</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{formatCurrency(stats.expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            За текущий месяц
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(stats.balance))}
          </div>
          <p className="text-xs text-muted-foreground">
            Чистое изменение
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Средний расход</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.dailyAverage)}
          </div>
          <p className="text-xs text-muted-foreground">
            Расход в день
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
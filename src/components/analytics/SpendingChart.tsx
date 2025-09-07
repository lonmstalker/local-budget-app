'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { getTransactionsByDateRange } from '@/lib/db'
import { formatCurrency } from '@/lib/utils/currency'

interface SpendingChartProps {
  dateRange: { start: Date; end: Date }
}

export function SpendingChart({ dateRange }: SpendingChartProps) {
  const months = useMemo(() => {
    const end = dateRange.end
    const start = subMonths(end, 5)
    return eachMonthOfInterval({ start, end })
  }, [dateRange])
  
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', 'chart', format(dateRange.start, 'yyyy-MM'), format(dateRange.end, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(months[0], 'yyyy-MM-dd')
      const end = format(endOfMonth(months[months.length - 1]), 'yyyy-MM-dd')
      return getTransactionsByDateRange(start, end)
    },
  })
  
  const chartData = useMemo(() => {
    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM')
      const monthTransactions = transactions.filter(t => 
        t.date.startsWith(monthStr)
      )
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month: format(month, 'MMM'),
        income,
        expenses,
        net: income - expenses
      }
    })
  }, [months, transactions])
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" name="Income" />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
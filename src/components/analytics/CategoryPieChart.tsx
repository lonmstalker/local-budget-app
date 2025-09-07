'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { getTransactionsByDateRange, getAllCategories } from '@/lib/db'
import { formatCurrency } from '@/lib/utils/currency'

interface CategoryPieChartProps {
  dateRange: { start: Date; end: Date }
  detailed?: boolean
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']

export function CategoryPieChart({ dateRange, detailed = false }: CategoryPieChartProps) {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', 'pie', format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')],
    queryFn: () => getTransactionsByDateRange(
      format(dateRange.start, 'yyyy-MM-dd'),
      format(dateRange.end, 'yyyy-MM-dd')
    ),
  })
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })
  
  const chartData = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0
        }
        acc[transaction.category] += transaction.amount
        return acc
      }, {} as Record<string, number>)
    
    return Object.entries(categoryTotals)
      .map(([categoryId, total]) => {
        const category = categories.find(c => c.id === categoryId)
        return {
          name: category?.name || 'Unknown',
          value: total,
          icon: category?.icon || '📌',
          color: category?.color || '#808080'
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, detailed ? 10 : 5)
  }, [transactions, categories, detailed])
  
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold flex items-center gap-1">
            <span>{data.payload.icon}</span>
            {data.name}
          </p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
      )
    }
    return null
  }
  
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No expense data available</p>
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={detailed ? renderCustomLabel : false}
          outerRadius={detailed ? 120 : 80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value, entry: any) => (
            <span className="flex items-center gap-1">
              <span>{entry.payload.icon}</span>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
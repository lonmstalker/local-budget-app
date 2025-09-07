'use client'

import { usePlannedIncome } from '@/lib/hooks/usePlannedIncome'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyRUB } from '@/lib/utils/formatters'
import { 
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Percent,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function PlannedIncomeWidget() {
  const { 
    incomes,
    calculateExpectedIncome,
    getUpcomingIncome,
    getPendingIncome,
    getIncomeBySource
  } = usePlannedIncome()
  
  const stats30Days = calculateExpectedIncome(30)
  const stats90Days = calculateExpectedIncome(90)
  const pendingIncomes = getPendingIncome()
  const upcomingIncomes = getUpcomingIncome(7)
  const topSources = getIncomeBySource().slice(0, 3)
  
  const confirmedThisMonth = incomes.filter(income => {
    if (!income.isConfirmed || !income.receivedDate) return false
    const receivedDate = new Date(income.receivedDate)
    const now = new Date()
    return receivedDate.getMonth() === now.getMonth() && 
           receivedDate.getFullYear() === now.getFullYear()
  })
  
  const totalConfirmed = confirmedThisMonth.reduce((sum, income) => 
    sum + (income.receivedAmount || income.amount), 0
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Планируемые доходы</CardTitle>
            <CardDescription>Прогноз поступлений</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">30 дней</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrencyRUB(stats30Days.totalExpected)}
            </div>
            <Progress 
              value={stats30Days.guaranteedIncome > 0 ? (stats30Days.guaranteedIncome / stats30Days.totalExpected) * 100 : 0} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              Гарантировано: {formatCurrencyRUB(stats30Days.guaranteedIncome)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">90 дней</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">
              {formatCurrencyRUB(stats90Days.totalExpected)}
            </div>
            <Progress 
              value={stats90Days.probableIncome > 0 ? (stats90Days.probableIncome / stats90Days.totalExpected) * 100 : 0} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              Вероятно: {formatCurrencyRUB(stats90Days.probableIncome)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Ожидается</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{pendingIncomes.length}</span>
              {pendingIncomes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {formatCurrencyRUB(pendingIncomes.reduce((sum, i) => sum + i.amount, 0))}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Предстоящие (7 дней)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{upcomingIncomes.length}</span>
              {upcomingIncomes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {formatCurrencyRUB(upcomingIncomes.reduce((sum, i) => sum + i.amount, 0))}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Получено в этом месяце</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{confirmedThisMonth.length}</span>
              <Badge variant="secondary" className="text-xs text-green-600">
                {formatCurrencyRUB(totalConfirmed)}
              </Badge>
            </div>
          </div>
        </div>

        {topSources.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Основные источники</p>
            <div className="space-y-2">
              {topSources.map(({ source, amount }) => (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{source}</span>
                  <span className="font-medium">{formatCurrencyRUB(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats30Days.incomeCount > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Средняя вероятность</span>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className={cn(
                  "font-medium",
                  stats30Days.guaranteedIncome === stats30Days.totalExpected ? "text-green-600" :
                  stats30Days.probableIncome >= stats30Days.totalExpected * 0.7 ? "text-yellow-600" :
                  "text-orange-600"
                )}>
                  {Math.round((stats30Days.probableIncome / stats30Days.totalExpected) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
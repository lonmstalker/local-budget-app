'use client'

import { useState } from 'react'
import { usePlannedIncome } from '@/lib/hooks/usePlannedIncome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import type { PlannedIncome } from '@/types'

interface PlannedIncomeFormProps {
  income?: PlannedIncome
  onSuccess?: () => void
  onCancel?: () => void
}

const COLORS = [
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b'
]

const SOURCES = [
  'Зарплата', 'Фриланс', 'Инвестиции', 'Дивиденды', 'Аренда',
  'Бизнес', 'Подработка', 'Бонусы', 'Возврат налогов', 'Подарки',
  'Продажа имущества', 'Другое'
]

export function PlannedIncomeForm({ income, onSuccess, onCancel }: PlannedIncomeFormProps) {
  const { addIncome, updateIncome } = usePlannedIncome()
  const [formData, setFormData] = useState({
    name: income?.name || '',
    amount: income?.amount || 0,
    expectedDate: income?.expectedDate || new Date().toISOString().split('T')[0],
    dateUncertainty: income?.dateUncertainty || 0,
    frequency: income?.frequency || 'once' as PlannedIncome['frequency'],
    source: income?.source || SOURCES[0],
    probability: income?.probability || 100,
    notes: income?.notes || '',
    color: income?.color || COLORS[0],
    notifications: income?.notifications !== undefined ? income.notifications : true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.amount <= 0) {
      toast.error('Заполните обязательные поля')
      return
    }

    try {
      if (income) {
        await updateIncome.mutateAsync({
          id: income.id,
          updates: formData
        })
        toast.success('Доход обновлен')
      } else {
        await addIncome.mutateAsync({
          ...formData,
          isConfirmed: false
        })
        toast.success('Доход добавлен')
      }
      onSuccess?.()
    } catch (error) {
      toast.error('Произошла ошибка')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{income ? 'Редактировать доход' : 'Новый планируемый доход'}</CardTitle>
        <CardDescription>
          {income ? 'Измените параметры планируемого дохода' : 'Добавьте ожидаемое поступление средств'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Зарплата за декабрь"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Сумма *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Источник</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Периодичность</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as PlannedIncome['frequency'] })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Разовый</SelectItem>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                  <SelectItem value="biweekly">Раз в 2 недели</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Ожидаемая дата</Label>
              <Input
                id="expectedDate"
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateUncertainty">Погрешность (дней)</Label>
              <Input
                id="dateUncertainty"
                type="number"
                value={formData.dateUncertainty}
                onChange={(e) => setFormData({ ...formData, dateUncertainty: parseInt(e.target.value) || 0 })}
                min="0"
                max="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="probability">
              Вероятность получения: {formData.probability}%
            </Label>
            <Slider
              id="probability"
              value={[formData.probability]}
              onValueChange={(value) => setFormData({ ...formData, probability: value[0] })}
              min={0}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% - Маловероятно</span>
              <span>50% - Возможно</span>
              <span>100% - Гарантировано</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <RadioGroup
              value={formData.color}
              onValueChange={(value) => setFormData({ ...formData, color: value })}
              className="flex gap-2 flex-wrap"
            >
              {COLORS.map((color) => (
                <RadioGroupItem
                  key={color}
                  value={color}
                  id={`planned-color-${color.replace('#', '')}`}
                  className="size-8 rounded-full border-2 border-transparent data-[state=checked]:border-primary"
                  style={{ backgroundColor: color }}
                  aria-label={`Цвет ${color}`}
                />
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Напоминать о приближающихся доходах
              </p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Отмена
              </Button>
            )}
            <Button type="submit" disabled={addIncome.isPending || updateIncome.isPending}>
              {income ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

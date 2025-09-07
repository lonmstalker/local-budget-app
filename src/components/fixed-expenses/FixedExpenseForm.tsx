"use client";

import { useState } from "react";
import { useFixedExpenses } from "@/lib/hooks/useFixedExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { FixedExpense } from "@/types";

interface FixedExpenseFormProps {
  expense?: FixedExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const CATEGORIES = [
  "Жилье",
  "Коммунальные услуги",
  "Интернет и связь",
  "Транспорт",
  "Страхование",
  "Подписки",
  "Кредиты",
  "Образование",
  "Здоровье",
  "Развлечения",
  "Спорт",
  "Другое",
];

export function FixedExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: FixedExpenseFormProps) {
  const { addExpense, updateExpense } = useFixedExpenses();
  const [formData, setFormData] = useState({
    name: expense?.name || "",
    amount: expense?.amount || 0,
    category: expense?.category || CATEGORIES[0],
    dayOfMonth: expense?.dayOfMonth || 1,
    frequency: expense?.frequency || ("monthly" as FixedExpense["frequency"]),
    reminder: expense?.reminder || true,
    reminderDays: expense?.reminderDays || 3,
    autopay: expense?.autopay || false,
    notes: expense?.notes || "",
    color: expense?.color || COLORS[0],
    priority: expense?.priority || ("medium" as FixedExpense["priority"]),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.amount <= 0) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      if (expense) {
        await updateExpense.mutateAsync({
          id: expense.id,
          updates: formData,
        });
        toast.success("Расход обновлен");
      } else {
        await addExpense.mutateAsync({
          ...formData,
          isActive: true,
        });
        toast.success("Расход добавлен");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Произошла ошибка");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expense ? "Редактировать расход" : "Новый постоянный расход"}
        </CardTitle>
        <CardDescription>
          {expense
            ? "Измените параметры постоянного расхода"
            : "Добавьте новый регулярный платеж"}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Например: Квартира"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Сумма *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as FixedExpense["priority"],
                  })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Периодичность</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    frequency: value as FixedExpense["frequency"],
                  })
                }
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                  <SelectItem value="quarterly">Ежеквартально</SelectItem>
                  <SelectItem value="yearly">Ежегодно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">День платежа</Label>
              <Input
                id="dayOfMonth"
                type="number"
                value={formData.dayOfMonth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dayOfMonth: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                max="31"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <RadioGroup
              value={formData.color}
              onValueChange={(value) =>
                setFormData({ ...formData, color: value })
              }
              className="flex gap-2 flex-wrap"
            >
              {COLORS.map((color) => (
                <RadioGroupItem
                  key={color}
                  value={color}
                  id={`fixed-color-${color.replace("#", "")}`}
                  className="size-8 rounded-full border-2 border-transparent data-[state=checked]:border-primary"
                  style={{ backgroundColor: color }}
                  aria-label={`Цвет ${color}`}
                />
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autopay">Автоплатеж</Label>
                <p className="text-sm text-muted-foreground">
                  Платеж выполняется автоматически
                </p>
              </div>
              <Switch
                id="autopay"
                checked={formData.autopay}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autopay: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder">Напоминание</Label>
                <p className="text-sm text-muted-foreground">
                  Напомнить за {formData.reminderDays} дня до платежа
                </p>
              </div>
              <Switch
                id="reminder"
                checked={formData.reminder}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, reminder: checked })
                }
              />
            </div>

            {formData.reminder && (
              <div className="space-y-2">
                <Label htmlFor="reminderDays">Дней до напоминания</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  value={formData.reminderDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminderDays: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="30"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
            <Button
              type="submit"
              disabled={addExpense.isPending || updateExpense.isPending}
            >
              {expense ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

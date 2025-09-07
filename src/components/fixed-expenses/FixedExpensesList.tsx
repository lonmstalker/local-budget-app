"use client";

import { useState } from "react";
import { useFixedExpenses } from "@/lib/hooks/useFixedExpenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrencyRUB, formatDaysUntil } from "@/lib/utils/formatters";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Power,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FixedExpense } from "@/types";

interface FixedExpensesListProps {
  onEdit?: (expense: FixedExpense) => void;
}

export function FixedExpensesList({ onEdit }: FixedExpensesListProps) {
  const {
    expenses,
    markAsPaid,
    toggleActive,
    deleteExpense,
    getOverdueExpenses,
  } = useFixedExpenses();
  const [filter, setFilter] = useState<
    "all" | "active" | "inactive" | "overdue"
  >("all");
  const overdueExpenses = getOverdueExpenses();

  const filteredExpenses = expenses.filter((expense) => {
    switch (filter) {
      case "active":
        return expense.isActive;
      case "inactive":
        return !expense.isActive;
      case "overdue":
        return overdueExpenses.some((e) => e.id === expense.id);
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: FixedExpense["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
    }
  };

  const getFrequencyLabel = (frequency: FixedExpense["frequency"]) => {
    switch (frequency) {
      case "monthly":
        return "Ежемесячно";
      case "weekly":
        return "Еженедельно";
      case "quarterly":
        return "Ежеквартально";
      case "yearly":
        return "Ежегодно";
    }
  };

  const getExpenseStatus = (expense: FixedExpense) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(expense.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (expense.autopay) {
      return { icon: CreditCard, color: "text-blue-500", label: "Автоплатеж" };
    }
    if (dueDate < today) {
      return { icon: AlertCircle, color: "text-red-500", label: "Просрочено" };
    }
    if (dueDate.getTime() === today.getTime()) {
      return { icon: Clock, color: "text-yellow-500", label: "Сегодня" };
    }
    const daysUntil = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil <= 3) {
      return { icon: Clock, color: "text-orange-500", label: "Скоро" };
    }
    return { icon: Calendar, color: "text-gray-500", label: "Запланировано" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Все ({expenses.length})
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Активные ({expenses.filter((e) => e.isActive).length})
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
          >
            Просроченные ({overdueExpenses.length})
          </Button>
          <Button
            variant={filter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("inactive")}
          >
            Неактивные ({expenses.filter((e) => !e.isActive).length})
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredExpenses.map((expense) => {
          const status = getExpenseStatus(expense);
          const StatusIcon = status.icon;

          return (
            <Card
              key={expense.id}
              className={cn(
                "transition-all",
                !expense.isActive && "opacity-60",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-3 h-12 rounded-full",
                          getPriorityColor(expense.priority),
                        )}
                        style={{ backgroundColor: expense.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {expense.name}
                          </h3>
                          <StatusIcon className={cn("h-5 w-5", status.color)} />
                          <Badge variant="outline" className="text-xs">
                            {getFrequencyLabel(expense.frequency)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{expense.category}</span>
                          <span>{formatDaysUntil(expense.nextDueDate)}</span>
                          {expense.lastPaidDate && (
                            <span>
                              Оплачено:{" "}
                              {new Date(
                                expense.lastPaidDate,
                              ).toLocaleDateString("ru-RU")}
                            </span>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrencyRUB(expense.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {status.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={expense.isActive}
                        onCheckedChange={() => toggleActive.mutate(expense.id)}
                        aria-label="Активность"
                      />

                      {!expense.autopay && expense.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid.mutate(expense.id)}
                          disabled={markAsPaid.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Удалить этот постоянный расход?")) {
                            deleteExpense.mutate(expense.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredExpenses.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {filter === "overdue"
                  ? "Нет просроченных платежей"
                  : "Нет постоянных расходов"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

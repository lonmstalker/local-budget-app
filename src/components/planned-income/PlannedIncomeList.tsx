"use client";

import { useState } from "react";
import { usePlannedIncome } from "@/lib/hooks/usePlannedIncome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrencyRUB, formatDaysUntil } from "@/lib/utils/formatters";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PlannedIncome } from "@/types";

interface PlannedIncomeListProps {
  onEdit?: (income: PlannedIncome) => void;
  onConfirm?: (income: PlannedIncome) => void;
}

export function PlannedIncomeList({
  onEdit,
  onConfirm,
}: PlannedIncomeListProps) {
  const { incomes, deleteIncome, getPendingIncome } = usePlannedIncome();
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "upcoming"
  >("all");
  const pendingIncomes = getPendingIncome();

  const filteredIncomes = incomes.filter((income) => {
    switch (filter) {
      case "pending":
        return pendingIncomes.some((p) => p.id === income.id);
      case "confirmed":
        return income.isConfirmed;
      case "upcoming":
        const today = new Date();
        const expectedDate = new Date(income.expectedDate);
        return expectedDate > today && !income.isConfirmed;
      default:
        return true;
    }
  });

  const getFrequencyLabel = (frequency: PlannedIncome["frequency"]) => {
    switch (frequency) {
      case "once":
        return "Разовый";
      case "monthly":
        return "Ежемесячно";
      case "weekly":
        return "Еженедельно";
      case "biweekly":
        return "Раз в 2 недели";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability === 100) return "text-green-600";
    if (probability >= 70) return "text-yellow-600";
    if (probability >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getIncomeStatus = (income: PlannedIncome) => {
    if (income.isConfirmed) {
      return { icon: CheckCircle2, color: "text-green-500", label: "Получено" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedDate = new Date(income.expectedDate);
    expectedDate.setHours(0, 0, 0, 0);

    if (expectedDate < today) {
      return {
        icon: AlertCircle,
        color: "text-yellow-500",
        label: "Ожидается",
      };
    }
    if (expectedDate.getTime() === today.getTime()) {
      return { icon: Clock, color: "text-blue-500", label: "Сегодня" };
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
            Все ({incomes.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Ожидаемые ({pendingIncomes.length})
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            Предстоящие
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("confirmed")}
          >
            Полученные
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredIncomes.map((income) => {
          const status = getIncomeStatus(income);
          const StatusIcon = status.icon;

          return (
            <Card
              key={income.id}
              className={cn(
                "transition-all",
                income.isConfirmed && "opacity-75",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: income.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {income.name}
                          </h3>
                          <StatusIcon className={cn("h-5 w-5", status.color)} />
                          <Badge variant="outline" className="text-xs">
                            {getFrequencyLabel(income.frequency)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{income.source}</span>
                          <span>{formatDaysUntil(income.expectedDate)}</span>
                          {income.dateUncertainty > 0 && (
                            <span>±{income.dateUncertainty} дней</span>
                          )}
                        </div>
                        {income.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {income.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                getProbabilityColor(income.probability),
                              )}
                            >
                              {income.probability}% вероятность
                            </span>
                          </div>
                          {income.probability < 100 && (
                            <Progress
                              value={income.probability}
                              className="w-24 h-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrencyRUB(income.amount)}
                      </div>
                      {income.isConfirmed &&
                        income.receivedAmount &&
                        income.receivedAmount !== income.amount && (
                          <div className="text-sm text-green-600">
                            Получено: {formatCurrencyRUB(income.receivedAmount)}
                          </div>
                        )}
                      {income.probability < 100 && (
                        <div className="text-xs text-muted-foreground">
                          Ожидаемо:{" "}
                          {formatCurrencyRUB(
                            (income.amount * income.probability) / 100,
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!income.isConfirmed && onConfirm && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConfirm(income)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(income)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Удалить этот планируемый доход?")) {
                            deleteIncome.mutate(income.id);
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

        {filteredIncomes.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {filter === "pending"
                  ? "Нет ожидаемых доходов"
                  : "Нет планируемых доходов"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

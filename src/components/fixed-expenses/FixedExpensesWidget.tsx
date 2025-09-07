"use client";

import { useFixedExpenses } from "@/lib/hooks/useFixedExpenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyRUB, formatDaysUntil } from "@/lib/utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  CreditCard,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FixedExpensesWidgetProps {
  currentBalance?: number;
}

export function FixedExpensesWidget({
  currentBalance = 0,
}: FixedExpensesWidgetProps) {
  const {
    expenses,
    calculateFreeCash,
    getUpcomingExpenses,
    getOverdueExpenses,
  } = useFixedExpenses();

  const activeExpenses = expenses.filter((e) => e.isActive);
  const overdueExpenses = getOverdueExpenses();
  const upcomingExpenses = getUpcomingExpenses(7);
  const autopayExpenses = activeExpenses.filter((e) => e.autopay);

  const stats = calculateFreeCash(currentBalance);

  const monthlyTotal = activeExpenses.reduce((sum, e) => {
    switch (e.frequency) {
      case "monthly":
        return sum + e.amount;
      case "weekly":
        return sum + e.amount * 4.33;
      case "quarterly":
        return sum + e.amount / 3;
      case "yearly":
        return sum + e.amount / 12;
      default:
        return sum;
    }
  }, 0);

  const getNextPayment = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextPayments = activeExpenses
      .filter((e) => !e.autopay)
      .sort(
        (a, b) =>
          new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime(),
      );

    return nextPayments[0];
  };

  const nextPayment = getNextPayment();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Постоянные расходы</CardTitle>
            <CardDescription>Управление регулярными платежами</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrencyRUB(monthlyTotal)}
            </div>
            <div className="text-xs text-muted-foreground">в месяц</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Свободные средства
              </span>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <div
              className={cn(
                "text-xl font-bold",
                stats.freeCash >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrencyRUB(stats.freeCash)}
            </div>
            <Progress
              value={
                stats.freeCash > 0 ? (stats.freeCash / currentBalance) * 100 : 0
              }
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Критические</span>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold text-orange-600">
              {formatCurrencyRUB(stats.criticalExpenses)}
            </div>
            <Progress
              value={(stats.criticalExpenses / monthlyTotal) * 100}
              className="h-2"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Просрочено</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{overdueExpenses.length}</span>
              {overdueExpenses.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {formatCurrencyRUB(
                    overdueExpenses.reduce((sum, e) => sum + e.amount, 0),
                  )}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Предстоящие (7 дней)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{upcomingExpenses.length}</span>
              {upcomingExpenses.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {formatCurrencyRUB(
                    upcomingExpenses.reduce((sum, e) => sum + e.amount, 0),
                  )}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Автоплатежи</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{autopayExpenses.length}</span>
              <Badge variant="secondary" className="text-xs">
                {formatCurrencyRUB(
                  autopayExpenses.reduce((sum, e) => sum + e.amount, 0),
                )}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Активные</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{activeExpenses.length}</span>
              <span className="text-muted-foreground">
                из {expenses.length}
              </span>
            </div>
          </div>
        </div>

        {nextPayment && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Следующий платеж</p>
                <p className="text-xs text-muted-foreground">
                  {nextPayment.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {formatCurrencyRUB(nextPayment.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDaysUntil(nextPayment.nextDueDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentBalance > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Рекомендуемый резерв
              </span>
              <span className="font-medium">
                {formatCurrencyRUB(monthlyTotal * 3)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              3 месяца постоянных расходов
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

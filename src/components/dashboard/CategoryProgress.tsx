"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, calculatePercentage } from "@/lib/utils/currency";
import { startOfMonth, endOfMonth } from "date-fns";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/lib/db";
import { useMemo } from "react";

export function CategoryProgress() {
  const { data: transactions = [] } = useTransactions({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const categorySpending = useMemo(() => {
    const spending = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
          }
          acc[transaction.category] += transaction.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(spending)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          category,
          amount,
          budget: category?.budget || 0,
          percentage: category?.budget
            ? calculatePercentage(amount, category.budget)
            : 0,
        };
      })
      .filter((item) => item.category)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ категорий расходов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categorySpending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет расходов в этом месяце
          </p>
        ) : (
          categorySpending.map((item) => (
            <div key={item.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.category?.icon}</span>
                  <span className="font-medium">{item.category?.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.amount)}</p>
                  {item.budget > 0 && (
                    <p className="text-xs text-muted-foreground">
                      из {formatCurrency(item.budget)}
                    </p>
                  )}
                </div>
              </div>
              {item.budget > 0 && (
                <Progress
                  value={Math.min(item.percentage, 100)}
                  className="h-2"
                  indicatorClassName={getProgressColor(item.percentage)}
                />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

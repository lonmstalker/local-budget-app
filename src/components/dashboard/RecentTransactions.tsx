"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/lib/db";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function RecentTransactions() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Последние операции</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">
            Все операции
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет операций</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const category = getCategoryById(transaction.category);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "d MMM, HH:mm", {
                          locale: ru,
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-semibold",
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

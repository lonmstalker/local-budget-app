"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getTransactionsByDateRange } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/currency";

interface TrendsChartProps {
  dateRange: { start: Date; end: Date };
}

export function TrendsChart({ dateRange }: TrendsChartProps) {
  const { data: transactions = [] } = useQuery({
    queryKey: [
      "transactions",
      "trends",
      format(dateRange.start, "yyyy-MM-dd"),
      format(dateRange.end, "yyyy-MM-dd"),
    ],
    queryFn: () =>
      getTransactionsByDateRange(
        format(dateRange.start, "yyyy-MM-dd"),
        format(dateRange.end, "yyyy-MM-dd"),
      ),
  });

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end,
    });

    let cumulativeBalance = 0;
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTransactions = transactions.filter((t) => t.date === dayStr);

      const dayIncome = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpenses = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      cumulativeBalance += dayIncome - dayExpenses;

      return {
        date: format(day, "MMM d"),
        income: dayIncome,
        expenses: dayExpenses,
        balance: cumulativeBalance,
      };
    });
  }, [transactions, dateRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" interval="preserveStartEnd" />
        <YAxis
          className="text-xs"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          name="Income"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          name="Expenses"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          name="Balance"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

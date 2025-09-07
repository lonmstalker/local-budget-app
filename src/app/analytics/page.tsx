"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpendingChart } from "@/components/analytics/SpendingChart";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";
import { TrendsChart } from "@/components/analytics/TrendsChart";
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  const handlePeriodChange = (value: string) => {
    const now = new Date();
    let start, end;

    switch (value) {
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "quarter":
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case "year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    setDateRange({ start, end });
    setPeriod(value as "month" | "quarter" | "year");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Анализ ваших расходов и доходов
          </p>
        </div>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Текущий месяц</SelectItem>
            <SelectItem value="quarter">Последние 3 месяца</SelectItem>
            <SelectItem value="year">Текущий год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Расходы по месяцам</CardTitle>
                <CardDescription>Динамика ваших расходов</CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingChart dateRange={dateRange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>Куда уходят ваши деньги</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryPieChart dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Анализ категорий</CardTitle>
              <CardDescription>
                Подробная разбивка по категориям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryPieChart dateRange={dateRange} detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Тренды расходов</CardTitle>
              <CardDescription>
                Как меняются ваши расходы со временем
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendsChart dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

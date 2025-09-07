"use client";

import { QuickStats } from "@/components/dashboard/QuickStats";
import { CategoryProgress } from "@/components/dashboard/CategoryProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FixedExpensesWidget } from "@/components/fixed-expenses/FixedExpensesWidget";
import { PlannedIncomeWidget } from "@/components/planned-income/PlannedIncomeWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Главная</h1>
        <p className="text-muted-foreground">Обзор ваших финансов</p>
      </div>

      <QuickStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <FixedExpensesWidget currentBalance={50000} />
        <PlannedIncomeWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryProgress />
        <RecentTransactions />
      </div>
    </div>
  );
}

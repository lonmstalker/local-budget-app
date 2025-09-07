"use client";

import { useState } from "react";
import { FixedExpensesList } from "@/components/fixed-expenses/FixedExpensesList";
import { FixedExpenseForm } from "@/components/fixed-expenses/FixedExpenseForm";
import { FixedExpensesWidget } from "@/components/fixed-expenses/FixedExpensesWidget";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { FixedExpense } from "@/types";

export default function FixedExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<
    FixedExpense | undefined
  >();

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Постоянные расходы</h1>
          <p className="text-muted-foreground">
            Управляйте регулярными платежами и подписками
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить расход
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FixedExpensesList onEdit={handleEdit} />
        </div>
        <div>
          <FixedExpensesWidget currentBalance={50000} />
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExpense
                ? "Редактировать расход"
                : "Новый постоянный расход"}
            </DialogTitle>
          </DialogHeader>
          <FixedExpenseForm
            expense={editingExpense}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

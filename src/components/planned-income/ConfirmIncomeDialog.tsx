"use client";

import { useState } from "react";
import { usePlannedIncome } from "@/lib/hooks/usePlannedIncome";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyRUB } from "@/lib/utils/formatters";
import { toast } from "sonner";
import type { PlannedIncome } from "@/types";

interface ConfirmIncomeDialogProps {
  income: PlannedIncome | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmIncomeDialog({
  income,
  open,
  onOpenChange,
}: ConfirmIncomeDialogProps) {
  const { confirmReceived } = usePlannedIncome();
  const [receivedAmount, setReceivedAmount] = useState<number>(
    income?.amount || 0,
  );
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleConfirm = async () => {
    if (!income) return;

    if (receivedAmount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    try {
      await confirmReceived.mutateAsync({
        incomeId: income.id,
        receivedAmount,
        receivedDate,
      });
      toast.success("Доход подтвержден");
      onOpenChange(false);
    } catch (error) {
      toast.error("Произошла ошибка");
    }
  };

  if (!income) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтвердить получение дохода</DialogTitle>
          <DialogDescription>
            Подтвердите получение планируемого дохода "{income.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ожидаемая сумма</Label>
            <div className="text-lg font-semibold">
              {formatCurrencyRUB(income.amount)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAmount">Полученная сумма *</Label>
            <Input
              id="receivedAmount"
              type="number"
              value={receivedAmount}
              onChange={(e) =>
                setReceivedAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
              step="0.01"
            />
            {receivedAmount !== income.amount && receivedAmount > 0 && (
              <p className="text-sm text-muted-foreground">
                Разница: {formatCurrencyRUB(receivedAmount - income.amount)}
                {receivedAmount > income.amount ? (
                  <span className="text-green-600">
                    {" "}
                    (+{((receivedAmount / income.amount - 1) * 100).toFixed(1)}
                    %)
                  </span>
                ) : (
                  <span className="text-red-600">
                    {" "}
                    ({((receivedAmount / income.amount - 1) * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedDate">Дата получения</Label>
            <Input
              id="receivedDate"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
          </div>

          {income.frequency !== "once" && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                После подтверждения будет создана операция дохода и установлена
                следующая дата ожидания согласно периодичности (
                {income.frequency === "monthly"
                  ? "ежемесячно"
                  : income.frequency === "weekly"
                    ? "еженедельно"
                    : "раз в 2 недели"}
                ).
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirmReceived.isPending || receivedAmount <= 0}
          >
            Подтвердить получение
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Trash2, Edit2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils/currency";
import {
  useDeleteTransaction,
  useBulkDeleteTransactions,
} from "@/lib/hooks/useTransactions";
import { useTransactionStore } from "@/stores/transactions";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories, getAllAccounts } from "@/lib/db";
import type { Transaction } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "@/components/ui/checkbox";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDuplicate?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDuplicate,
}: TransactionListProps) {
  const deleteTransaction = useDeleteTransaction();
  const bulkDelete = useBulkDeleteTransactions();
  const {
    selectedTransactions,
    toggleTransaction,
    clearSelection,
    setEditingTransaction,
  } = useTransactionStore();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAllAccounts,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту операцию?")) {
      try {
        await deleteTransaction.mutateAsync(id);
        toast.success("Операция удалена");
      } catch (error) {
        toast.error("Не удалось удалить операцию");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;

    if (
      confirm(
        `Вы уверены, что хотите удалить ${selectedTransactions.length} операций?`,
      )
    ) {
      setIsDeleting(true);
      try {
        await bulkDelete.mutateAsync(selectedTransactions);
        toast.success(`${selectedTransactions.length} операций удалено`);
        clearSelection();
      } catch (error) {
        toast.error("Не удалось удалить операции");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = format(new Date(transaction.date), "d MMMM yyyy", {
        locale: ru,
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, Transaction[]>,
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Операций пока нет</p>
        <p className="text-sm text-muted-foreground mt-2">
          Добавьте первую операцию, чтобы начать
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTransactions.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <p className="text-sm font-medium">
            Выбрано операций: {selectedTransactions.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Очистить
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Удалить
            </Button>
          </div>
        </div>
      )}

      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
          <div className="space-y-1">
            {dayTransactions.map((transaction) => {
              const category = getCategoryById(transaction.category);
              const account = getAccountById(transaction.account);
              const isSelected = selectedTransactions.includes(transaction.id);

              return (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50",
                    isSelected && "bg-accent border-primary",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleTransaction(transaction.id)}
                    aria-label="Выбрать операцию"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {category && (
                        <span className="text-xl">{category.icon}</span>
                      )}
                      <div className="flex-1">
                        <p className="font-medium truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{category?.name}</span>
                          <span>•</span>
                          <span>{account?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingTransaction(transaction);
                          onEdit?.(transaction);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDuplicate?.(transaction)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Дублировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

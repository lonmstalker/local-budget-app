"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { animations } from "@/lib/animations";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Trash2 } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  index: number;
}

const TransactionItem = ({
  transaction,
  onDelete,
  index,
}: TransactionItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(transaction.id), 200);
  };

  return (
    <motion.div
      layout
      layoutId={transaction.id}
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.03,
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          },
        }),
        exit: {
          opacity: 0,
          x: isDeleting ? -300 : 0,
          transition: { duration: 0.2 },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      onDragEnd={(e, { offset }) => {
        if (offset.x < -50) {
          handleDelete();
        }
      }}
      className="relative bg-white rounded-lg p-4 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.p
            className="font-medium text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 + 0.1 }}
          >
            {transaction.description}
          </motion.p>
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 + 0.15 }}
          >
            {transaction.category} •{" "}
            {format(new Date(transaction.date), "dd MMM yyyy")}
          </motion.p>
          {transaction.tags && transaction.tags.length > 0 && (
            <motion.div
              className="flex gap-1 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 + 0.2 }}
            >
              {transaction.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              "text-lg font-semibold",
              transaction.type === "income"
                ? "text-green-600"
                : transaction.type === "expense"
                  ? "text-red-600"
                  : "text-blue-600",
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: index * 0.03 + 0.2,
              type: "spring",
              stiffness: 200,
            }}
          >
            {transaction.type === "income"
              ? "+"
              : transaction.type === "expense"
                ? "-"
                : ""}
            {formatCurrency(Math.abs(transaction.amount))}
          </motion.div>
          <motion.button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-red-500 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDeleting ? 0.8 : 0 }}
        style={{ zIndex: -1 }}
      />
    </motion.div>
  );
};

interface AnimatedTransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const AnimatedTransactionList = ({
  transactions,
  onDelete,
}: AnimatedTransactionListProps) => {
  return (
    <motion.div
      variants={animations.variants.listContainer}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onDelete={onDelete}
            index={index}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

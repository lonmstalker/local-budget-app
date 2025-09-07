"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

interface AnimatedCategoryProgressProps {
  category: string;
  spent: number;
  budget: number;
  icon?: string;
  color?: string;
}

export const AnimatedCategoryProgress = ({
  category,
  spent,
  budget,
  icon,
  color = "blue",
}: AnimatedCategoryProgressProps) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const getProgressColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (percentage > 75) return "bg-yellow-500";
    if (percentage > 50) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <motion.span
              className="text-2xl"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.span>
          )}
          <span className="font-medium text-gray-900">{category}</span>
        </div>
        <motion.span
          className={cn(
            "text-sm font-semibold",
            isOverBudget ? "text-red-600" : "text-gray-600",
          )}
          animate={
            isOverBudget
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            repeat: isOverBudget ? Infinity : 0,
            repeatDelay: 1,
          }}
        >
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </motion.span>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full",
            getProgressColor(),
          )}
          initial={{ width: 0 }}
          animate={{
            width: hasAnimated ? `${percentage}%` : 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
        />

        {isOverBudget && (
          <motion.div
            className="absolute top-0 left-0 h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["200% 0", "-200% 0"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>

      <motion.p
        className="text-xs text-gray-500 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {percentage.toFixed(0)}% используется
      </motion.p>
    </motion.div>
  );
};

interface AnimatedProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  animated?: boolean;
}

export const AnimatedProgressBar = ({
  value,
  max,
  label,
  showPercentage = false,
  color = "blue",
  animated = true,
}: AnimatedProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (animated) {
      setHasAnimated(true);
    }
  }, [animated]);

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full",
            colorClasses[color as keyof typeof colorClasses] ||
              colorClasses.blue,
          )}
          initial={{ width: 0 }}
          animate={{
            width:
              animated && hasAnimated ? `${percentage}%` : `${percentage}%`,
          }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: [0.16, 1, 0.3, 1],
            delay: animated ? 0.2 : 0,
          }}
        />
      </div>
    </div>
  );
};

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface AnimatedSkeletonProps {
  width?: string | number;
  height?: number;
  className?: string;
  variant?: "default" | "circular" | "text";
}

export const AnimatedSkeleton = ({
  width = "100%",
  height = 20,
  className,
  variant = "default",
}: AnimatedSkeletonProps) => {
  const variantClasses = {
    default: "rounded",
    circular: "rounded-full",
    text: "rounded",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-gray-200",
        variantClasses[variant],
        className,
      )}
      style={{
        width: variant === "circular" ? height : width,
        height,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
};

export const TransactionListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <AnimatedSkeleton width={150} height={16} />
              <AnimatedSkeleton width={100} height={12} />
            </div>
            <AnimatedSkeleton width={80} height={20} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <AnimatedSkeleton width={120} height={20} />
        <AnimatedSkeleton width={40} height={40} variant="circular" />
      </div>
      <div className="space-y-3">
        <AnimatedSkeleton width="100%" height={12} />
        <AnimatedSkeleton width="80%" height={12} />
        <AnimatedSkeleton width="60%" height={12} />
      </div>
      <div className="mt-4 flex justify-between">
        <AnimatedSkeleton width={100} height={32} />
        <AnimatedSkeleton width={100} height={32} />
      </div>
    </motion.div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <CardSkeleton />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <AnimatedSkeleton width={200} height={24} className="mb-4" />
        <div className="h-64 relative">
          <AnimatedSkeleton width="100%" height="100%" />
        </div>
      </motion.div>

      <TransactionListSkeleton />
    </div>
  );
};

export const TableSkeleton = ({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-t-lg">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, i) => (
            <AnimatedSkeleton
              key={i}
              width="80%"
              height={16}
              className="mb-2"
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-b-lg">
        {[...Array(rows)].map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="border-b border-gray-100 p-4"
          >
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {[...Array(columns)].map((_, colIndex) => (
                <AnimatedSkeleton
                  key={colIndex}
                  width={colIndex === 0 ? "100%" : "80%"}
                  height={14}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-4"
    >
      <AnimatedSkeleton width={64} height={64} variant="circular" />
      <div className="space-y-2">
        <AnimatedSkeleton width={120} height={20} />
        <AnimatedSkeleton width={180} height={14} />
      </div>
    </motion.div>
  );
};

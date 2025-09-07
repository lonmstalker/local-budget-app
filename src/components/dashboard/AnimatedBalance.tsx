"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

interface AnimatedBalanceProps {
  value: number;
  label?: string;
  showChange?: boolean;
}

export const AnimatedBalance = ({
  value,
  label,
  showChange = true,
}: AnimatedBalanceProps) => {
  const prevValue = useRef(value);
  const motionValue = useMotionValue(prevValue.current);
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    const isIncrease = value > prevValue.current;
    const changed = value !== prevValue.current;

    setIsIncreasing(isIncrease);
    setHasChanged(changed);

    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
      onComplete: () => {
        prevValue.current = value;
        setTimeout(() => setHasChanged(false), 2000);
      },
    });

    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <div className="relative">
      {label && <p className="text-sm text-gray-500 mb-1">{label}</p>}
      <motion.div
        className={cn(
          "text-3xl font-bold transition-colors duration-300",
          hasChanged
            ? isIncreasing
              ? "text-green-600"
              : "text-red-600"
            : "text-gray-900",
        )}
      >
        {formatCurrency(displayValue)}
      </motion.div>

      <AnimatePresence>
        {showChange && hasChanged && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute -right-12 top-1 text-sm font-medium",
              isIncreasing ? "text-green-600" : "text-red-600",
            )}
          >
            {isIncreasing ? "↑" : "↓"}
            {formatCurrency(Math.abs(value - prevValue.current))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 0.5,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest));
      },
      onComplete: () => {
        prevValue.current = value;
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
};

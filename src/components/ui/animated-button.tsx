"use client";

import { motion } from "framer-motion";
import type { ButtonProps } from "./button";
import { animations } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      disabled,
      variant = "default",
      size = "default",
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        variants={animations.variants.button}
        initial="idle"
        whileHover={!disabled ? "hover" : "idle"}
        whileTap={!disabled ? "tap" : "idle"}
        animate={disabled ? "disabled" : "idle"}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

AnimatedButton.displayName = "AnimatedButton";

export const AddTransactionButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0.5)",
          "0 0 0 20px rgba(59, 130, 246, 0)",
        ],
      }}
      transition={{
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
        },
      }}
    >
      <span className="text-2xl">+</span>
    </motion.button>
  );
};

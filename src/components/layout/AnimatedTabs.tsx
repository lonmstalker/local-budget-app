"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export const AnimatedTabs = ({
  tabs,
  defaultTab = 0,
  onChange,
  className,
}: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex border-b border-gray-200 relative">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(index)}
            className={cn(
              "px-4 py-2 relative transition-colors flex items-center gap-2",
              activeTab === index
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            {tab.icon && (
              <motion.span
                animate={{ rotate: activeTab === index ? 360 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {tab.icon}
              </motion.span>
            )}
            <span className="font-medium">{tab.label}</span>

            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pt-4"
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface AnimatedVerticalTabsProps {
  tabs: Tab[];
  defaultTab?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export const AnimatedVerticalTabs = ({
  tabs,
  defaultTab = 0,
  onChange,
  className,
}: AnimatedVerticalTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex flex-col w-48 space-y-1">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(index)}
            className={cn(
              "px-4 py-2 text-left rounded-lg transition-colors flex items-center gap-2 relative",
              activeTab === index
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon && (
              <motion.span
                animate={{ scale: activeTab === index ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {tab.icon}
              </motion.span>
            )}
            <span className="font-medium">{tab.label}</span>

            {activeTab === index && (
              <motion.div
                layoutId="activeVerticalTab"
                className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface AnimatedSegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const AnimatedSegmentedControl = ({
  options,
  value,
  onChange,
  className,
}: AnimatedSegmentedControlProps) => {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div className={cn("inline-flex p-1 bg-gray-100 rounded-lg", className)}>
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors relative z-10",
            value === option.value
              ? "text-white"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          {option.label}
          {value === option.value && (
            <motion.div
              layoutId="activeSegment"
              className="absolute inset-0 bg-blue-600 rounded-md -z-10"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown } from "lucide-react";

interface AnimatedInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export const AnimatedInput = ({
  value,
  onChange,
  error,
  label,
  type = "text",
  placeholder,
  required,
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.label
        className={cn(
          "absolute left-3 transition-all pointer-events-none z-10",
          isFocused || value
            ? "top-0 text-xs bg-white px-1"
            : "top-3 text-gray-500",
        )}
        animate={{
          y: isFocused || value ? -10 : 0,
          scale: isFocused || value ? 0.85 : 1,
          color: error ? "#ef4444" : isFocused ? "#3b82f6" : "#6b7280",
        }}
        transition={{ duration: 0.2 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>

      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? placeholder : ""}
        className={cn(
          "w-full px-3 py-3 border rounded-lg outline-none transition-colors",
          error
            ? "border-red-500"
            : isFocused
              ? "border-blue-500"
              : "border-gray-300",
        )}
        animate={
          error
            ? {
                x: [-10, 10, -10, 10, 0],
              }
            : {}
        }
        transition={{ duration: 0.4 }}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 text-sm mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface AnimatedCategorySelectProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  error?: string;
}

export const AnimatedCategorySelect = ({
  categories,
  selected,
  onSelect,
  placeholder = "Выберите категорию",
  error,
}: AnimatedCategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((c) => c.id === selected);

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-3 border rounded-lg flex items-center justify-between transition-colors",
          error
            ? "border-red-500"
            : isOpen
              ? "border-blue-500"
              : "border-gray-300",
        )}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center gap-2">
          {selectedCategory?.icon && (
            <span className="text-xl">{selectedCategory.icon}</span>
          )}
          <span
            className={cn(selectedCategory ? "text-gray-900" : "text-gray-500")}
          >
            {selectedCategory?.name || placeholder}
          </span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onSelect(category.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left",
                    selected === category.id && "bg-blue-50",
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 5 }}
                >
                  {category.icon && (
                    <span className="text-xl">{category.icon}</span>
                  )}
                  <span className="flex-1">{category.name}</span>
                  {selected === category.id && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 text-sm mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const AnimatedCheckbox = ({
  checked,
  onChange,
  label,
  disabled,
}: AnimatedCheckboxProps) => {
  return (
    <motion.label
      className={cn(
        "flex items-center gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      whileHover={{ x: disabled ? 0 : 5 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          className={cn(
            "w-5 h-5 border-2 rounded transition-colors",
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-gray-300",
          )}
          animate={{
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <motion.path
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <span className="select-none">{label}</span>
    </motion.label>
  );
};

interface AnimatedRadioGroupProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export const AnimatedRadioGroup = ({
  options,
  value,
  onChange,
  name,
}: AnimatedRadioGroupProps) => {
  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <motion.label
          key={option.value}
          className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <motion.div
              className={cn(
                "w-5 h-5 border-2 rounded-full transition-colors",
                value === option.value ? "border-blue-600" : "border-gray-300",
              )}
            >
              <AnimatePresence>
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-2 h-2 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          <span className="select-none">{option.label}</span>
        </motion.label>
      ))}
    </div>
  );
};

interface AnimatedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  rows?: number;
  maxLength?: number;
  error?: string;
}

export const AnimatedTextarea = ({
  value,
  onChange,
  label,
  rows = 4,
  maxLength,
  error,
}: AnimatedTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.label
        className={cn(
          "absolute left-3 transition-all pointer-events-none bg-white px-1 z-10",
          isFocused || value
            ? "top-0 text-xs -translate-y-1/2"
            : "top-3 text-gray-500",
        )}
        animate={{
          scale: isFocused || value ? 0.85 : 1,
          color: error ? "#ef4444" : isFocused ? "#3b82f6" : "#6b7280",
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      <motion.textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "w-full px-3 py-3 border rounded-lg outline-none transition-colors resize-none",
          error
            ? "border-red-500"
            : isFocused
              ? "border-blue-500"
              : "border-gray-300",
        )}
        animate={
          error
            ? {
                x: [-10, 10, -10, 10, 0],
              }
            : {}
        }
        transition={{ duration: 0.4 }}
      />

      {maxLength && (
        <motion.div
          className="text-xs text-gray-500 text-right mt-1"
          animate={{
            color: value.length >= maxLength * 0.9 ? "#ef4444" : "#6b7280",
          }}
        >
          {value.length} / {maxLength}
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 text-sm mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

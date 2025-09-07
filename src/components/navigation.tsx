"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Home,
  Receipt,
  TrendingUp,
  Settings,
  Plus,
  Menu,
  X,
  Wallet,
  DollarSign,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTransactionStore } from "@/stores/transactions";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { animations } from "@/lib/animations";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const { setIsAddingTransaction } = useTransactionStore();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/transactions", label: "Операции", icon: Receipt },
    { href: "/fixed-expenses", label: "Расходы", icon: Wallet },
    { href: "/planned-income", label: "Доходы", icon: DollarSign },
    { href: "/analytics", label: "Аналитика", icon: TrendingUp },
    { href: "/settings", label: "Настройки", icon: Settings },
  ];

  const handleAddTransaction = async () => {
    setIsAddingLoading(true);
    setIsAddingTransaction(true);

    if (pathname !== "/transactions") {
      await router.push("/transactions");
    }

    setTimeout(() => setIsAddingLoading(false), 500);
  };

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <motion.span
                  className="text-2xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  💰
                </motion.span>
                <span className="font-semibold text-lg">Budget Tracker</span>
              </Link>

              <div className="hidden md:flex items-center gap-1 relative">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={item.href} className="relative block">
                        <motion.div
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary",
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}

                          {isActive && (
                            <motion.div
                              layoutId="navIndicator"
                              className="absolute inset-0 bg-secondary rounded-md -z-10"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isDark ? "dark" : "light"}
                variants={animations.variants.themeSwitch}
              >
                {isDark ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.button>

              <motion.button
                onClick={handleAddTransaction}
                disabled={isAddingLoading}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "h-9 px-4",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "relative overflow-hidden",
                )}
                whileHover={{ scale: isAddingLoading ? 1 : 1.05 }}
                whileTap={{ scale: isAddingLoading ? 1 : 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isAddingLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Загрузка...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Добавить</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isAddingLoading && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "md:hidden",
                  "inline-flex items-center justify-center rounded-md",
                  "h-9 w-9",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md mb-1",
                        "text-sm font-medium transition-colors",
                        isActive
                          ? "bg-secondary text-primary"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

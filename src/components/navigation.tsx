'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Receipt, 
  TrendingUp, 
  Settings,
  Plus,
  Menu,
  X,
  Wallet,
  DollarSign
} from 'lucide-react'
import { useState } from 'react'
import { useTransactionStore } from '@/stores/transactions'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { setIsAddingTransaction } = useTransactionStore()
  
  const navItems = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/transactions', label: 'Операции', icon: Receipt },
    { href: '/fixed-expenses', label: 'Расходы', icon: Wallet },
    { href: '/planned-income', label: 'Доходы', icon: DollarSign },
    { href: '/analytics', label: 'Аналитика', icon: TrendingUp },
    { href: '/settings', label: 'Настройки', icon: Settings },
  ]
  
  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="font-semibold text-lg">Budget Tracker</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setIsAddingTransaction(true)
                  if (pathname !== '/transactions') {
                    window.location.href = '/transactions'
                  }
                }}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Добавить</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="container mx-auto px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2 mb-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
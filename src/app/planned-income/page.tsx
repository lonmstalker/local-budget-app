'use client'

import { useState } from 'react'
import { PlannedIncomeList } from '@/components/planned-income/PlannedIncomeList'
import { PlannedIncomeForm } from '@/components/planned-income/PlannedIncomeForm'
import { PlannedIncomeWidget } from '@/components/planned-income/PlannedIncomeWidget'
import { ConfirmIncomeDialog } from '@/components/planned-income/ConfirmIncomeDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { PlannedIncome } from '@/types'

export default function PlannedIncomePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<PlannedIncome | undefined>()
  const [confirmingIncome, setConfirmingIncome] = useState<PlannedIncome | null>(null)

  const handleEdit = (income: PlannedIncome) => {
    setEditingIncome(income)
    setIsFormOpen(true)
  }

  const handleConfirm = (income: PlannedIncome) => {
    setConfirmingIncome(income)
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setEditingIncome(undefined)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingIncome(undefined)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Планируемые доходы</h1>
          <p className="text-muted-foreground">
            Отслеживайте ожидаемые поступления средств
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить доход
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlannedIncomeList 
            onEdit={handleEdit}
            onConfirm={handleConfirm}
          />
        </div>
        <div>
          <PlannedIncomeWidget />
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Редактировать доход' : 'Новый планируемый доход'}
            </DialogTitle>
          </DialogHeader>
          <PlannedIncomeForm 
            income={editingIncome}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <ConfirmIncomeDialog
        income={confirmingIncome}
        open={!!confirmingIncome}
        onOpenChange={(open) => !open && setConfirmingIncome(null)}
      />
    </div>
  )
}
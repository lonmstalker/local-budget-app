'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Upload, Trash2, Database } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings, db } from '@/lib/db'
import { exportData, importData } from '@/lib/utils/export'
import { toast } from 'sonner'
import { currencies } from '@/lib/utils/currency'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [isImporting, setIsImporting] = useState(false)
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })
  
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings updated')
    },
  })
  
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportData(format)
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    try {
      await importData(file)
      queryClient.invalidateQueries()
      toast.success('Data imported successfully')
    } catch (error) {
      toast.error('Failed to import data')
    } finally {
      setIsImporting(false)
    }
  }
  
  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      return
    }
    
    try {
      await db.transactions.clear()
      await db.categories.clear()
      await db.accounts.clear()
      await db.budgets.clear()
      queryClient.invalidateQueries()
      toast.success('All data cleared')
    } catch (error) {
      toast.error('Failed to clear data')
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and data
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings?.currency || 'USD'}
                  onValueChange={(value) => updateSettingsMutation.mutate({ currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        {info.symbol} {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings?.theme || 'system'}
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    updateSettingsMutation.mutate({ theme: value })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="week-start">Week starts on</Label>
                <Select
                  value={settings?.startOfWeek?.toString() || '1'}
                  onValueChange={(value) => 
                    updateSettingsMutation.mutate({ startOfWeek: parseInt(value) as 0 | 1 })
                  }
                >
                  <SelectTrigger id="week-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => handleExport('json')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
              <Button onClick={() => handleExport('csv')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Import data from a file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline" disabled={isImporting} asChild>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import File'}
                    <input
                      id="import-file"
                      type="file"
                      accept=".json,.csv"
                      className="hidden"
                      onChange={handleImport}
                      disabled={isImporting}
                    />
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Supports JSON and CSV files
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Delete all transactions, categories, and accounts
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearData}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={settings?.notifications?.budgetAlerts}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: { ...settings?.notifications, budgetAlerts: checked }
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recurring-reminders">Recurring Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind about recurring transactions
                  </p>
                </div>
                <Switch
                  id="recurring-reminders"
                  checked={settings?.notifications?.recurringReminders}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: { ...settings?.notifications, recurringReminders: checked }
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-summary">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily spending summary
                  </p>
                </div>
                <Switch
                  id="daily-summary"
                  checked={settings?.notifications?.dailySummary}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: { ...settings?.notifications, dailySummary: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Trash2, Database } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, db } from "@/lib/db";
import { exportData, importData } from "@/lib/utils/export";
import { toast } from "sonner";
import { currencies } from "@/lib/utils/currency";
import { useAppStore } from "@/stores/app";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const { theme, setTheme } = useAppStore();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Настройки обновлены");
    },
  });

  const handleExport = async (format: "json" | "csv") => {
    try {
      await exportData(format);
      toast.success(`Данные экспортированы в формате ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Не удалось экспортировать данные");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importData(file);
      queryClient.invalidateQueries();
      toast.success("Данные успешно импортированы");
    } catch (error) {
      toast.error("Не удалось импортировать данные");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.",
      )
    ) {
      return;
    }

    try {
      await db.transactions.clear();
      await db.categories.clear();
      await db.accounts.clear();
      await db.budgets.clear();
      queryClient.invalidateQueries();
      toast.success("Все данные удалены");
    } catch (error) {
      toast.error("Не удалось удалить данные");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Управление настройками и данными
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Основные</TabsTrigger>
          <TabsTrigger value="data">Управление данными</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
              <CardDescription>Настройте параметры приложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={settings?.currency || "USD"}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ currency: value })
                  }
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
                <Label htmlFor="theme">Тема</Label>
                <Select
                  value={theme}
                  onValueChange={(value: "light" | "dark" | "system") => {
                    setTheme(value);
                    updateSettingsMutation.mutate({ theme: value });
                  }}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Светлая</SelectItem>
                    <SelectItem value="dark">Тёмная</SelectItem>
                    <SelectItem value="system">Системная</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="week-start">Начало недели</Label>
                <Select
                  value={settings?.startOfWeek?.toString() || "1"}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({
                      startOfWeek: parseInt(value) as 0 | 1,
                    })
                  }
                >
                  <SelectTrigger id="week-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Воскресенье</SelectItem>
                    <SelectItem value="1">Понедельник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Экспорт данных</CardTitle>
              <CardDescription>
                Скачайте ваши данные в различных форматах
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => handleExport("json")} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Экспорт в JSON
              </Button>
              <Button onClick={() => handleExport("csv")} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Экспорт в CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Импорт данных</CardTitle>
              <CardDescription>Импортируйте данные из файла</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline" disabled={isImporting} asChild>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {isImporting ? "Импорт..." : "Импортировать файл"}
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
                  Поддерживаются файлы JSON и CSV
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Опасная зона</CardTitle>
              <CardDescription>Необратимые действия</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Удалить все данные</p>
                  <p className="text-sm text-muted-foreground">
                    Удалить все транзакции, категории и счета
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearData}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить данные
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Настройте, когда вы хотите получать уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Оповещения о бюджете</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления при приближении к лимитам бюджета
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={settings?.notifications?.budgetAlerts}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: {
                        ...settings?.notifications,
                        budgetAlerts: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recurring-reminders">
                    Повторяющиеся напоминания
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Напоминания о повторяющихся транзакциях
                  </p>
                </div>
                <Switch
                  id="recurring-reminders"
                  checked={settings?.notifications?.recurringReminders}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: {
                        ...settings?.notifications,
                        recurringReminders: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-summary">Ежедневная сводка</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать ежедневную сводку расходов
                  </p>
                </div>
                <Switch
                  id="daily-summary"
                  checked={settings?.notifications?.dailySummary}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({
                      notifications: {
                        ...settings?.notifications,
                        dailySummary: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

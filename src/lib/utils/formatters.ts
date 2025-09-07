import { format as dateFnsFormat } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";

export function formatCurrencyRUB(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatMonth(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "LLLL yyyy", { locale: ruLocale });
}

export function formatShortMonth(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "LLL yyyy", { locale: ruLocale });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return "Сегодня";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Вчера";
  } else if (d.toDateString() === tomorrow.toDateString()) {
    return "Завтра";
  } else {
    return formatDate(d);
  }
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDaysUntil(date: Date | string): string {
  const days = getDaysUntil(date);

  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  if (days === -1) return "Вчера";

  if (days > 0) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `Через ${days} дней`;
    }
    if (lastDigit === 1) {
      return `Через ${days} день`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `Через ${days} дня`;
    }
    return `Через ${days} дней`;
  } else {
    const absDays = Math.abs(days);
    const lastDigit = absDays % 10;
    const lastTwoDigits = absDays % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${absDays} дней назад`;
    }
    if (lastDigit === 1) {
      return `${absDays} день назад`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${absDays} дня назад`;
    }
    return `${absDays} дней назад`;
  }
}

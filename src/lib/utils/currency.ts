import Decimal from "decimal.js";

export const currencies = {
  USD: { symbol: "$", locale: "en-US", code: "USD" },
  EUR: { symbol: "€", locale: "de-DE", code: "EUR" },
  GBP: { symbol: "£", locale: "en-GB", code: "GBP" },
  RUB: { symbol: "₽", locale: "ru-RU", code: "RUB" },
  JPY: { symbol: "¥", locale: "ja-JP", code: "JPY" },
  CNY: { symbol: "¥", locale: "zh-CN", code: "CNY" },
  INR: { symbol: "₹", locale: "en-IN", code: "INR" },
} as const;

export type CurrencyCode = keyof typeof currencies;

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
): string {
  const currencyInfo = currencies[currency];
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency: currencyInfo.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[^0-9.-]/g, "");
  return new Decimal(cleanValue || 0).toNumber();
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return new Decimal(value).div(total).mul(100).toNumber();
}

export function addAmounts(...amounts: number[]): number {
  return amounts.reduce((sum, amount) => {
    return new Decimal(sum).add(amount).toNumber();
  }, 0);
}

export function subtractAmounts(
  minuend: number,
  ...subtrahends: number[]
): number {
  return subtrahends.reduce((result, subtrahend) => {
    return new Decimal(result).sub(subtrahend).toNumber();
  }, minuend);
}

export function multiplyAmount(amount: number, multiplier: number): number {
  return new Decimal(amount).mul(multiplier).toNumber();
}

export function divideAmount(dividend: number, divisor: number): number {
  if (divisor === 0) return 0;
  return new Decimal(dividend).div(divisor).toNumber();
}

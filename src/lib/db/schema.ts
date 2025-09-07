import Dexie, { type Table } from "dexie";
import type {
  Transaction,
  Category,
  Account,
  RecurringTransaction,
  Budget,
  Settings,
  FixedExpense,
  PlannedIncome,
} from "@/types";

export class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  accounts!: Table<Account>;
  recurring!: Table<RecurringTransaction>;
  budgets!: Table<Budget>;
  settings!: Table<Settings>;
  fixedExpenses!: Table<FixedExpense>;
  plannedIncome!: Table<PlannedIncome>;

  constructor() {
    super("BudgetDatabase");

    this.version(1).stores({
      transactions:
        "++id, date, type, category, account, [date+category], [date+account], syncStatus, recurringId",
      categories: "++id, name, type, isCustom",
      accounts: "++id, name, type, isArchived",
      recurring: "++id, templateId, nextDate, isActive",
      budgets: "++id, categoryId, period, isActive",
      settings: "++id",
    });

    this.version(2).stores({
      transactions:
        "++id, date, type, category, account, [date+category], [date+account], syncStatus, recurringId",
      categories: "++id, name, type, isCustom",
      accounts: "++id, name, type, isArchived",
      recurring: "++id, templateId, nextDate, isActive",
      budgets: "++id, categoryId, period, isActive",
      settings: "++id",
      fixedExpenses: "++id, nextDueDate, isActive, priority, category",
      plannedIncome: "++id, expectedDate, isConfirmed, frequency, source",
    });
  }
}

export const db = new BudgetDatabase();

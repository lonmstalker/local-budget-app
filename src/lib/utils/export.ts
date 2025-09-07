import { db } from "../db";
import Papa from "papaparse";
import { format } from "date-fns";
import type { Transaction } from "@/types";

export async function exportData(formatType: "json" | "csv") {
  const transactions = await db.transactions.toArray();
  const categories = await db.categories.toArray();
  const accounts = await db.accounts.toArray();

  if (formatType === "json") {
    const data = {
      transactions,
      categories,
      accounts,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadFile(
      blob,
      `budget_export_${format(new Date(), "yyyy-MM-dd")}.json`,
    );
  } else {
    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.id, c.name]),
    );
    const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

    const csvData = transactions.map((t) => ({
      Date: t.date,
      Type: t.type,
      Amount: t.amount,
      Description: t.description,
      Category: categoryMap[t.category] || t.category,
      Account: accountMap[t.account] || t.account,
      Tags: t.tags.join(", "),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    downloadFile(blob, `budget_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
  }
}

export async function importData(file: File) {
  const text = await file.text();

  if (file.name.endsWith(".json")) {
    const data = JSON.parse(text);

    if (data.transactions) {
      await db.transactions.bulkAdd(data.transactions);
    }

    if (data.categories) {
      for (const category of data.categories) {
        const exists = await db.categories.get(category.id);
        if (!exists) {
          await db.categories.add(category);
        }
      }
    }

    if (data.accounts) {
      for (const account of data.accounts) {
        const exists = await db.accounts.get(account.id);
        if (!exists) {
          await db.accounts.add(account);
        }
      }
    }
  } else if (file.name.endsWith(".csv")) {
    const results = Papa.parse(text, { header: true, skipEmptyLines: true });
    const categories = await db.categories.toArray();
    const accounts = await db.accounts.toArray();

    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.name.toLowerCase(), c.id]),
    );
    const accountMap = Object.fromEntries(
      accounts.map((a) => [a.name.toLowerCase(), a.id]),
    );

    const transactions: Partial<Transaction>[] = results.data.map(
      (row: any) => {
        const categoryId =
          categoryMap[row.Category?.toLowerCase()] || categories[0]?.id;
        const accountId =
          accountMap[row.Account?.toLowerCase()] || accounts[0]?.id;

        return {
          amount: parseFloat(row.Amount) || 0,
          description: row.Description || "",
          category: categoryId,
          account: accountId,
          type: row.Type?.toLowerCase() === "income" ? "income" : "expense",
          date: row.Date || new Date().toISOString().split("T")[0],
          tags: row.Tags
            ? row.Tags.split(",").map((t: string) => t.trim())
            : [],
          isRecurring: false,
          syncStatus: "local",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );

    for (const transaction of transactions) {
      if (transaction.amount && transaction.category && transaction.account) {
        await db.transactions.add(transaction as Transaction);
      }
    }
  }
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

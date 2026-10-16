export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM
  limit: number;
}

export interface Settings {
  currency: string;
}

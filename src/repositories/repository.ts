import type { Category, Transaction, Budget, Settings } from "./types";
import { localStorageAdapter } from "./localStorageAdapter";
import { generateId } from "../utils/id";

const CATEGORIES_KEY = "categories:v1";
const TRANSACTIONS_KEY = "transactions:v1";
const BUDGETS_KEY = "budgets:v1";
const SETTINGS_KEY = "settings:v1";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food & Dining", type: "expense", icon: "restaurant", color: "#f59e0b" },
  { id: "cat-groceries", name: "Groceries", type: "expense", icon: "basket", color: "#10b981" },
  { id: "cat-transport", name: "Transport", type: "expense", icon: "car", color: "#3b82f6" },
  {
    id: "cat-bills",
    name: "Bills & Utilities",
    type: "expense",
    icon: "receipt",
    color: "#ef4444",
  },
  { id: "cat-shopping", name: "Shopping", type: "expense", icon: "bag", color: "#a855f7" },
  { id: "cat-health", name: "Health", type: "expense", icon: "medkit", color: "#06b6d4" },
  {
    id: "cat-entertainment",
    name: "Entertainment",
    type: "expense",
    icon: "film",
    color: "#f97316",
  },
  { id: "cat-education", name: "Education", type: "expense", icon: "school", color: "#84cc16" },
  { id: "cat-income", name: "Income", type: "income", icon: "cash", color: "#22c55e" },
  { id: "cat-other-exp", name: "Other Expense", type: "expense", icon: "wallet", color: "#64748b" },
  {
    id: "cat-other-inc",
    name: "Other Income",
    type: "income",
    icon: "trending-up",
    color: "#16a34a",
  },
];

export class CategoryRepository {
  async getAll(): Promise<Category[]> {
    const categories = localStorageAdapter.get<Category[]>(CATEGORIES_KEY);
    if (categories === null) {
      localStorageAdapter.set(CATEGORIES_KEY, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return categories;
  }

  async getById(id: string): Promise<Category | null> {
    const categories = await this.getAll();
    return categories.find((c) => c.id === id) || null;
  }

  async create(category: Omit<Category, "id">): Promise<Category> {
    const categories = await this.getAll();
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    localStorageAdapter.set(CATEGORIES_KEY, [...categories, newCategory]);
    return newCategory;
  }

  async update(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | null> {
    const categories = await this.getAll();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    localStorageAdapter.set(CATEGORIES_KEY, categories);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const categories = await this.getAll();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;
    localStorageAdapter.set(CATEGORIES_KEY, filtered);
    return true;
  }
}

export class TransactionRepository {
  async getAll(): Promise<Transaction[]> {
    const transactions = localStorageAdapter.get<Transaction[]>(TRANSACTIONS_KEY);
    return transactions || [];
  }

  async getById(id: string): Promise<Transaction | null> {
    const transactions = await this.getAll();
    return transactions.find((t) => t.id === id) || null;
  }

  async getByMonth(month: string): Promise<Transaction[]> {
    const transactions = await this.getAll();
    return transactions.filter((t) => t.date.startsWith(month));
  }

  async create(
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const transactions = await this.getAll();
    localStorageAdapter.set(TRANSACTIONS_KEY, [...transactions, newTransaction]);
    return newTransaction;
  }

  async update(
    id: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>,
  ): Promise<Transaction | null> {
    const transactions = await this.getAll();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const updated: Transaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    transactions[index] = updated;
    localStorageAdapter.set(TRANSACTIONS_KEY, transactions);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const transactions = await this.getAll();
    const filtered = transactions.filter((t) => t.id !== id);
    if (filtered.length === transactions.length) return false;
    localStorageAdapter.set(TRANSACTIONS_KEY, filtered);
    return true;
  }
}

export class BudgetRepository {
  async getAll(): Promise<Budget[]> {
    const budgets = localStorageAdapter.get<Budget[]>(BUDGETS_KEY);
    return budgets || [];
  }

  async getById(id: string): Promise<Budget | null> {
    const budgets = await this.getAll();
    return budgets.find((b) => b.id === id) || null;
  }

  async getByMonth(month: string): Promise<Budget[]> {
    const budgets = await this.getAll();
    return budgets.filter((b) => b.month === month);
  }

  async create(budget: Omit<Budget, "id">): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: generateId(),
    };
    const budgets = await this.getAll();
    localStorageAdapter.set(BUDGETS_KEY, [...budgets, newBudget]);
    return newBudget;
  }

  async update(id: string, updates: Partial<Omit<Budget, "id">>): Promise<Budget | null> {
    const budgets = await this.getAll();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const updated = { ...budgets[index], ...updates };
    budgets[index] = updated;
    localStorageAdapter.set(BUDGETS_KEY, budgets);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const budgets = await this.getAll();
    const filtered = budgets.filter((b) => b.id !== id);
    if (filtered.length === budgets.length) return false;
    localStorageAdapter.set(BUDGETS_KEY, filtered);
    return true;
  }
}

export class SettingsRepository {
  async get(): Promise<Settings> {
    const settings = localStorageAdapter.get<Settings>(SETTINGS_KEY);
    return settings || { currency: "USD" };
  }

  async update(updates: Partial<Settings>): Promise<Settings> {
    const settings = await this.get();
    const updated = { ...settings, ...updates };
    localStorageAdapter.set(SETTINGS_KEY, updated);
    return updated;
  }
}

export const categoryRepository = new CategoryRepository();
export const transactionRepository = new TransactionRepository();
export const budgetRepository = new BudgetRepository();
export const settingsRepository = new SettingsRepository();

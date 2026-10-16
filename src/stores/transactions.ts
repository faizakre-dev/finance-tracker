import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Transaction, Budget } from "../repositories/types";
import { transactionRepository, budgetRepository } from "../repositories/repository";

export const useTransactionsStore = defineStore("transactions", () => {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    loading.value = true;
    try {
      transactions.value = await transactionRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    loading.value = true;
    try {
      transactions.value = await transactionRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function addTransaction(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) {
    const transaction = await transactionRepository.create(data);
    transactions.value.push(transaction);
    return transaction;
  }

  async function updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>,
  ) {
    const transaction = await transactionRepository.update(id, updates);
    if (transaction) {
      const index = transactions.value.findIndex((t: Transaction) => t.id === id);
      if (index !== -1) transactions.value[index] = transaction;
    }
    return transaction;
  }

  async function deleteTransaction(id: string) {
    const success = await transactionRepository.delete(id);
    if (success) {
      transactions.value = transactions.value.filter((t: Transaction) => t.id !== id);
    }
    return success;
  }

  async function getByMonth(month: string) {
    return await transactionRepository.getByMonth(month);
  }

  const totalIncome = computed(() =>
    transactions.value
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
  );

  const totalExpense = computed(() =>
    transactions.value
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
  );

  const balance = computed(() => totalIncome.value - totalExpense.value);

  return {
    transactions,
    loading,
    loaded,
    load,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getByMonth,
    totalIncome,
    totalExpense,
    balance,
  };
});

export const useBudgetsStore = defineStore("budgets", () => {
  const budgets = ref<Budget[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    loading.value = true;
    try {
      budgets.value = await budgetRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    loading.value = true;
    try {
      budgets.value = await budgetRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function addBudget(data: Omit<Budget, "id">) {
    const budget = await budgetRepository.create(data);
    budgets.value.push(budget);
    return budget;
  }

  async function updateBudget(id: string, updates: Partial<Omit<Budget, "id">>) {
    const budget = await budgetRepository.update(id, updates);
    if (budget) {
      const index = budgets.value.findIndex((b: Budget) => b.id === id);
      if (index !== -1) budgets.value[index] = budget;
    }
    return budget;
  }

  async function deleteBudget(id: string) {
    const success = await budgetRepository.delete(id);
    if (success) {
      budgets.value = budgets.value.filter((b: Budget) => b.id !== id);
    }
    return success;
  }

  async function getByMonth(month: string) {
    return await budgetRepository.getByMonth(month);
  }

  return {
    budgets,
    loading,
    loaded,
    load,
    refresh,
    addBudget,
    updateBudget,
    deleteBudget,
    getByMonth,
  };
});

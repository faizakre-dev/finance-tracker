import { describe, it, expect, beforeEach, vi } from "vite-plus/test";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  } as Storage;
}

vi.stubGlobal("localStorage", createMemoryStorage());

const { categoryRepository, transactionRepository, budgetRepository, settingsRepository } =
  await import("./repository");

beforeEach(() => {
  localStorage.clear();
});

describe("CategoryRepository", () => {
  it("seeds default categories on first load", async () => {
    const categories = await categoryRepository.getAll();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.find((c) => c.id === "cat-food")).toBeDefined();
  });

  it("creates, updates and deletes categories", async () => {
    const created = await categoryRepository.create({
      name: "Pets",
      type: "expense",
      icon: "paw",
      color: "#ff0000",
    });
    expect(created.id).toBeTruthy();

    const updated = await categoryRepository.update(created.id, { name: "Pets & Vets" });
    expect(updated?.name).toBe("Pets & Vets");

    const deleted = await categoryRepository.delete(created.id);
    expect(deleted).toBe(true);
    expect(await categoryRepository.getById(created.id)).toBeNull();
  });
});

describe("TransactionRepository", () => {
  it("creates transactions with timestamps and filters by month", async () => {
    const t = await transactionRepository.create({
      type: "expense",
      amount: 42.5,
      categoryId: "cat-food",
      date: "2026-10-05",
    });
    expect(t.id).toBeTruthy();
    expect(t.createdAt).toBe(t.updatedAt);

    await transactionRepository.create({
      type: "expense",
      amount: 10,
      categoryId: "cat-food",
      date: "2026-09-30",
    });

    const october = await transactionRepository.getByMonth("2026-10");
    expect(october).toHaveLength(1);
    expect(october[0].amount).toBe(42.5);
  });

  it("updates and deletes transactions", async () => {
    const t = await transactionRepository.create({
      type: "expense",
      amount: 10,
      categoryId: "cat-food",
      date: "2026-10-01",
    });
    const updated = await transactionRepository.update(t.id, { amount: 25 });
    expect(updated?.amount).toBe(25);

    expect(await transactionRepository.delete(t.id)).toBe(true);
    expect(await transactionRepository.getById(t.id)).toBeNull();
  });
});

describe("BudgetRepository", () => {
  it("stores budgets per month and category", async () => {
    const budget = await budgetRepository.create({
      categoryId: "cat-food",
      month: "2026-10",
      limit: 300,
    });
    const forMonth = await budgetRepository.getByMonth("2026-10");
    expect(forMonth).toHaveLength(1);
    expect(forMonth[0].limit).toBe(300);
    expect(await budgetRepository.getByMonth("2026-11")).toHaveLength(0);

    const updated = await budgetRepository.update(budget.id, { limit: 500 });
    expect(updated?.limit).toBe(500);
    expect(await budgetRepository.delete(budget.id)).toBe(true);
  });
});

describe("SettingsRepository", () => {
  it("returns default currency and updates it", async () => {
    expect((await settingsRepository.get()).currency).toBe("USD");
    await settingsRepository.update({ currency: "EUR" });
    expect((await settingsRepository.get()).currency).toBe("EUR");
  });
});

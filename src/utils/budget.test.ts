import { describe, it, expect } from "vite-plus/test";
import { computeBudgetStatus, sumExpensesByCategory } from "./budget";

describe("computeBudgetStatus", () => {
  it("returns success color below warning threshold", () => {
    const status = computeBudgetStatus(50, 100);
    expect(status.color).toBe("success");
    expect(status.remaining).toBe(50);
    expect(status.progress).toBe(0.5);
    expect(status.isOver).toBe(false);
  });

  it("returns warning color at or above threshold", () => {
    expect(computeBudgetStatus(80, 100).color).toBe("warning");
    expect(computeBudgetStatus(80, 100).isOver).toBe(false);
  });

  it("returns danger color when over limit", () => {
    const status = computeBudgetStatus(120, 100);
    expect(status.color).toBe("danger");
    expect(status.isOver).toBe(true);
    expect(status.remaining).toBe(-20);
    expect(status.progress).toBe(1.2);
  });

  it("handles zero limit without division error", () => {
    const status = computeBudgetStatus(10, 0);
    expect(status.progress).toBe(0);
    expect(status.isOver).toBe(true);
    expect(status.color).toBe("danger");
  });
});

describe("sumExpensesByCategory", () => {
  const transactions = [
    { type: "expense", categoryId: "food", amount: 20, date: "2026-10-05" },
    { type: "expense", categoryId: "food", amount: 30, date: "2026-10-12" },
    { type: "income", categoryId: "salary", amount: 5000, date: "2026-10-01" },
    { type: "expense", categoryId: "transport", amount: 15, date: "2026-10-03" },
    { type: "expense", categoryId: "food", amount: 99, date: "2026-09-30" },
  ];

  it("sums only expenses in the given month", () => {
    const result = sumExpensesByCategory(transactions, "2026-10");
    expect(result.get("food")).toBe(50);
    expect(result.get("transport")).toBe(15);
    expect(result.has("salary")).toBe(false);
  });

  it("returns empty map for month without expenses", () => {
    const result = sumExpensesByCategory(transactions, "2026-11");
    expect(result.size).toBe(0);
  });
});

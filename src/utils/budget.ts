export interface BudgetStatus {
  spent: number;
  limit: number;
  remaining: number;
  progress: number;
  isOver: boolean;
  color: "success" | "warning" | "danger";
}

export function computeBudgetStatus(
  spent: number,
  limit: number,
  warnThreshold = 0.8,
): BudgetStatus {
  const progress = limit > 0 ? spent / limit : 0;
  const isOver = spent > limit;
  let color: BudgetStatus["color"] = "success";
  if (isOver) {
    color = "danger";
  } else if (progress >= warnThreshold) {
    color = "warning";
  }
  return {
    spent,
    limit,
    remaining: limit - spent,
    progress,
    isOver,
    color,
  };
}

export function sumExpensesByCategory(
  transactions: { type: string; categoryId: string; amount: number; date: string }[],
  month: string,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "expense" && t.date.startsWith(month)) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
  }
  return map;
}

import { describe, it, expect } from "vite-plus/test";
import { getCurrentMonth, parseMonth, formatMonth } from "./month";

describe("month utils", () => {
  it("getCurrentMonth returns YYYY-MM", () => {
    expect(getCurrentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });

  it("parseMonth splits year and month", () => {
    expect(parseMonth("2026-07")).toEqual({ year: 2026, month: 7 });
  });

  it("formatMonth returns a human readable label", () => {
    const label = formatMonth("2026-10");
    expect(label).toContain("2026");
    expect(label).toContain("October");
  });
});

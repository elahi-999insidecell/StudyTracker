import { describe, it, expect } from "vitest";
import { getCompletionStats } from "./taskUtils";

describe("getCompletionStats", () => {
  it("calculates task completion statistics correctly", () => {
    const tasks = [
      { id: 1, done: true },
      { id: 2, done: false },
      { id: 3, done: true },
      { id: 4, done: false },
    ];

    expect(getCompletionStats(tasks)).toEqual({
      total: 4,
      completed: 2,
      remaining: 2,
      progress: 50,
    });
  });

  it("returns zero progress when there are no tasks", () => {
    expect(getCompletionStats([])).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      progress: 0,
    });
  });
});
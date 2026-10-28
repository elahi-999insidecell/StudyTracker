import { afterEach, describe, expect, it, vi } from "vitest";
import { getTasks } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getTasks", () => {
  it("returns tasks when the API request succeeds", async () => {
    const mockTasks = [
      { id: 1, title: "Complete SE lab", completed: 0 },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      })
    );

    await expect(getTasks()).resolves.toEqual(mockTasks);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/tasks"
    );
  });

  it("throws an error when the API request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false })
    );

    await expect(getTasks()).rejects.toThrow(
      "Failed to load tasks"
    );
  });
});
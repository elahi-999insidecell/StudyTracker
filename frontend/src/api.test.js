import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getTasks,
  getSubjects,
  createTask,
  updateTask,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

describe("API helpers", () => {
  it("loads tasks successfully", async () => {
    const tasks = [{ id: 1, title: "Complete SE lab" }];
    mockFetch({ ok: true, json: () => Promise.resolve(tasks) });

    await expect(getTasks()).resolves.toEqual(tasks);
  });

  it("throws when loading tasks fails", async () => {
    mockFetch({ ok: false });

    await expect(getTasks()).rejects.toThrow("Failed to load tasks");
  });

  it("loads subjects successfully", async () => {
    const subjects = [{ id: 1, name: "Software Engineering" }];
    mockFetch({ ok: true, json: () => Promise.resolve(subjects) });

    await expect(getSubjects()).resolves.toEqual(subjects);
  });

  it("throws when loading subjects fails", async () => {
    mockFetch({ ok: false });

    await expect(getSubjects()).rejects.toThrow("Failed to load subjects");
  });

  it("creates a task successfully", async () => {
    const task = { id: 1, title: "Complete SE lab" };
    mockFetch({ ok: true, json: () => Promise.resolve(task) });

    await expect(createTask({ title: "Complete SE lab" }))
      .resolves.toEqual(task);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws when task creation fails", async () => {
    mockFetch({ ok: false });

    await expect(createTask({ title: "Complete SE lab" }))
      .rejects.toThrow("Failed to create task");
  });

  it("updates task completion successfully", async () => {
    const task = { id: 1, completed: 1 };
    mockFetch({ ok: true, json: () => Promise.resolve(task) });

    await expect(updateTask(1, true)).resolves.toEqual(task);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/1"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("throws when updating a task fails", async () => {
    mockFetch({ ok: false });

    await expect(updateTask(1, true))
      .rejects.toThrow("Failed to update task");
  });
});
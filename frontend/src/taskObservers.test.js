import { describe, expect, it, vi } from "vitest";
import { DashboardProgressObserver, TaskEventSubject, TaskObserver } from "./taskObservers";

describe("Observer pattern for task updates", () => {
  it("notifies attached observers when task data changes", () => {
    const subject = new TaskEventSubject();
    const observer = { update: vi.fn() };
    const tasks = [{ id: 1, done: true }];

    subject.attach(observer);
    subject.notify(tasks);

    expect(observer.update).toHaveBeenCalledWith(tasks);
  });

  it("stops notifying an observer after detachment", () => {
    const subject = new TaskEventSubject();
    const observer = { update: vi.fn() };
    subject.attach(observer);
    subject.detach(observer);
    subject.notify([]);
    expect(observer.update).not.toHaveBeenCalled();
  });

  it("updates dashboard progress metrics from observed tasks", () => {
    const onProgressUpdate = vi.fn();
    const observer = new DashboardProgressObserver(onProgressUpdate);
    observer.update([{ done: true }, { done: false }]);
    expect(onProgressUpdate).toHaveBeenCalledWith({ total: 2, completed: 1, remaining: 1, progress: 50 });
  });

  it("rejects invalid observers", () => {
    const subject = new TaskEventSubject();
    expect(() => subject.attach({})).toThrow("Observer must implement update(tasks).");
  });

  it("defines the observer update contract", () => {
    expect(() => new TaskObserver().update([])).toThrow(
      "update(tasks) must be implemented by a concrete observer."
    );
  });
});

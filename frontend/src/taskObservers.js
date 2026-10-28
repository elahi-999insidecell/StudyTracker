import { getCompletionStats } from "./taskUtils.js";

/** Observer contract. Concrete observers implement update(tasks). */
export class TaskObserver {
  update(_tasks) {
    throw new Error("update(tasks) must be implemented by a concrete observer.");
  }
}

/** Observer-pattern publisher for task-list changes. */
export class TaskEventSubject {
  constructor() {
    this.observers = new Set();
  }

  attach(observer) {
    if (!observer || typeof observer.update !== "function") {
      throw new TypeError("Observer must implement update(tasks).");
    }
    this.observers.add(observer);
  }

  detach(observer) {
    this.observers.delete(observer);
  }

  notify(tasks) {
    this.observers.forEach((observer) => observer.update(tasks));
  }
}

/** Concrete observer: calculates dashboard completion metrics on task changes. */
export class DashboardProgressObserver extends TaskObserver {
  constructor(onProgressUpdate) {
    super();
    this.onProgressUpdate = onProgressUpdate;
  }

  update(tasks) {
    this.onProgressUpdate(getCompletionStats(tasks));
  }
}

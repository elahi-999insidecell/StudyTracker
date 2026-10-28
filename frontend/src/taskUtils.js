export function getCompletionStats(tasks) {
  const completed = tasks.filter((task) => task.done).length;

  return {
    total: tasks.length,
    completed,
    remaining: tasks.length - completed,
    progress: tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0,
  };
}
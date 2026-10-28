export function validateTaskTitle(title) {
  return typeof title === "string" && title.trim().length > 0;
}
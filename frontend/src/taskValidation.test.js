import { describe, it, expect } from "vitest";
import { validateTaskTitle } from "./taskValidation";

describe("validateTaskTitle", () => {
  it("accepts a valid task title", () => {
    expect(validateTaskTitle("Complete SE lab")).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(validateTaskTitle("")).toBe(false);
  });

  it("rejects a title containing only spaces", () => {
    expect(validateTaskTitle("   ")).toBe(false);
  });
});
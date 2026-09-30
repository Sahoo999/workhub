import { describe, expect, it } from "vitest";

import {
  createLabelSchema,
} from "./labels.schema.js";

describe("createLabelSchema", () => {
  it("accepts a valid label", () => {
    const result =
      createLabelSchema.safeParse({
        name: "Bug",
        color: "#ef4444",
      });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Bug");
      expect(result.data.color).toBe(
        "#ef4444",
      );
    }
  });

  it("accepts a label without a color", () => {
    const result =
      createLabelSchema.safeParse({
        name: "Backend",
      });

    expect(result.success).toBe(true);
  });

  it("trims the label name", () => {
    const result =
      createLabelSchema.safeParse({
        name: "   Bug   ",
      });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe(
        "Bug",
      );
    }
  });

  it("rejects an empty label name", () => {
    const result =
      createLabelSchema.safeParse({
        name: "",
      });

    expect(result.success).toBe(false);
  });

  it("rejects a label name longer than 50 characters", () => {
    const result =
      createLabelSchema.safeParse({
        name: "a".repeat(51),
      });

    expect(result.success).toBe(false);
  });

  it("rejects a color longer than 20 characters", () => {
    const result =
      createLabelSchema.safeParse({
        name: "Bug",
        color: "a".repeat(21),
      });

    expect(result.success).toBe(false);
  });
});
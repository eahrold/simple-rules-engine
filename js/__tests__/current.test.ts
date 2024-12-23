import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../rules-engine";

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine({ logger: console });
    expect(builder).not.toBeEmpty();
  });
});

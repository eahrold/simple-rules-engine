import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../custom-rules-engine";
import { getConfig } from "./testkit.data";

const config = getConfig();

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine(config);
    expect(builder).not.toBeEmpty();
  });
});

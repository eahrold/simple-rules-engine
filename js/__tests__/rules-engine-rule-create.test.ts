import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../rules-engine";
import { actor1, actor2 } from "./testkit.data";

describe("RulesEngine - Rule Create", () => {
  it("Test Rule Create", () => {
    const builder = createRulesEngine({ logger: console });
    const rule = builder.createRule("my-rule", (actor) => actor === actor1);

    expect(rule.handler(actor1)[0]).toBe(true);
    expect(rule.handler(actor1)[1]).toBeNull();
    expect(rule.handler(actor2)[0]).toBe(false);
    expect(rule.handler(actor2)[1]).toBe("Rule my-rule failed validation");
  });
});

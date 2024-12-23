import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../rules-engine";
import { actor1, getConfig } from "./testkit.data";

const config = getConfig();

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const allEngine = createRulesEngine(config).withPermissions(
      ["permission1", "permission2"],
      "ALL"
    );
    const anyEngine = createRulesEngine(config).withPermissions(
      ["permission1", "permission2"],
      "ANY"
    );

    const all = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        permissions: ["permission1", "permission2"],
      },
    };

    const some = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        permissions: ["permission1"],
      },
    };

    expect(allEngine.check(all)).toBeTrue();
    expect(anyEngine.check(all)).toBeTrue();
    expect(allEngine.check(some)).toBeFalse();
    expect(anyEngine.check(some)).toBeTrue();
  });
});

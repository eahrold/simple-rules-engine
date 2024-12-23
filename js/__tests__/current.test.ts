import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../rules-engine";
import { actor1, actor2, actor3, actor4, getConfig } from "./testkit.data";

const config = getConfig();

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine(config);
    expect(builder).not.toBeEmpty();
  });

  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine(config);

    builder.or((b) =>
      b
        .withTenant("tenant1")
        .and((bldr) =>
          bldr
            .withRoles(["role1"])
            .and((nestedBldr) => nestedBldr.withScopes(["read"]))
        )
        .or((bldr) => bldr.withRoles(["role2"]))
    );

    expect(builder.check(actor1)).toBe(true); // Actor1 Matches AND condition
    expect(builder.check(actor2)).toBe(true); // Actor2 Matches OR condition
    expect(
      builder.check({
        account: { ...actor2.account, role: "role1" },
        claims: actor2.claims,
      })
    ).toBe(false); // Fails OR condition

    expect(builder.check(actor3)).toBe(false); // Actor3 Matches neither
    expect(builder.check(actor4)).toBe(true); // Actor4 Matches AND condition
  });
});

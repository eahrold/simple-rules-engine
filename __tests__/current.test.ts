import { describe, it, expect } from "./testkit";
import { accessor1, accessor2, accessor3, accessor4 } from "./testkit.data";
import { createRulesEngine } from "../rules-engine";

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine()
      .withTenant("tenant1")
      .and((bldr) =>
        bldr
          .withRoles(["role1"])
          .and((nestedBldr) => nestedBldr.withScopes(["read"]))
      )
      .or((bldr) => bldr.withRoles(["role2"]));

    expect(builder.check(accessor1)).toBe(true); // Accessor 1 Matches AND condition
    expect(builder.check(accessor2)).toBe(true); // Accessor 2 Matches OR condition
    expect(
      builder.check({
        ...accessor2,
        role: "role1",
      })
    ).toBe(false); // Accessor 2 Fails when not role OR condition
    expect(builder.check(accessor3)).toBe(false); // Accessor 3 Matches neither
    expect(builder.check(accessor4)).toBe(true); // Accessor 4 Matches AND condition
  });
});

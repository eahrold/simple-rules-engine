import { describe, it, expect } from "bun:test";
import { RuleBuilder } from "./rules-engine";

import {
  accessor1,
  accessor2,
  accessor3,
  accessor4,
} from "./__tests__/test.data";

describe("RulesEngine - Current Tests", () => {
  it("should handle multiple AND and OR combinations", () => {
    const builder = RuleBuilder.create()
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

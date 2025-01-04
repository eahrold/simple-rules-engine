import { describe, it, expect } from "bun:test";
import { actor1, actor2, actor3, actor4 } from "./testkit.data";

import { createRulesEngine } from "../custom-rules-engine";

describe("RulesEngine - And Or Testing", () => {
  it("should pass when all AND conditions match", () => {
    const builder = createRulesEngine()
      .withTenant("tenant1")
      .and((bldr) => bldr.withRoles(["role1"]).withScopes(["read"]));

    expect(builder.check(actor1)).toBe(true); // Matches tenant1, role1, and scope "read"
    expect(builder.check(actor2)).toBe(false); // Different tenant
    expect(builder.check(actor3)).toBe(false); // Different role and tenant
  });

  it("Root and nesting ANDS produce same results.", () => {
    const builder1 = createRulesEngine();
    builder1
      .and((bldr) =>
        bldr.withTenant("tenant1").withRoles(["role1"]).withScopes(["read"])
      )
      .or((orBuilder) => orBuilder.withTenant("tenant3"));

    const builder2 = createRulesEngine();
    builder2
      .withTenant("tenant1")
      .withRoles(["role1"])
      .withScopes(["read"])
      .or((orBuilder) => orBuilder.withTenant("tenant3"));

    expect(builder1.check(actor1)).toBe(builder2.check(actor1)); // Matches tenant1, role1, and scope "read"
    expect(builder1.check(actor2)).toBe(builder2.check(actor2)); // Different tenant
    expect(builder1.check(actor3)).toBe(builder2.check(actor3)); // Different role and tenant
  });

  it("should pass when at least one OR condition matches", () => {
    const builder = createRulesEngine();
    builder.or((bldr) =>
      bldr
        .withTenant("tenant1")
        .or((nestedBldr) => nestedBldr.withRoles(["role2"]))
    );

    expect(builder.check(actor1)).toBe(true); // Matches tenant1
    expect(builder.check(actor2)).toBe(true); // Matches role2
    expect(builder.check(actor3)).toBe(false); // Matches neither
  });

  it("should pass when a nested AND condition within OR matches", () => {
    const builder = createRulesEngine();
    builder.or((bldr) =>
      bldr
        .and((nestedBldr) =>
          nestedBldr.withTenant("tenant1").withRoles(["role1"])
        )
        .or((nestedBldr) => nestedBldr.withScopes(["execute"]))
    );

    expect(builder.check(actor1)).toBe(true); // Matches tenant1 and role1
    expect(builder.check(actor3)).toBe(true); // Matches scope "execute"
    expect(builder.check(actor2)).toBe(false); // Matches neither
  });

  it("should handle multiple AND and OR combinations", () => {
    const builder = createRulesEngine();

    builder.or((b) =>
      b
        .withTenant("tenant1")
        .and(
          (bldr) => bldr.withRoles(["role1"])
          // .and((nestedBldr) => nestedBldr.withScopes(["read"]))
        )
        .or((bldr) => bldr.withRoles(["role2"]))
    );

    expect(builder.check(actor1)).toBe(true); // Matches AND condition
    expect(builder.check(actor2)).toBe(true); // Matches OR condition
    expect(
      builder.check({
        account: { ...actor2.account, role: "role1" },
        claims: actor2.claims,
      })
    ).toBe(false); // Fails OR condition

    expect(builder.check(actor3)).toBe(false); // Matches neither
    expect(builder.check(actor4)).toBe(true); // Matches AND condition
  });

  it("should pass when a nested OR condition within AND matches", () => {
    const builder = createRulesEngine()
      .withTenant("tenant1")
      .and((bldr) => bldr.withRoles(["role1"]))
      .or((bldr) => {
        bldr.withScopes(["execute"]).withRoles(["role1"]);
      });

    expect(builder.check(actor1)).toBe(true); // Accessor 1 - Matches role1 and tenant1
    expect(builder.check(actor3)).toBe(false); // Accessor 3 - Fail Different tenant
    expect(builder.check(actor4)).toBe(true); // Accessor 4 - Matches role1 and tenant1
  });

  it("should pass for all accessors if no rules are defined", () => {
    const builder = createRulesEngine();

    expect(builder.check(actor1)).toBe(true);
    expect(builder.check(actor2)).toBe(true);
    expect(builder.check(actor3)).toBe(true);
  });

  it("should fail when conflicting rules exist in AND", () => {
    const builder = createRulesEngine()
      .withTenant("tenant1")
      .and((bldr) =>
        bldr
          .withRoles(["role1"])
          .and((nestedBldr) => nestedBldr.withScopes(["nonexistent-scope"]))
      );

    expect(builder.check(actor1)).toBe(false); // Conflicting scope
    expect(builder.check(actor4)).toBe(false); // Conflicting scope
  });

  it("should pass if at least one OR condition matches despite conflicts", () => {
    const builder = createRulesEngine().or((bldr) =>
      bldr
        .withTenant("tenant1")
        .or((nestedBldr) =>
          nestedBldr.withScopes(["nonexistent-scope"]).withRoles(["role3"])
        )
    );

    expect(builder.check(actor1)).toBe(true); // Matches tenant1
    expect(builder.check(actor3)).toBe(false); // Conflicting roles and scopes
  });
});

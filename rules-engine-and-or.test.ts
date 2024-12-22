import { describe, it, expect } from "bun:test";
import { createRuleBuilder } from "./rules-engine";

import {
  accessor1,
  accessor2,
  accessor3,
  accessor4,
} from "./__tests__/test.data";

describe("RulesEngine - And Or Testing", () => {
  it("should pass when all AND conditions match", () => {
    const builder = createRuleBuilder()
      .withTenant("tenant1")
      .and((bldr) => bldr.withRoles(["role1"]).withScopes(["read"]));

    expect(builder.check(accessor1)).toBe(true); // Matches tenant1, role1, and scope "read"
    expect(builder.check(accessor2)).toBe(false); // Different tenant
    expect(builder.check(accessor3)).toBe(false); // Different role and tenant
  });

  it("should pass when at least one OR condition matches", () => {
    const builder = createRuleBuilder();
    builder.or((bldr) =>
      bldr
        .withTenant("tenant1")
        .or((nestedBldr) => nestedBldr.withRoles(["role2"]))
    );

    expect(builder.check(accessor1)).toBe(true); // Matches tenant1
    expect(builder.check(accessor2)).toBe(true); // Matches role2
    expect(builder.check(accessor3)).toBe(false); // Matches neither
  });

  it("should pass when a nested AND condition within OR matches", () => {
    const builder = createRuleBuilder();
    builder.or((bldr) =>
      bldr
        .and((nestedBldr) =>
          nestedBldr.withTenant("tenant1").withRoles(["role1"])
        )
        .or((nestedBldr) => nestedBldr.withScopes(["execute"]))
    );

    expect(builder.check(accessor1)).toBe(true); // Matches tenant1 and role1
    expect(builder.check(accessor3)).toBe(true); // Matches scope "execute"
    expect(builder.check(accessor2)).toBe(false); // Matches neither
  });

  it("should handle multiple AND and OR combinations", () => {
    const builder = createRuleBuilder("OR");

    builder
      .withTenant("tenant1")
      .and(
        (bldr) => bldr.withRoles(["role1"])
        // .and((nestedBldr) => nestedBldr.withScopes(["read"]))
      )
      .or((bldr) => bldr.withRoles(["role2"]));

    expect(builder.check(accessor1)).toBe(true); // Matches AND condition
    expect(builder.check(accessor2)).toBe(true); // Matches OR condition
    expect(
      builder.check({
        ...accessor2,
        role: "role1",
      })
    ).toBe(false); // Fails OR condition

    expect(builder.check(accessor3)).toBe(false); // Matches neither
    expect(builder.check(accessor4)).toBe(true); // Matches AND condition
  });

  it("should pass when a nested OR condition within AND matches", () => {
    const builder = createRuleBuilder()
      .withTenant("tenant1")
      .and((bldr) => bldr.withRoles(["role1"]))
      .or((bldr) => {
        bldr.withScopes(["execute"]).withRoles(["role1"]);
      });

    expect(builder.check(accessor1)).toBe(true); // Accessor 1 - Matches role1 and tenant1
    expect(builder.check(accessor3)).toBe(false); // Accessor 3 - Fail Different tenant
    expect(builder.check(accessor4)).toBe(true); // Accessor 4 - Matches role1 and tenant1
  });

  it("should pass for all accessors if no rules are defined", () => {
    const builder = createRuleBuilder();

    expect(builder.check(accessor1)).toBe(true);
    expect(builder.check(accessor2)).toBe(true);
    expect(builder.check(accessor3)).toBe(true);
  });

  it("should fail when conflicting rules exist in AND", () => {
    const builder = createRuleBuilder()
      .withTenant("tenant1")
      .and((bldr) =>
        bldr
          .withRoles(["role1"])
          .and((nestedBldr) => nestedBldr.withScopes(["nonexistent-scope"]))
      );

    expect(builder.check(accessor1)).toBe(false); // Conflicting scope
    expect(builder.check(accessor4)).toBe(false); // Conflicting scope
  });

  it("should pass if at least one OR condition matches despite conflicts", () => {
    const builder = createRuleBuilder().or((bldr) =>
      bldr
        .withTenant("tenant1")
        .or((nestedBldr) =>
          nestedBldr.withScopes(["nonexistent-scope"]).withRoles(["role3"])
        )
    );

    expect(builder.check(accessor1)).toBe(true); // Matches tenant1
    expect(builder.check(accessor3)).toBe(false); // Conflicting roles and scopes
  });
});

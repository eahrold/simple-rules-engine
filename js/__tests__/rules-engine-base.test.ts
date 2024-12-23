import { describe, it, expect } from "./testkit";
import { accessor1 } from "./testkit.data";

import { createRulesEngine } from "../rules-engine";

describe("Rules Engine - Base Test Cases", () => {
  it("should pass for matching tenant", () => {
    const builder = createRulesEngine().withTenant("tenant1");
    expect(builder.check(accessor1)).toBe(true);
  });

  it("should fail for non-matching tenant", () => {
    const builder = createRulesEngine().withTenant("tenant2");
    expect(builder.check(accessor1)).toBe(false);
  });

  it("should pass for matching roles", () => {
    const builder = createRulesEngine().withRoles(["role1", "role2"]);
    expect(builder.check(accessor1)).toBe(true);
  });

  it("should fail for non-matching roles", () => {
    const builder = createRulesEngine().withRoles(["role3"]);
    expect(builder.check(accessor1)).toBe(false);
  });

  it("should pass for matching scopes", () => {
    const builder = createRulesEngine().withScopes(["read", "write"]);
    expect(builder.check(accessor1)).toBe(true);
  });

  it("should fail for non-matching scopes", () => {
    const builder = createRulesEngine().withScopes(["execute"]);
    expect(builder.check(accessor1)).toBe(false);
  });

  it("should pass for matching policies", () => {
    const builder = createRulesEngine().withPolicies(["policy1"]);
    expect(builder.check(accessor1)).toBe(true);
  });

  it("should fail for non-matching policies", () => {
    const builder = createRulesEngine().withPolicies(["policy3"]);
    expect(builder.check(accessor1)).toBe(false);
  });

  it("should pass when all AND conditions match", () => {
    const builder = createRulesEngine()
      .withTenant("tenant1")
      .and((bldr) =>
        bldr
          .withRoles(["role1"])
          .and((nestedBldr) => nestedBldr.withScopes(["read"]))
      );
    expect(builder.check(accessor1)).toBe(true);
  });
});

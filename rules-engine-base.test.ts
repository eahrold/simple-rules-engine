import { describe, beforeEach, it, expect } from "bun:test";
import { createRuleBuilder } from "./rules-engine";
import type { Accessor } from "./types";

describe("RuleBuilder", () => {
  let accessor: Accessor;

  beforeEach(() => {
    accessor = {
      role: "role1",
      scopes: ["read", "write"],
      policies: ["policy1", "policy2"],
      tenantId: "tenant1",
    };
  });

  it("should pass for matching tenant", () => {
    const builder = createRuleBuilder().withTenant("tenant1");
    expect(builder.check(accessor)).toBe(true);
  });

  it("should fail for non-matching tenant", () => {
    const builder = createRuleBuilder().withTenant("tenant2");
    expect(builder.check(accessor)).toBe(false);
  });

  it("should pass for matching roles", () => {
    const builder = createRuleBuilder().withRoles(["role1", "role2"]);
    expect(builder.check(accessor)).toBe(true);
  });

  it("should fail for non-matching roles", () => {
    const builder = createRuleBuilder().withRoles(["role3"]);
    expect(builder.check(accessor)).toBe(false);
  });

  it("should pass for matching scopes", () => {
    const builder = createRuleBuilder().withScopes(["read", "write"]);
    expect(builder.check(accessor)).toBe(true);
  });

  it("should fail for non-matching scopes", () => {
    const builder = createRuleBuilder().withScopes(["execute"]);
    expect(builder.check(accessor)).toBe(false);
  });

  it("should pass for matching policies", () => {
    const builder = createRuleBuilder().withPolicies(["policy1"]);
    expect(builder.check(accessor)).toBe(true);
  });

  it("should fail for non-matching policies", () => {
    const builder = createRuleBuilder().withPolicies(["policy3"]);
    expect(builder.check(accessor)).toBe(false);
  });

  it("should pass when all AND conditions match", () => {
    const builder = createRuleBuilder()
      .withTenant("tenant1")
      .and((bldr) =>
        bldr
          .withRoles(["role1"])
          .and((nestedBldr) => nestedBldr.withScopes(["read"]))
      );
    expect(builder.check(accessor)).toBe(true);
  });
});

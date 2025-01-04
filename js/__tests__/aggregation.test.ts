import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../custom-rules-engine";
import { actor1, getConfig } from "./testkit.data";

const config = getConfig();

describe("RulesEngine - Permission Aggregation", () => {
  it("Handles Permissions Aggregation", () => {
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

    expect(anyEngine.check(all)).toBeTrue();
    expect(anyEngine.check(some)).toBeTrue();
  });
  it("Handles Permissions ALL Aggregation", () => {
    const allEngine = createRulesEngine(config).withPermissions(
      ["permission1", "permission2"],
      "ALL"
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
    expect(allEngine.check(some)).toBeFalse();
  });
});

describe("RulesEngine - Scope Aggregation", () => {
  it("Handle Scope ANY Aggregation", () => {
    const anyEngine = createRulesEngine(config).withScopes(
      ["scope1", "scope2"],
      "ANY"
    );

    const all = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        scopes: ["scope1", "scope2"],
      },
    };

    const some = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        scopes: ["scope1"],
      },
    };

    expect(anyEngine.check(all)).toBeTrue();
    expect(anyEngine.check(some)).toBeTrue();
  });

  it("Handle Scope ALL Aggregation", () => {
    const allEngine = createRulesEngine(config).withScopes(
      ["scope1", "scope2"],
      "ALL"
    );

    const all = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        scopes: ["scope1", "scope2"],
      },
    };

    const some = {
      account: actor1.account,
      claims: {
        ...actor1.claims,
        scopes: ["scope1"],
      },
    };

    expect(allEngine.check(all)).toBeTrue();
    expect(allEngine.check(some)).toBeFalse();
  });
});

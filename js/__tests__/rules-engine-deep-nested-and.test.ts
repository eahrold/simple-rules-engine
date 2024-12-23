import { describe, it, expect } from "bun:test";
import { createRulesEngine } from "../rules-engine";
import { createTestActor, getConfig } from "./testkit.data";

const config = getConfig();

describe("Kitchen Sink", () => {
  const [admin, source] = createTestActor({ account: { role: "admin" } });
  const [overlord] = createTestActor({
    account: { role: "overlord" },
  });

  const [otherTenantAdmin] = createTestActor({
    account: { role: "admin" },
    claims: { tenantId: "otherTenant" },
  });
  const [memberOnly] = createTestActor({
    account: { role: "member" },
  });

  const [memberWithPermissions] = createTestActor({
    account: { role: "member" },
    claims: { permissions: ["manage"] },
  });

  const [otherWithPermissions] = createTestActor({
    account: { role: "other" },
    claims: { permissions: ["manage"] },
  });

  const [otherWithMorePermissions] = createTestActor({
    account: { role: "other" },
    claims: { permissions: ["read", "write"] },
  });

  const suite = [
    { actor: overlord, pass: true, what: "Overlord" },
    { actor: admin, pass: true, what: "Admin" },
    { actor: otherTenantAdmin, pass: false, what: "Not Tenant Admin" },
    {
      actor: memberWithPermissions,
      pass: true,
      what: "Member with insufficient permissions",
    },
    { actor: memberOnly, pass: false, what: "Member Only" },
    {
      actor: otherWithPermissions,
      pass: false,
      what: "Other with insufficient permissions",
    },
    {
      actor: otherWithMorePermissions,
      pass: true,
      what: "Other with sufficcient permissions",
    },
  ];

  const builder = createRulesEngine(config);
  builder
    .withTenant(source.claims.tenantId)
    .and((andBldr) =>
      andBldr
        .withRole("admin")
        .or((orBldr) => {
          return orBldr.withRoles(["member"]).withPermissions(["manage"]);
        })
        .or((orBldr) => {
          return orBldr.withRoles(["other"]).withPermissions(["read", "write"]);
        })
    )
    .or((orb) => orb.withRoles(["overlord"]));

  for (const testCase of suite) {
    it(`${testCase.what} ${testCase.pass ? "Passes" : "Fails"}`, () => {
      it("OR Condition inside of an AND Condition", () => {
        expect(builder.check(testCase.actor)).toBe(testCase.pass);
      });
    });
  }
});

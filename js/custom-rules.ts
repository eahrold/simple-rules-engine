import type { CustomRulesEngineRule } from "./custom-rules-engine-types";
import type { AggregateOperator, RulesEngineRule } from "./rules-engine-types";

export function TenantRule(tenant: string): CustomRulesEngineRule {
  return {
    name: "tenant",
    handler: ({ claims }) => {
      const valid = claims.tenantId === tenant;
      if (valid) return [true, null];
      return [false, `Tenant ${claims.tenantId} does not match ${tenant}`];
    },
  };
}

export function ScopeRule(
  scopes: string[],
  operator: AggregateOperator
): CustomRulesEngineRule {
  return {
    name: "scopes",
    handler: ({ claims }) => {
      const method = operator === "ANY" ? "some" : "every";
      const valid = scopes[method]((p) => {
        return claims.scopes.includes(p);
      });
      if (valid) return [true, null];
      return [false, `claims Scopes ${claims.scopes} did not have  ${scopes}`];
    },
  };
}

export function PermissionRule(
  permissions: string[],
  operator: AggregateOperator = "ALL"
): CustomRulesEngineRule {
  return {
    name: "permissions",
    handler: ({ claims }) => {
      const method = operator === "ANY" ? "some" : "every";
      const valid = permissions[method]((p) => {
        return claims.permissions.includes(p);
      });
      if (valid) return [true, null];
      return [
        false,
        `Claims '${claims.permissions}' did not have ${operator} necessary permissions '${permissions}'`,
      ];
    },
  };
}

export function RoleRule(roles: string[]): CustomRulesEngineRule {
  return {
    name: "role",
    handler: ({ account }) => {
      const valid = roles.includes(account.role);
      if (valid) return [true, null];
      return [false, `Role ${account.role} was not included in ${roles}`];
    },
  };
}

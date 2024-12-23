import type {
  AggregateOperator,
  AuthenticatedActor,
  RulesEngineRule,
} from "./types";

export function TenantRule(tenant: string): RulesEngineRule {
  return {
    name: "tenant",
    handler: ({ claims }: AuthenticatedActor) => {
      const valid = claims.tenantId === tenant;
      if (valid) return [true, null];
      return [false, `Tenant ${claims.tenantId} does not match ${tenant}`];
    },
  };
}

export function ScopeRule(scopes: string[]): RulesEngineRule {
  return {
    name: "scopes",
    handler: ({ claims }: AuthenticatedActor) => {
      const valid = scopes.every((scope) => claims.scopes.includes(scope));
      if (valid) return [true, null];
      return [false, `claims Scopes ${claims.scopes} did not have  ${scopes}`];
    },
  };
}

export function PermissionRule(
  policies: string[],
  operator: AggregateOperator = "ALL"
): RulesEngineRule {
  return {
    name: "permissions",
    handler: ({ claims }: AuthenticatedActor) => {
      const method = operator === "ANY" ? "some" : "every";
      const valid = policies[method]((scope) =>
        claims.permissions.includes(scope)
      );
      if (valid) return [true, null];
      return [
        false,
        `Policy ${claims.permissions} did not have required policies ${policies}`,
      ];
    },
  };
}

export function RoleRule(roles: string[]): RulesEngineRule {
  return {
    name: "role",
    handler: ({ account }: AuthenticatedActor) => {
      const valid = roles.includes(account.role);
      if (valid) return [true, null];
      return [false, `Role ${account.role} was not included in ${roles}`];
    },
  };
}

import type { Accessor, RulesEngineRule } from "./types";

export function ScopeRule(scopes: string[]): RulesEngineRule {
  return {
    name: "scopes",
    test: (accessor: Accessor) => {
      const valid = scopes.every((scope) => accessor.scopes.includes(scope));
      if (valid) return [true, null];
      return [
        false,
        `Accessor Scopes ${accessor.scopes} did not have  ${scopes}`,
      ];
    },
  };
}

export function PolicyRule(policies: string[]): RulesEngineRule {
  return {
    name: "policies",
    test: (accessor: Accessor) => {
      const valid = policies.every((scope) =>
        accessor.policies.includes(scope)
      );
      if (valid) return [true, null];
      return [
        false,
        `Policy ${accessor.policies} did not have required policies ${policies}`,
      ];
    },
  };
}

export function RoleRule(roles: string[]): RulesEngineRule {
  return {
    name: "role",
    test: (accessor: Accessor) => {
      const valid = roles.includes(accessor.role);
      if (valid) return [true, null];
      return [false, `Role ${accessor.role} was not included in ${roles}`];
    },
  };
}

export function TenantRule(tenant: string): RulesEngineRule {
  return {
    name: "tenant",
    test: (accessor: Accessor) => {
      const valid = accessor.tenantId === tenant;
      if (valid) return [true, null];
      return [false, `Tenant ${accessor.tenantId} does not match ${tenant}`];
    },
  };
}

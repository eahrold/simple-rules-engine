export type Accessor = {
  role: string;
  scopes: string[];
  policies: string[];
  tenantId: string;
};

export interface RulesEngine {
  createRule(
    name: string,
    check: (accessor: Accessor) => boolean
  ): RulesEngineRule;

  with(rule: RulesEngineRule): RulesEngine;
  withTenant(tenantId: string): RulesEngine;
  withRoles(roles: string[]): RulesEngine;
  withScopes(scopes: string[]): RulesEngine;
  withPolicies(policies: string[]): RulesEngine;
  and(cb: (builder: RulesEngine) => void): RulesEngine;
  or(cb: (builder: RulesEngine) => void): RulesEngine;
  check(accessor: Accessor, depth?: number): boolean;
}

export type RulesEngineResult = [true, null] | [false, string];

export type RulesEngineRule = {
  name: string;
  handler: (accessor: Accessor) => RulesEngineResult;
};

export type LogicalOperator = "AND" | "OR";
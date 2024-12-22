export type Accessor = {
  role: string;
  scopes: string[];
  policies: string[];
  tenantId: string;
};

export interface RuleBuilder {
  withTenant(tenantId: string): RuleBuilder;
  withRoles(roles: string[]): RuleBuilder;
  withScopes(scopes: string[]): RuleBuilder;
  withPolicies(policies: string[]): RuleBuilder;
  and(cb: (builder: RuleBuilder) => void): RuleBuilder;
  or(cb: (builder: RuleBuilder) => void): RuleBuilder;
  check(accessor: Accessor, depth?: number): boolean;
}

export type RuleResult = [true, null] | [false, string];

export type Rule = {
  name: string;
  test: (accessor: Accessor) => RuleResult;
};

export type LogicalOperator = "AND" | "OR";

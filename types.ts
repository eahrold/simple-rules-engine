export type Accessor = {
  role: string;
  scopes: string[];
  policies: string[];
  tenantId: string;
};

export type RuleResult = [true, null] | [false, string];

export type Rule = {
  name: string;
  test: (accessor: Accessor) => RuleResult;
};

export type LogicalOperator = "AND" | "OR";

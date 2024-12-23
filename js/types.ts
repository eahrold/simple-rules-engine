export type LogicalOperator = "AND" | "OR";
export type AggregateOperator = "ANY" | "ALL";

export type AuthenticatedActor = {
  account: { id: string; role: string };
  claims: TokenClaims;
};
export type TokenClaims = {
  accessorSource: string;
  scopes: string[];
  permissions: string[];
  tenantId: string;
};

export interface RulesEngine {
  createRule(
    name: string,
    check: (actor: AuthenticatedActor) => boolean
  ): RulesEngineRule;

  with(rule: RulesEngineRule): RulesEngine;
  withTenant(tenantId: string): RulesEngine;
  withRoles(roles: string[]): RulesEngine;
  withScopes(scopes: string[], operator?: AggregateOperator): RulesEngine;
  withPermissions(
    policies: string[],
    operator?: AggregateOperator
  ): RulesEngine;
  and(cb: (builder: RulesEngine) => void): RulesEngine;
  or(cb: (builder: RulesEngine) => void): RulesEngine;
  check(actor: AuthenticatedActor, depth?: number): boolean;
}

export type RulesEngineResult = [true, null] | [false, string];

export type RulesEngineRule = {
  name: string;
  handler: (actor: AuthenticatedActor) => RulesEngineResult;
};

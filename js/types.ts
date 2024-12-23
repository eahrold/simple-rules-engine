/**
 * Represents a logical operator used in the rules engine.
 *
 * @example
 * const operator: LogicalOperator = "AND";
 */
export type LogicalOperator = "AND" | "OR";

/**
 * Represents an aggregate operator used in the rules engine.
 *
 * @example
 * const operator: AggregateOperator = "ALL";
 */
export type AggregateOperator = "ANY" | "ALL";

/**
 * Represents an authenticated actor with account details and token claims.
 *
 * @example
 * const actor: AuthenticatedActor = {
 *   account: { id: "123", role: "admin" },
 *   claims: {
 *     accessorSource: "source",
 *     scopes: ["scope1", "scope2"],
 *     permissions: ["perm1", "perm2"],
 *     tenantId: "tenant123"
 *   }
 * };
 */
export type AuthenticatedActor = {
  account: { id: string; role: string };
  claims: TokenClaims;
};

/**
 * Represents the token claims associated with an authenticated actor.
 *
 * @example
 * const claims: TokenClaims = {
 *   accessorSource: "source",
 *   scopes: ["scope1", "scope2"],
 *   permissions: ["perm1", "perm2"],
 *   tenantId: "tenant123"
 * };
 */
export type TokenClaims = {
  accessorSource: string;
  scopes: string[];
  permissions: string[];
  tenantId: string;
};

/**
 * Interface for the rules engine, which allows creating and managing rules.
 *
 * @example
 * const engine: RulesEngine = createRulesEngine();
 * engine.createRule("isAdmin", actor => actor.account.role === "admin");
 */
export interface RulesEngine {
  /**
   * Creates a new rule with the specified name and check function.
   * @param name - The name of the rule.
   * @param check - The function to check if the rule applies to the given actor.
   * @returns The created rule.
   *
   * @example
   * engine.createRule("isAdmin", actor => actor.account.role === "admin");
   */
  createRule(
    name: string,
    check: (actor: AuthenticatedActor) => boolean
  ): RulesEngineRule;

  /**
   * Adds an existing rule to the rules engine.
   * @param rule - The rule to add.
   * @returns The updated rules engine.
   *
   * @example
   * engine.with(existingRule);
   */
  with(rule: RulesEngineRule): RulesEngine;

  /**
   * Sets the tenant ID for the rules engine.
   * @param tenantId - The tenant ID to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withTenant("tenant123");
   */
  withTenant(tenantId: string): RulesEngine;

  /**
   * Sets a role for the rules engine.
   * @param role - The role to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withRole("admin");
   */
  withRole(role: string): RulesEngine;

  /**
   * Sets multiple roles for the rules engine.
   * @param roles - The roles to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withRoles(["admin", "user"]);
   */
  withRoles(roles: string[]): RulesEngine;

  /**
   * Sets scopes for the rules engine with an optional aggregate operator.
   * @param scopes - The scopes to set.
   * @param operator - The aggregate operator to use (default is "ALL").
   * @returns The updated rules engine.
   *
   * @example
   * engine.withScopes(["scope1", "scope2"], "ANY");
   */
  withScopes(scopes: string[], operator?: AggregateOperator): RulesEngine;

  /**
   * Sets permissions for the rules engine with an optional aggregate operator.
   * @param policies - The permissions to set.
   * @param operator - The aggregate operator to use (default is "ALL").
   * @returns The updated rules engine.
   *
   * @example
   * engine.withPermissions(["perm1", "perm2"], "ALL");
   */
  withPermissions(
    policies: string[],
    operator?: AggregateOperator
  ): RulesEngine;

  /**
   * Combines the current rules engine with another set of rules using a logical AND.
   * @param cb - The callback to build the combined rules engine.
   * @returns The updated rules engine.
   *
   * @example
   * engine.and(builder => {
   *   builder.withRole("admin");
   * });
   */
  and(cb: (builder: RulesEngine) => void): RulesEngine;

  /**
   * Combines the current rules engine with another set of rules using a logical OR.
   * @param cb - The callback to build the combined rules engine.
   * @returns The updated rules engine.
   *
   * @example
   * engine.or(builder => {
   *   builder.withRole("user");
   * });
   */
  or(cb: (builder: RulesEngine) => void): RulesEngine;

  /**
   * Checks if the given actor satisfies the rules in the rules engine.
   * @param actor - The actor to check.
   * @param depth - The depth of the check (optional).
   * @returns True if the actor satisfies the rules, otherwise false.
   *
   * @example
   * const result = engine.check(actor);
   */
  check(actor: AuthenticatedActor, depth?: number): boolean;
}

/**
 * Represents the result of a rules engine check.
 *
 * @example
 * const result: RulesEngineResult = [true, null];
 */
export type RulesEngineResult = [true, null] | [false, string];

/**
 * Represents a rule in the rules engine.
 *
 * @example
 * const rule: RulesEngineRule = {
 *   name: "isAdmin",
 *   handler: actor => actor.account.role === "admin" ? [true, null] : [false, "Not an admin"]
 * };
 */
export type RulesEngineRule = {
  name: string;
  handler: (actor: AuthenticatedActor) => RulesEngineResult;
};

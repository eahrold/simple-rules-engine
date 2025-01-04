import type {
  AggregateOperator,
  RulesEngine,
  RulesEngineRule,
} from "./rules-engine-types";

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

export type CustomRulesEngineRule = RulesEngineRule<AuthenticatedActor>;

/**
 * Interface for the rules engine, which allows creating and managing rules.
 *
 * @example
 * const engine: RulesEngine = createRulesEngine();
 * engine.createRule("isAdmin", actor => actor.account.role === "admin");
 */
export interface CustomRulesEngine
  extends RulesEngine<AuthenticatedActor, CustomRulesEngine> {
  /**
   * Sets the tenant ID for the rules engine.
   * @param tenantId - The tenant ID to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withTenant("tenant123");
   */
  withTenant(tenantId: string): CustomRulesEngine;

  /**
   * Sets a role for the rules engine.
   * @param role - The role to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withRole("admin");
   */
  withRole(role: string): CustomRulesEngine;

  /**
   * Sets multiple roles for the rules engine.
   * @param roles - The roles to set.
   * @returns The updated rules engine.
   *
   * @example
   * engine.withRoles(["admin", "user"]);
   */
  withRoles(roles: string[]): CustomRulesEngine;

  /**
   * Sets scopes for the rules engine with an optional aggregate operator.
   * @param scopes - The scopes to set.
   * @param operator - The aggregate operator to use (default is "ALL").
   * @returns The updated rules engine.
   *
   * @example
   * engine.withScopes(["scope1", "scope2"], "ANY");
   */
  withScopes(scopes: string[], operator?: AggregateOperator): CustomRulesEngine;

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
  ): CustomRulesEngine;
}

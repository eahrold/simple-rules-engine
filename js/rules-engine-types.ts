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
 * Interface for the rules engine, which allows creating and managing rules.
 *
 * @example
 * const engine: RulesEngine = createRulesEngine();
 * engine.createRule("isAdmin", actor => actor.account.role === "admin");
 */
export interface RulesEngine<Ctx, Self extends RulesEngine<Ctx, Self>> {
  clone(): Self;

  /**
   * Adds an existing rule to the rules engine.
   * @param rule - The rule to add.
   * @returns The updated rules engine.
   *
   * @example
   * engine.with(existingRule);
   */
  with<Rule extends RulesEngineRule<Ctx>>(rule: Rule): Self;

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
  and(cb: (builder: Self) => void): Self;

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
  or(cb: (builder: Self) => void): Self;

  /**
   * Checks if the given actor satisfies the rules in the rules engine.
   * @param actor - The actor to check.
   * @param depth - The depth of the check (optional).
   * @returns True if the actor satisfies the rules, otherwise false.
   *
   * @example
   * const result = engine.check(actor);
   */
  check(context: Ctx, depth?: number): boolean;
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
export type RulesEngineRule<Ctx> = {
  name: string;
  handler: (actor: Ctx) => RulesEngineResult;
};

export type RulesEngineLogger = {
  debug: (...message: unknown[]) => void;
  info: (...message: unknown[]) => void;
  warn: (...message: unknown[]) => void;
};

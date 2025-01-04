import type {
  RulesEngineRule,
  LogicalOperator,
  RulesEngine,
  RulesEngineLogger,
} from "./rules-engine-types";

export abstract class BaseRulesEngine<
  Ctx,
  Self extends RulesEngine<Ctx, Self>
> {
  protected config: { logger?: RulesEngineLogger };
  protected rules: RulesEngineRule<Ctx>[] = [];
  protected orBuilders: Self[] = [];
  protected andBuilders: Self[] = [];
  protected operator: LogicalOperator;

  constructor(config: { logger?: RulesEngineLogger } = { logger: console }) {
    this.operator = "AND";
    this.config = config;
  }

  abstract self(): Self;

  abstract clone(): Self;

  createRule(
    name: string,
    check: (context: Ctx) => boolean
  ): RulesEngineRule<Ctx> {
    return {
      name,
      handler: (context: Ctx) => {
        const pass = check(context);
        if (pass) return [pass, null];
        return [false, `Rule ${name} failed validation`];
      },
    };
  }

  with(rule: RulesEngineRule<Ctx>): Self {
    this.rules.push(rule);
    return this.self();
  }

  and(subBuilderCallback: (builder: Self) => void): Self {
    const subBuilder = this.clone();
    subBuilderCallback(subBuilder);
    this.andBuilders.push(subBuilder);
    return this.self();
  }

  or(subBuilderCallback: (builder: Self) => void): Self {
    this.operator = "OR";

    const subBuilder = this.clone();
    subBuilderCallback(subBuilder);
    this.orBuilders.push(subBuilder);
    return this.self();
  }

  check(ctx: Ctx, depth = 0): boolean {
    const { operator, rules, andBuilders, orBuilders } = this;
    const orOperatorWithNoRules =
      operator === "OR" && rules.length === 0 && andBuilders.length === 0;

    const andRulesPassed = andBuilders.every((subBuilder) => {
      return subBuilder.check(ctx, depth + 1);
    });

    const selfPass = orOperatorWithNoRules
      ? false
      : rules.every((rule) => {
          return this.eval(ctx, rule, depth);
        }) && andRulesPassed;

    if (operator === "AND") {
      const childrenPass = orBuilders.every((subBuilder) => {
        return subBuilder.check(ctx, depth + 1);
      });
      const valid = selfPass && childrenPass;
      this.dlog(`AND Access ${valid ? "Allowed" : "Denied"}`, {
        selfPass,
        andRulesPassed,
        childrenPass,
        operator,
        depth,
      });
      return valid;
    } else if (operator === "OR") {
      const childrenPass = orBuilders.some((subBuilder) =>
        subBuilder.check(ctx, depth + 1)
      );
      const valid = selfPass || childrenPass;
      this.dlog(`OR Access ${valid ? "Allowed" : "Denied"}`, {
        selfPass,
        andRulesPassed,
        childrenPass,
        operator,
        depth,
      });
      return valid;
    }
    console.assert(false, "Invalid Logical Operator");
    return false;
  }

  private dlog(...message: unknown[]) {
    this.config.logger?.debug(message);
  }

  private eval(context: Ctx, rule: RulesEngineRule<Ctx>, depth = 0): boolean {
    const [success, reason] = rule.handler(context);
    if (!success) {
      this.dlog(reason, { depth });
    }
    return success;
  }
}

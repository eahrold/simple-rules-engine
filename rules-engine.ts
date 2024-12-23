import type {
  RulesEngineRule,
  Accessor,
  LogicalOperator,
  RulesEngine,
} from "./types";
import { PolicyRule, ScopeRule, RoleRule, TenantRule } from "./rules";

const DEBUG_LOGGER: { debug: typeof console.debug } = {
  debug: (...message: unknown[]) => {},
};

export function createRulesEngine(
  operator: LogicalOperator = "AND",
  config: { logger: typeof DEBUG_LOGGER } = { logger: DEBUG_LOGGER }
): RulesEngine {
  return RulesEngineImpl.create(operator, config);
}

class RulesEngineImpl {
  private config: { logger: typeof DEBUG_LOGGER };
  private rules: RulesEngineRule[] = [];
  private subBuilders: RulesEngine[] = [];
  private operator: LogicalOperator;

  constructor(
    operator: LogicalOperator = "AND",
    config: { logger: typeof DEBUG_LOGGER }
  ) {
    this.operator = operator;
    this.config = config;
  }

  static create(
    operator: LogicalOperator = "AND",
    config: { logger: typeof DEBUG_LOGGER }
  ): RulesEngine {
    return new RulesEngineImpl(operator, config);
  }

  withTenant(tenantId: string): RulesEngine {
    this.rules.push(TenantRule(tenantId));
    return this;
  }

  withRoles(roles: string[]): RulesEngine {
    this.rules.push(RoleRule(roles));
    return this;
  }

  withScopes(scopes: string[]): RulesEngine {
    this.rules.push(ScopeRule(scopes));
    return this;
  }

  withPolicies(policies: string[]): RulesEngine {
    this.rules.push(PolicyRule(policies));
    return this;
  }

  and(cb: (builder: RulesEngine) => void): RulesEngine {
    cb(this);
    return this;
  }

  or(subBuilderCallback: (builder: RulesEngine) => void): RulesEngine {
    this.operator = "OR";
    const subBuilder = new RulesEngineImpl("AND", this.config);
    subBuilderCallback(subBuilder);
    this.subBuilders.push(subBuilder);
    return this;
  }

  check(accessor: Accessor, depth = 0): boolean {
    const { operator, rules } = this;
    const orOperatorWithNoRules = operator === "OR" && rules.length === 0;
    const selfPass = orOperatorWithNoRules
      ? false
      : rules.every((rule) => {
          return this.eval(accessor, rule);
        });

    if (operator === "AND") {
      const childrenPass = this.subBuilders.every((subBuilder) =>
        subBuilder.check(accessor, depth + 1)
      );
      const valid = selfPass && childrenPass;
      this.dlog(`AND Access ${valid ? "Allowed" : "Denied"}`, {
        selfPass,
        childrenPass,
        depth,
      });
      return valid;
    } else if (operator === "OR") {
      const childrenPass = this.subBuilders.some((subBuilder) =>
        subBuilder.check(accessor, depth + 1)
      );
      const valid = selfPass || childrenPass;
      this.dlog(`OR Access ${valid ? "Allowed" : "Denied"}`, {
        selfPass,
        childrenPass,
        depth,
      });
      return valid;
    }
    console.assert(false, "Invalid Logical Operator");
    return false;
  }

  private dlog(...message: unknown[]) {
    this.config.logger.debug(message);
  }

  private eval(accessor: Accessor, rule: Rule): boolean {
    const [success, reason] = rule.test(accessor);
    if (!success) {
      this.dlog(reason);
    }
    return success;
  }
}

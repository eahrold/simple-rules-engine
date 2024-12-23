import type {
  RulesEngineRule,
  LogicalOperator,
  RulesEngine,
  AuthenticatedActor,
  AggregateOperator,
} from "./types";
import { PermissionRule, ScopeRule, RoleRule, TenantRule } from "./rules";

const DEBUG_LOGGER: { debug: typeof console.debug } = {
  debug: (...message: unknown[]) => {},
};

export function createRulesEngine(
  config: { logger: typeof DEBUG_LOGGER } = { logger: DEBUG_LOGGER }
): RulesEngine {
  return RulesEngineImpl.create("AND", config);
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

  createRule(
    name: string,
    check: (claims: AuthenticatedActor) => boolean
  ): RulesEngineRule {
    return {
      name,
      handler: (actor: AuthenticatedActor) => {
        const pass = check(actor);
        if (pass) return [pass, null];
        return [false, `Rule ${name} failed validation`];
      },
    };
  }

  with(rule: RulesEngineRule): RulesEngine {
    this.rules.push(rule);
    return this;
  }

  withTenant(tenantId: string): RulesEngine {
    return this.with(TenantRule(tenantId));
  }

  withRoles(roles: string[]): RulesEngine {
    return this.with(RoleRule(roles));
  }

  withScopes(scopes: string[]): RulesEngine {
    return this.with(ScopeRule(scopes));
  }

  withPermissions(
    permissions: string[],
    operator: AggregateOperator = "ALL"
  ): RulesEngine {
    return this.with(PermissionRule(permissions, operator));
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

  check(actor: AuthenticatedActor, depth = 0): boolean {
    const { operator, rules } = this;
    const orOperatorWithNoRules = operator === "OR" && rules.length === 0;
    const selfPass = orOperatorWithNoRules
      ? false
      : rules.every((rule) => {
          return this.eval(actor, rule);
        });

    if (operator === "AND") {
      const childrenPass = this.subBuilders.every((subBuilder) =>
        subBuilder.check(actor, depth + 1)
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
        subBuilder.check(actor, depth + 1)
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

  private eval(actor: AuthenticatedActor, rule: RulesEngineRule): boolean {
    const [success, reason] = rule.handler(actor);
    if (!success) {
      this.dlog(reason);
    }
    return success;
  }
}

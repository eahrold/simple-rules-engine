import type { Rule, Accessor, LogicalOperator, RuleBuilder } from "./types";
import { PolicyRule, ScopeRule, RoleRule, TenantRule } from "./rules";

export function createRuleBuilder(
  operator: LogicalOperator = "AND"
): RuleBuilder {
  return RuleBuilderImpl.create(operator);
}

class RuleBuilderImpl {
  private rules: Rule[] = [];
  private subBuilders: RuleBuilder[] = [];
  private operator: LogicalOperator;

  constructor(operator: LogicalOperator = "AND") {
    this.operator = operator;
  }

  static create(operator: LogicalOperator = "AND"): RuleBuilder {
    return new RuleBuilderImpl(operator);
  }

  withTenant(tenantId: string): RuleBuilder {
    this.rules.push(TenantRule(tenantId));
    return this;
  }

  withRoles(roles: string[]): RuleBuilder {
    this.rules.push(RoleRule(roles));
    return this;
  }

  withScopes(scopes: string[]): RuleBuilder {
    this.rules.push(ScopeRule(scopes));
    return this;
  }

  withPolicies(policies: string[]): RuleBuilder {
    this.rules.push(PolicyRule(policies));
    return this;
  }

  and(cb: (builder: RuleBuilder) => void): RuleBuilder {
    cb(this);
    return this;
  }

  or(subBuilderCallback: (builder: RuleBuilder) => void): RuleBuilder {
    this.operator = "OR";
    const subBuilder = new RuleBuilderImpl("AND");
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
    if (process.env.NODE_ENV === "debug") {
      console.log(...message);
    }
  }

  private eval(accessor: Accessor, rule: Rule): boolean {
    const [success, reason] = rule.test(accessor);
    if (!success) {
      this.dlog(reason);
    }
    return success;
  }
}

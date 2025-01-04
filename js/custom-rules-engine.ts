import type {
  AggregateOperator,
  RulesEngineLogger,
} from "./rules-engine-types";
import {
  PermissionRule,
  ScopeRule,
  RoleRule,
  TenantRule,
} from "./custom-rules";
import type {
  AuthenticatedActor,
  CustomRulesEngine,
} from "./custom-rules-engine-types";
import { BaseRulesEngine } from "./rules-engine";

type Config = { logger: RulesEngineLogger };
export function createRulesEngine(
  config: Config = { logger: console }
): CustomRulesEngine {
  return new CustomRulesEngineImpl(config);
}

export class CustomRulesEngineImpl
  extends BaseRulesEngine<AuthenticatedActor, CustomRulesEngine>
  implements CustomRulesEngine
{
  private i_config: Config;

  constructor(config: Config) {
    super(config);
    this.i_config = config;
  }

  self() {
    return this;
  }

  clone() {
    return new CustomRulesEngineImpl(this.i_config);
  }

  withTenant(tenantId: string): CustomRulesEngine {
    return this.with(TenantRule(tenantId));
  }

  withRole(role: string): CustomRulesEngine {
    return this.withRoles([role]);
  }

  withRoles(roles: string[]): CustomRulesEngine {
    return this.with(RoleRule(roles));
  }

  withScopes(
    scopes: string[],
    operator: AggregateOperator = "ALL"
  ): CustomRulesEngine {
    return this.with(ScopeRule(scopes, operator));
  }

  withPermissions(
    permissions: string[],
    operator: AggregateOperator = "ALL"
  ): CustomRulesEngine {
    return this.with(PermissionRule(permissions, operator));
  }
}

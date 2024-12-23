# SimpleRulesEngine

SimpleRulesEngine is a lightweight and flexible rules engine for managing access control and permissions in your application. It allows you to define complex rules using logical operators (AND, OR) and aggregate operators (ANY, ALL) to evaluate user claims and permissions.

## Installation

To install dependencies:

```bash
bun install
```

## Creating a Rules Engine

You can create a rules engine using the `createRulesEngine` function. The rules engine allows you to define rules based on tenants, roles, scopes, and permissions.

```ts
import { createRulesEngine } from "./rules-engine";

const engine = createRulesEngine();
```

## Defining Rules

### Tenant Rule

```ts
engine.withTenant("tenantId");
```

### Role Rule

```ts
engine.withRole("role");
engine.withRoles(["role1", "role2"]);
```

### Scope Rule

```ts
engine.withScopes(["scope1", "scope2"], "ALL");
```

### Permission Rule

```ts
engine.withPermissions(["permission1", "permission2"], "ANY");
```

## Combining Rules

You can combine rules using logical operators (AND, OR).

### AND Operator

```ts
engine.and((builder) => {
  builder.withRole("admin").withScopes(["read", "write"]);
});
```

### OR Operator

```ts
engine.or((builder) => {
  builder.withRole("user").withPermissions(["manage"]);
});
```

### Combining AND and OR Operators

All rules in a given builder are combined using the AND operator, and builders are combined using the OR operator.

```ts
engine.and((builder) => {
  builder.withRole("admin").withScopes(["read", "write"]);
  builder.or((builder) => {
    builder.withRole("user").withPermissions(["manage"]);
  });
});
```

## Writing Custom RulesEngineRule

Write your own rules by implementing the `RulesEngineRule` interface.

```ts
import type {
  RulesEngineRule,
  AuthenticatedActor,
} from "@eeaapps/simple-rules-engine";

export function RoleStartsWithRule(startsWith: string): RulesEngineRule {
  return {
    name: "role-starts-with",
    handler: ({ account }: AuthenticatedActor) => {
      const valid = account.role.startsWith(startsWith);
      if (valid) return [true, null];
      return [false, ` ${account.role} did not start with ${startsWith}`];
    },
  };
}

const engine = createRulesEngine();
engine.with(RoleStartsWithRule("admin"));
```

Or use the `createRule` method to create a simple inline rule.

```ts
// Create a simple custom rule
const rule = engine.createRule("role-starts-with", (actor) => {
  const valid = actor.account.role.startsWith("admin");
  if (valid) return [true, null];
  return [false, ` ${actor.account.role} did not start with admin`];
});
engine.with(rule);
```

## Checking Rules

To check if an actor satisfies the defined rules, use the `check` method.

```ts
const actor = {
  account: { id: "user1", role: "admin" },
  claims: { tenantId: "tenant1", scopes: ["read"], permissions: ["manage"] },
};

const result = engine.check(actor);
console.log(result); // true or false
```

## Running Tests

To run the tests:

```bash
bun test
```

## License

This project is licensed under the MIT License.

import type { AuthenticatedActor } from "../types";

export function getConfig() {
  const debug = process.env.NODE_ENV === "debug";
  return debug ? { logger: console } : undefined;
}

export const actor1: AuthenticatedActor = {
  account: {
    id: "actor1",
    role: "role1",
  },
  claims: {
    accessorSource: "User",
    scopes: ["read", "write"],
    permissions: ["policy1", "policy2"],
    tenantId: "tenant1",
  },
};

export const actor2 = {
  account: {
    id: "actor2",
    role: "role2",
  },
  claims: {
    accessorSource: "User",
    scopes: ["read"],
    permissions: ["policy1"],
    tenantId: "tenant2",
  },
};

export const actor3 = {
  account: {
    id: "actor3",
    role: "role3",
  },
  claims: {
    accessorSource: "User",
    scopes: ["execute"],
    permissions: ["policy3"],
    tenantId: "tenant3",
  },
};

export const actor4 = {
  account: {
    id: "actor4",
    role: "role1",
  },
  claims: {
    accessorSource: "User",
    scopes: ["read"],
    permissions: ["policy1"],
    tenantId: "tenant1",
  },
};

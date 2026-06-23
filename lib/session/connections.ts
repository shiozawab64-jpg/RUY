import type { StoredConnection } from "../pluggy/types";

const STORAGE_KEY = "painel-do-ruy:connections";

export const readConnections = (): StoredConnection[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredConnection[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((connection) => ({
      ...connection,
      portfolio: connection.portfolio ?? "pessoal",
    }));
  } catch {
    return [];
  }
};

export const writeConnections = (connections: StoredConnection[]): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
};

export const addConnection = (connection: StoredConnection): StoredConnection[] => {
  const existing = readConnections().filter((c) => c.itemId !== connection.itemId);
  const next = [connection, ...existing];
  writeConnections(next);
  return next;
};

export const removeConnection = (itemId: string): StoredConnection[] => {
  const next = readConnections().filter((c) => c.itemId !== itemId);
  writeConnections(next);
  return next;
};

export const getItemIds = (): string[] => readConnections().map((connection) => connection.itemId);

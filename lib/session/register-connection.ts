import type { StoredConnection } from "@/lib/pluggy/types";

export const registerConnectionOnServer = async (
  connection: StoredConnection,
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(connection),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      return { ok: false, error: data.error ?? "Falha ao registrar conexão no servidor." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível registrar a conexão no servidor." };
  }
};

export const triggerSyncOnServer = async (
  itemIds: string[],
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });

    const data = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok) {
      return { ok: false, error: data.error ?? "Falha ao sincronizar dados." };
    }

    return { ok: data.ok ?? true };
  } catch {
    return { ok: false, error: "Não foi possível sincronizar os dados." };
  }
};

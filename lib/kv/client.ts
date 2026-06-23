import { kv } from "@vercel/kv";

export const isKvConfigured = (): boolean =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const getKv = () => {
  if (!isKvConfigured()) {
    throw new Error(
      "KV não configurado. Defina KV_REST_API_URL e KV_REST_API_TOKEN no Vercel (Storage → KV).",
    );
  }

  return kv;
};

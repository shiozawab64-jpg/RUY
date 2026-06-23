export type CronAuthorization = { ok: true } | { ok: false; status: 401 | 503; error: string };

export const validateCronAuthorization = (
  authHeader: string | null,
  cronSecret: string | undefined,
): CronAuthorization => {
  if (!cronSecret) {
    return { ok: false, status: 503, error: "CRON_SECRET is not configured" };
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
};

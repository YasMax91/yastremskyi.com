/**
 * The shape of what `server/status.mjs` serves.
 *
 * The service is plain JavaScript with no dependencies — deliberately, it runs
 * on the box — so the contract between it and this site is written down here
 * instead of being inferred at every use. If the two ever disagree, this file is
 * the thing to change, and `npm run check` will point at every page that assumed
 * the old shape.
 *
 * Every number is nullable on purpose. "No data yet" is a real state for a page
 * that has just been deployed, and rendering a zero for it would be a lie of
 * exactly the kind this page exists not to tell.
 */

export interface StatusDay {
  date: string;
  checks: number;
  failures: number;
  availability: number | null;
}

export interface StatusRoute {
  route: string;
  performance: number;
  lcp: number;
}

export interface StatusSnapshot {
  generatedAt: string;
  window: number;
  uptime: {
    checks: number;
    failures: number;
    availability: number | null;
  };
  latency: {
    p50: number | null;
    p95: number | null;
    unit: string;
    samples: number;
  };
  days: StatusDay[];
  probe: {
    lastAt: string | null;
    ok: boolean | null;
    stale: boolean;
    intervalMinutes: number;
    source: string;
  };
  tls: { daysRemaining: number | null };
  gates: {
    at: string;
    commit: string;
    ci: string;
    routes: StatusRoute[];
  } | null;
  service?: { startedAt: string; node: string };
  contact?: { ok: boolean; checkedAt: string };
}

/**
 * Read the snapshot at build time.
 *
 * Best-effort by contract: a status service having a bad day must not be able to
 * break the deploy that might fix it, so every failure returns null and the page
 * renders its "no data yet" state.
 */
export async function fetchSnapshot(endpoint: string, timeoutMs = 3000) {
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return (await res.json()) as StatusSnapshot;
  } catch {
    return null;
  }
}

/**
 * How one day reads on the bar.
 *
 * A day nobody probed is `none`, never `up`: an unknown is not a success, and a
 * status page that paints silence green is worse than no status page.
 */
export function dayState(day: StatusDay | null): 'up' | 'partial' | 'down' | 'none' {
  if (!day || day.checks === 0) return 'none';
  if (day.failures === 0) return 'up';
  return day.availability !== null && day.availability < 0.95 ? 'down' : 'partial';
}

/**
 * The bar's per-day label, which is the only thing a screen reader gets from it.
 * The wording is passed in rather than built here, so the sentence is one
 * translatable string instead of three fragments glued in English word order.
 */
export function dayLabel(
  day: StatusDay | null,
  words: { none: string; label: (v: { date: string; checks: number; failures: number }) => string },
): string {
  if (!day) return words.none;
  return words.label({ date: day.date, checks: day.checks, failures: day.failures });
}

export const formatPercent = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : `${(v * 100).toFixed(2)}%`;

export const formatMs = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : `${Math.round(v)} ms`;

export const formatCount = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : String(v);

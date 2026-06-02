/**
 * Closing-window mechanics (2026-05-28 decision).
 *
 * A group fires its 48-hour "closing window" the instant it first reaches
 * `minMembers`. The timer is CUMULATIVE: subsequent joins do NOT reset it.
 *
 * Closure happens when EITHER:
 *   1. members reach `maxMembers` → close immediately
 *   2. 48 h elapse since `minReachedAt` → close with whatever members we have
 *
 * After close, the group can optionally REOPEN (single-step rollback) when:
 *   • current status === "closed"
 *   • a member just left (count dipped below `minMembers`)
 *   • no operators have contacted the group yet
 *   • there are still > 5 days until `dateStart`
 */

import type { Tour } from "@/components/tour/tour-card";

export const CLOSING_WINDOW_MS = 48 * 60 * 60 * 1000;
export const REOPEN_MIN_DAYS_TO_START = 5;

export function isClosingSoon(t: Tour): boolean {
  if (t.status !== "open") return false;
  if (!t.minReachedAt) return false;
  return Date.now() - new Date(t.minReachedAt).getTime() < CLOSING_WINDOW_MS;
}

/** Milliseconds remaining in the closing window, clamped to ≥ 0. Null if no timer. */
export function closingWindowMsLeft(t: Tour): number | null {
  if (!t.minReachedAt) return null;
  const elapsed = Date.now() - new Date(t.minReachedAt).getTime();
  return Math.max(0, CLOSING_WINDOW_MS - elapsed);
}

/** Should this currently-open tour transition to closed right now? */
export function shouldAutoClose(t: Tour): boolean {
  if (t.status !== "open") return false;
  if (t.currentMembers >= t.maxMembers) return true;
  if (
    t.minReachedAt &&
    Date.now() - new Date(t.minReachedAt).getTime() >= CLOSING_WINDOW_MS
  ) {
    return true;
  }
  return false;
}

/**
 * Pretty-prints the remaining window with second precision so the UI ticks
 * visibly every second. Examples: "47h 12m 03s", "1h 29m 45s", "12m 05s", "8s".
 *
 * The leading zero on seconds (and on minutes when hours are present) keeps
 * the layout stable so the countdown doesn't jitter as digits change width.
 */
export function formatCountdown(msLeft: number): string {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    const mm = String(minutes).padStart(2, "0");
    return `${hours}h ${mm}m ${ss}s`;
  }
  if (minutes > 0) return `${minutes}m ${ss}s`;
  return `${seconds}s`;
}

/**
 * Best-effort days-until-start parser for the display-shaped `dateStart`
 * (e.g. "May 15"). Returns null when we can't parse — callers should treat
 * null as "don't make a destructive decision" (= don't reopen).
 */
export function daysUntilStart(dateStart: string): number | null {
  const thisYear = new Date().getFullYear();
  const candidates = [
    dateStart,
    `${dateStart} ${thisYear}`,
    `${dateStart}, ${thisYear}`,
  ];
  for (const c of candidates) {
    const t = new Date(c).getTime();
    if (!Number.isNaN(t)) {
      return Math.floor((t - Date.now()) / (1000 * 60 * 60 * 24));
    }
  }
  return null;
}

/** Per the reopen rules — pure function, no mutation. */
export function canReopen(
  t: Tour,
  operatorsContacted: number
): boolean {
  if (t.status !== "closed") return false;
  if (t.currentMembers >= t.minMembers) return false;
  if (operatorsContacted > 0) return false;
  const d = daysUntilStart(t.dateStart);
  if (d === null) return false;
  return d > REOPEN_MIN_DAYS_TO_START;
}

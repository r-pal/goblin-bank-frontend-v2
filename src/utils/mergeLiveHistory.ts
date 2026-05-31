import type { Account, HistoryResponse } from "../api/types";

function mergeLiveFromAccounts(
  history: HistoryResponse,
  accounts: Account[],
  valueOf: (a: Account) => number,
): HistoryResponse {
  if (accounts.length === 0) return history;

  const now = new Date().toISOString();
  const seriesByKey = new Map(
    history.series.map((s) => [s.key, { ...s, points: [...s.points] }]),
  );

  for (const a of accounts) {
    const v = valueOf(a);
    const existing = seriesByKey.get(a.hovelSlug);
    if (existing) {
      const points = existing.points;
      const last = points[points.length - 1];
      if (last && last.v === v) {
        points[points.length - 1] = { t: now, v };
      } else {
        points.push({ t: now, v });
      }
      existing.label = a.name;
    } else {
      seriesByKey.set(a.hovelSlug, {
        key: a.hovelSlug,
        label: a.name,
        points: [{ t: now, v }],
      });
    }
  }

  return { series: [...seriesByKey.values()] };
}

/** Snapshots run every 30 min; append current balances for live office updates. */
export function mergeLiveAccountBalances(
  history: HistoryResponse,
  accounts: Account[],
): HistoryResponse {
  return mergeLiveFromAccounts(history, accounts, (a) => a.balanceCoins);
}

/** Snapshots run every 30 min; append current rates for live office updates. */
export function mergeLiveInterestRates(
  history: HistoryResponse,
  accounts: Account[],
): HistoryResponse {
  return mergeLiveFromAccounts(history, accounts, (a) => a.interestRatePercent);
}

export function historyHasPoints(
  history: HistoryResponse | null,
  accounts: Account[],
  merge: (history: HistoryResponse, accounts: Account[]) => HistoryResponse,
): boolean {
  if (!history) return false;
  const merged = accounts.length > 0 ? merge(history, accounts) : history;
  return merged.series.some((s) => s.points.length > 0);
}

export function accountHistoryHasPoints(
  history: HistoryResponse | null,
  accounts: Account[],
): boolean {
  return historyHasPoints(history, accounts, mergeLiveAccountBalances);
}

export function interestHistoryHasPoints(
  history: HistoryResponse | null,
  accounts: Account[],
): boolean {
  return historyHasPoints(history, accounts, mergeLiveInterestRates);
}

/** Parse coin balance from a `/api/market` account line (`"Hovel Name Ǥ1,234"`). */
export function parseMarketAccountBalance(line: string): number {
  const match = line.match(/(-?)Ǥ([\d,]+)\s*$/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * Number(match[2].replace(/,/g, ""));
}

export function allMarketAccountsZero(accounts: string[]): boolean {
  if (accounts.length === 0) return true;
  return accounts.every((line) => parseMarketAccountBalance(line) === 0);
}

import type {
  AccountsListResponse,
  HistoryResponse,
  MarketResponse,
  MessagesListResponse,
  WaresListResponse,
} from "./types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const client = {
  getMarket: () => api<MarketResponse>("/api/market"),

  getAccounts: () => api<AccountsListResponse>("/api/accounts"),
  postCoinChange: (hovelSlug: string, amount: number) =>
    api<{ ok: true }>(`/api/accounts/${encodeURIComponent(hovelSlug)}/coin-change`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  patchInterestRate: (hovelSlug: string, interestRatePercent: number) =>
    api<{ hovelSlug: string; interestRatePercent: number }>(
      `/api/accounts/${encodeURIComponent(hovelSlug)}/interest-rate`,
      {
        method: "PATCH",
        body: JSON.stringify({ interestRatePercent }),
      },
    ),

  getWares: () => api<WaresListResponse>("/api/wares"),
  postWare: (name: string, price: number) =>
    api<{ id: string }>("/api/wares", { method: "POST", body: JSON.stringify({ name, price }) }),
  patchWare: (id: string, patch: { name?: string; price?: number }) =>
    api<{ ok: true }>(`/api/wares/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteWare: (id: string) =>
    api<{ ok: true }>(`/api/wares/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getMessages: () => api<MessagesListResponse>("/api/messages"),
  postMessage: (text: string) =>
    api<{ id: string }>("/api/messages", { method: "POST", body: JSON.stringify({ text }) }),
  patchMessage: (id: string, text: string) =>
    api<{ ok: true }>(`/api/messages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    }),
  deleteMessage: (id: string) =>
    api<{ ok: true }>(`/api/messages/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getHistoryAccounts: () => api<HistoryResponse>("/api/history/accounts"),
  getHistoryWares: () => api<HistoryResponse>("/api/history/wares"),

  postAdminReset: (secret: string) =>
    api<{ ok: true }>("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ secret }),
    }),
};


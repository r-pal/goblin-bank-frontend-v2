export type PriceTrend = "up" | "down" | null;

export type WareMarketItem = {
  name: string;
  price: string;
  trend: PriceTrend;
};

export type MarketResponse = {
  accounts: string[];
  wares: WareMarketItem[];
  messages: string[];
};

export type Account = {
  hovelSlug: string;
  name: string;
  balanceCoins: number;
  interestRatePercent: number;
};

export type AccountsListResponse = { accounts: Account[] };

export type Ware = { id: string; name: string; priceCoins: number };
export type WaresListResponse = { wares: Ware[] };

export type Message = { id: string; text: string };
export type MessagesListResponse = { messages: Message[] };

export type HistoryPoint = { t: string; v: number };
export type HistorySeries = { key: string; label: string; points: HistoryPoint[] };
export type HistoryResponse = { series: HistorySeries[] };


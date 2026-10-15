import { useCallback, useEffect, useMemo, useState } from "react";
import { client } from "../../api/client";
import type { Account, HistoryResponse, MarketResponse } from "../../api/types";
import { AdvertBoard, useAdvertUrls } from "../../components/AdvertBoard";
import { HistoryChart } from "../../components/HistoryChart";
import { Tickertape } from "../../components/Tickertape";
import {
  TvGraphToggle,
  type TvPanelMode,
  type TvPanelView,
} from "../../components/TvGraphToggle";
import { TvMapPanel } from "../../components/TvMapPanel";
import { WaresTickertape } from "../../components/WaresTickertape";
import { TvBackgroundP5 } from "../../components/TvBackgroundP5";
import { TvGoblinFloater } from "../../components/TvGoblinFloater";
import {
  accountHistoryHasPoints,
  interestHistoryHasPoints,
  mergeLiveAccountBalances,
  mergeLiveInterestRates,
} from "../../utils/mergeLiveHistory";
import { allMarketAccountsZero } from "../../utils/parseMarketAccountBalance";
import { toErrorMessage } from "../../utils/toErrorMessage";
import { GRAPH_CYCLE_MS } from "../../constants/tvTiming";
import { useAutoCycle } from "../../hooks/useAutoCycle";
import { buildAutoSteps, type GraphKind } from "./autoSteps";
import styles from "./TvScreen.module.css";

const TV_POLL_MS = 5_000;
/** Half of the original 1.15in TV ticker band height. */
const TV_TICKER_HEIGHT_IN = 0.575;

export function TvScreen() {
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [marketErr, setMarketErr] = useState<string | null>(null);

  const [panelMode, setPanelMode] = useState<TvPanelMode>("auto");
  const [histAccounts, setHistAccounts] = useState<HistoryResponse | null>(null);
  const [histInterest, setHistInterest] = useState<HistoryResponse | null>(null);
  const [histWares, setHistWares] = useState<HistoryResponse | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<Account[]>([]);
  const [graphIndex, setGraphIndex] = useState(0);

  const loadHistory = useCallback(async () => {
    try {
      const [a, interest, w, accts] = await Promise.all([
        client.getHistoryAccounts(),
        client.getHistoryInterestRates(),
        client.getHistoryWares(),
        client.getAccounts(),
      ]);
      setHistAccounts(a);
      setHistInterest(interest);
      setHistWares(w);
      setLiveAccounts(accts.accounts);
    } catch {
      // Keep prior history if fetch fails.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const next = await client.getMarket();
        if (!cancelled) {
          setMarket(next);
          setMarketErr(null);
        }
      } catch (e) {
        if (!cancelled) setMarketErr(toErrorMessage(e));
      }
    };

    tick();
    const id = window.setInterval(tick, TV_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    void loadHistory();
    const id = window.setInterval(() => void loadHistory(), TV_POLL_MS);
    return () => window.clearInterval(id);
  }, [loadHistory]);

  const onPanelModeChange = (mode: TvPanelMode) => {
    setPanelMode(mode);
    if (mode === "auto") resetAutoCycle();
  };

  const showMessages = (market?.messages?.length ?? 0) > 0;
  const showAccounts =
    (market?.accounts?.length ?? 0) > 0 &&
    !allMarketAccountsZero(market?.accounts ?? []);
  const showWares = (market?.wares?.length ?? 0) > 0;
  const showTickers = showMessages || showAccounts || showWares;

  const histAccountsLive =
    histAccounts && liveAccounts.length > 0
      ? mergeLiveAccountBalances(histAccounts, liveAccounts)
      : histAccounts;
  const hasAccountHistory = accountHistoryHasPoints(histAccounts, liveAccounts);
  const histInterestLive =
    histInterest && liveAccounts.length > 0
      ? mergeLiveInterestRates(histInterest, liveAccounts)
      : histInterest;
  const hasInterestHistory = interestHistoryHasPoints(histInterest, liveAccounts);
  const hasWareHistory = (histWares?.series ?? []).some((s) => s.points.length > 0);

  // Depends only on booleans: history objects are rebuilt on every poll, and a new
  // array here would rebuild autoSteps and restart the auto cycle.
  const availableGraphs = useMemo(() => {
    const kinds: GraphKind[] = [];
    if (hasAccountHistory) kinds.push("coin");
    if (hasInterestHistory) kinds.push("interest");
    if (hasWareHistory) kinds.push("wares");
    return kinds;
  }, [hasAccountHistory, hasInterestHistory, hasWareHistory]);

  const advertCount = useAdvertUrls().length;
  const autoSteps = useMemo(
    () => buildAutoSteps(availableGraphs, advertCount),
    [availableGraphs, advertCount],
  );

  const { step: autoStep, reset: resetAutoCycle } = useAutoCycle(autoSteps, panelMode === "auto");

  const activeView: TvPanelView =
    panelMode === "auto" ? (autoStep?.view ?? "adverts") : panelMode;

  const showGraph = activeView === "graph";
  const showMap = activeView === "map";
  const showAdverts = activeView === "adverts";

  const activeGraph: GraphKind | null =
    panelMode === "auto" && autoStep?.view === "graph"
      ? autoStep.graph
      : panelMode === "graph"
        ? (availableGraphs[graphIndex % availableGraphs.length] ?? null)
        : null;

  useEffect(() => {
    setGraphIndex((i) => {
      if (availableGraphs.length === 0) return 0;
      return i % availableGraphs.length;
    });
  }, [availableGraphs.length]);

  useEffect(() => {
    if (panelMode !== "graph" || availableGraphs.length <= 1) return;

    const id = window.setInterval(() => {
      setGraphIndex((i) => (i + 1) % availableGraphs.length);
    }, GRAPH_CYCLE_MS);

    return () => window.clearInterval(id);
  }, [panelMode, availableGraphs.length]);

  return (
    <div className={styles.root}>
      <TvGraphToggle
        mode={panelMode}
        activeView={activeView}
        onModeChange={onPanelModeChange}
      />

      <div className={styles.p5}>
        <TvBackgroundP5 />
      </div>

      <div className={styles.shell}>
        <div className={styles.leftPanel}>
          {showGraph ? (
            <div className={styles.graphOverlay} aria-label="Graphs">
              <div className={styles.graphStack}>
                {activeGraph === "coin" && histAccountsLive ? (
                  <div className={styles.graphSection}>
                    <h2 className={styles.graphTitle}>Coin</h2>
                    <div className={styles.chartBody}>
                      <HistoryChart
                        data={histAccountsLive}
                        fill
                        variant="tv"
                        showLegend
                        legendPosition="bottom"
                      />
                    </div>
                  </div>
                ) : null}
                {activeGraph === "interest" && histInterestLive ? (
                  <div className={styles.graphSection}>
                    <h2 className={styles.graphTitle}>Interest rates</h2>
                    <div className={styles.chartBody}>
                      <HistoryChart
                        data={histInterestLive}
                        fill
                        variant="tv"
                        yMinZero
                        valueSuffix="%"
                        showLegend
                        legendPosition="bottom"
                      />
                    </div>
                  </div>
                ) : null}
                {activeGraph === "wares" && histWares ? (
                  <div className={styles.graphSection}>
                    <h2 className={styles.graphTitle}>Prices (wares)</h2>
                    <div className={styles.chartBody}>
                      <HistoryChart
                        data={histWares}
                        fill
                        variant="tv"
                        yMinZero
                        showLegend
                        legendPosition="bottom"
                      />
                    </div>
                  </div>
                ) : null}
                {availableGraphs.length === 0 ? (
                  <div className={styles.graphEmpty}>No history yet.</div>
                ) : null}
              </div>
            </div>
          ) : showMap ? (
            <TvMapPanel />
          ) : showAdverts ? (
            <AdvertBoard />
          ) : null}
        </div>

        <div className={styles.rightStrip}>
          <TvGoblinFloater />
        </div>

        {showTickers || marketErr ? (
        <div className={styles.tickers}>
          {marketErr ? <div className={styles.error}>Backend: {marketErr}</div> : null}
          {showMessages ? (
            <Tickertape
              items={market!.messages}
              speedPxPerSec={40}
              variant="light"
              heightIn={TV_TICKER_HEIGHT_IN}
            />
          ) : null}
          {showAccounts ? (
            <Tickertape
              items={market!.accounts}
              speedPxPerSec={55}
              variant="light"
              heightIn={TV_TICKER_HEIGHT_IN}
            />
          ) : null}
          {showWares ? (
            <WaresTickertape wares={market!.wares} speedPxPerSec={70} heightIn={TV_TICKER_HEIGHT_IN} />
          ) : null}
        </div>
        ) : null}
      </div>
    </div>
  );
}

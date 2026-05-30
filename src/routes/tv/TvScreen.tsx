import { useCallback, useEffect, useState } from "react";
import { client } from "../../api/client";
import type { HistoryResponse, MarketResponse } from "../../api/types";
import { AdvertBoard } from "../../components/AdvertBoard";
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
import styles from "./TvScreen.module.css";

const MARKET_POLL_MS = 5_000;
const AUTO_CYCLE_MS = 30_000;

const AUTO_SEQUENCE: readonly TvPanelView[] = ["adverts", "graph", "map"];

function nextAutoView(current: TvPanelView): TvPanelView {
  const i = AUTO_SEQUENCE.indexOf(current);
  return AUTO_SEQUENCE[(i + 1) % AUTO_SEQUENCE.length]!;
}

export function TvScreen() {
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [marketErr, setMarketErr] = useState<string | null>(null);

  const [panelMode, setPanelMode] = useState<TvPanelMode>("auto");
  const [autoView, setAutoView] = useState<TvPanelView>("adverts");
  const [histAccounts, setHistAccounts] = useState<HistoryResponse | null>(null);
  const [histWares, setHistWares] = useState<HistoryResponse | null>(null);

  const activeView: TvPanelView = panelMode === "auto" ? autoView : panelMode;

  const showGraph = activeView === "graph";
  const showMap = activeView === "map";
  const showAdverts = activeView === "adverts";

  const loadHistory = useCallback(async () => {
    try {
      const [a, w] = await Promise.all([
        client.getHistoryAccounts(),
        client.getHistoryWares(),
      ]);
      setHistAccounts(a);
      setHistWares(w);
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
        if (!cancelled) setMarketErr(e instanceof Error ? e.message : String(e));
      }
    };

    tick();
    const id = window.setInterval(tick, MARKET_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (panelMode !== "auto") return;

    const id = window.setInterval(() => {
      setAutoView((current) => nextAutoView(current));
    }, AUTO_CYCLE_MS);

    return () => window.clearInterval(id);
  }, [panelMode]);

  useEffect(() => {
    if (activeView === "graph") void loadHistory();
  }, [activeView, loadHistory]);

  const onPanelModeChange = (mode: TvPanelMode) => {
    setPanelMode(mode);
    if (mode === "auto") setAutoView("adverts");
  };

  const showMessages = (market?.messages?.length ?? 0) > 0;
  const showAccounts = (market?.accounts?.length ?? 0) > 0;
  const showWares = (market?.wares?.length ?? 0) > 0;

  const hasAccountHistory = (histAccounts?.series ?? []).some((s) => s.points.length > 0);
  const hasWareHistory = (histWares?.series ?? []).some((s) => s.points.length > 0);

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
                {hasAccountHistory && histAccounts ? (
                  <div className={styles.graphSection}>
                    <div className={styles.graphTitle}>Coin (accounts)</div>
                    <div className={styles.chartBody}>
                      <HistoryChart data={histAccounts} fill variant="tv" />
                    </div>
                  </div>
                ) : null}
                {hasWareHistory && histWares ? (
                  <div className={styles.graphSection}>
                    <div className={styles.graphTitle}>Prices (wares)</div>
                    <div className={styles.chartBody}>
                      <HistoryChart data={histWares} fill variant="tv" yMinZero />
                    </div>
                  </div>
                ) : null}
                {!hasAccountHistory && !hasWareHistory ? (
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

        <div className={styles.tickers}>
          {marketErr ? <div className={styles.error}>Backend: {marketErr}</div> : null}
          {showMessages ? (
            <Tickertape
              items={market!.messages}
              speedPxPerSec={40}
              variant="light"
              heightIn={1.15}
            />
          ) : null}
          {showAccounts ? (
            <Tickertape
              items={market!.accounts}
              speedPxPerSec={55}
              variant="light"
              heightIn={1.15}
            />
          ) : null}
          {showWares ? (
            <WaresTickertape wares={market!.wares} speedPxPerSec={70} heightIn={1.15} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

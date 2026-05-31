import { useEffect, useMemo, useState } from "react";
import { client } from "../../api/client";
import type { Account, HistoryResponse } from "../../api/types";
import { HistoryChart } from "../../components/HistoryChart";
import { Modal } from "../../components/Modal";
import { verifySnivellSecret } from "./auth";

function fmtCoins(v: number): string {
  return `Ǥ${v.toLocaleString()}`;
}

export function OfficeBank() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [deltaBySlug, setDeltaBySlug] = useState<Record<string, string>>({});
  const [rateBySlug, setRateBySlug] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSecret, setResetSecret] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const load = async () => {
    try {
      const res = await client.getAccounts();
      setAccounts(res.accounts);
      setErr(null);
      setRateBySlug((prev) => {
        const next = { ...prev };
        for (const a of res.accounts) next[a.hovelSlug] = String(a.interestRatePercent);
        return next;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => accounts, [accounts]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>Bank</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={async () => {
              setShowHistory(true);
              try {
                setHistory(await client.getHistoryAccounts());
              } catch {
                setHistory(null);
              }
            }}
            style={{
              font: "inherit",
              borderRadius: 10,
              padding: "6px 10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(0,0,0,0.22)",
              color: "var(--text)",
            }}
          >
            History graph
          </button>
          <button
            type="button"
            onClick={() => {
              setResetSecret("");
              setResetError(null);
              setShowReset(true);
            }}
            style={{
              font: "inherit",
              borderRadius: 10,
              padding: "6px 10px",
              border: "1px solid rgba(255,80,80,0.45)",
              background: "rgba(120,20,20,0.35)",
              color: "var(--text)",
            }}
          >
            Reset all
          </button>
        </div>
      </div>

      {err ? (
        <div style={{ marginBottom: 10, color: "var(--accent)" }}>Error: {err}</div>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((a) => {
          const busy = busyKey === a.hovelSlug;
          const deltaRaw = deltaBySlug[a.hovelSlug] ?? "";
          const rateRaw = rateBySlug[a.hovelSlug] ?? String(a.interestRatePercent);
          return (
            <div
              key={a.hovelSlug}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "var(--panel)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ opacity: 0.85 }}>{fmtCoins(a.balanceCoins)}</div>
                </div>
                <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      inputMode="numeric"
                      placeholder="+/- coins"
                      value={deltaRaw}
                      onChange={(e) =>
                        setDeltaBySlug((p) => ({ ...p, [a.hovelSlug]: e.target.value }))
                      }
                      style={{
                        width: 120,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.2)",
                      }}
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        const amount = Number(deltaRaw);
                        if (!Number.isInteger(amount) || amount === 0) return;
                        setBusyKey(a.hovelSlug);
                        try {
                          await client.postCoinChange(a.hovelSlug, amount);
                          setDeltaBySlug((p) => ({ ...p, [a.hovelSlug]: "" }));
                          await load();
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      style={{
                        font: "inherit",
                        borderRadius: 10,
                        padding: "8px 10px",
                        border: "1px solid rgba(255,255,255,0.22)",
                        background: "rgba(0,0,0,0.22)",
                        color: "var(--text)",
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      inputMode="numeric"
                      placeholder="%"
                      value={rateRaw}
                      onChange={(e) =>
                        setRateBySlug((p) => ({ ...p, [a.hovelSlug]: e.target.value }))
                      }
                      style={{
                        width: 70,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.2)",
                      }}
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        const next = Number(rateRaw);
                        if (!Number.isInteger(next) || next < 0) return;
                        setBusyKey(a.hovelSlug);
                        try {
                          await client.patchInterestRate(a.hovelSlug, next);
                          await load();
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      style={{
                        font: "inherit",
                        borderRadius: 10,
                        padding: "8px 10px",
                        border: "1px solid rgba(255,255,255,0.22)",
                        background: "rgba(0,0,0,0.22)",
                        color: "var(--text)",
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      Set %
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
                {a.hovelSlug}
              </div>
            </div>
          );
        })}
      </div>

      {showHistory ? (
        <Modal title="Accounts history" onClose={() => setShowHistory(false)}>
          {history ? <HistoryChart data={history} height={520} /> : <div>No data.</div>}
        </Modal>
      ) : null}

      {showReset ? (
        <Modal
          title="Reset database"
          onClose={() => {
            if (resetBusy) return;
            setShowReset(false);
            setResetSecret("");
            setResetError(null);
          }}
        >
          <p style={{ marginTop: 0, lineHeight: 1.45 }}>
            This wipes all accounts, wares, messages, and history, then re-creates the default
            hovel accounts at zero balance. It cannot be undone.
          </p>
          <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            <span>snivell&apos;s secret</span>
            <input
              type="password"
              value={resetSecret}
              autoComplete="off"
              disabled={resetBusy}
              onChange={(e) => {
                setResetSecret(e.target.value);
                setResetError(null);
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
          </label>
          {resetError ? (
            <div style={{ marginBottom: 10, color: "var(--accent)" }}>{resetError}</div>
          ) : null}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              disabled={resetBusy}
              onClick={() => {
                setShowReset(false);
                setResetSecret("");
                setResetError(null);
              }}
              style={{
                font: "inherit",
                borderRadius: 10,
                padding: "8px 12px",
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(0,0,0,0.22)",
                color: "var(--text)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resetBusy || resetSecret.length === 0}
              onClick={async () => {
                if (!verifySnivellSecret(resetSecret)) {
                  setResetError("Wrong secret.");
                  return;
                }
                setResetBusy(true);
                setResetError(null);
                try {
                  await client.postAdminReset(resetSecret);
                  setShowReset(false);
                  setResetSecret("");
                  await load();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e);
                  setResetError(msg.includes("403") || msg.includes("invalid") ? "Wrong secret." : msg);
                } finally {
                  setResetBusy(false);
                }
              }}
              style={{
                font: "inherit",
                borderRadius: 10,
                padding: "8px 12px",
                border: "1px solid rgba(255,80,80,0.45)",
                background: "rgba(120,20,20,0.45)",
                color: "var(--text)",
                opacity: resetBusy || resetSecret.length === 0 ? 0.6 : 1,
              }}
            >
              {resetBusy ? "Resetting…" : "Wipe & reset"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}


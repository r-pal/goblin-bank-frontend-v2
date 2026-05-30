import { useEffect, useMemo, useState } from "react";
import { client } from "../../api/client";
import type { Account, HistoryResponse } from "../../api/types";
import { HistoryChart } from "../../components/HistoryChart";
import { Modal } from "../../components/Modal";

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>Bank</h1>
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
    </div>
  );
}


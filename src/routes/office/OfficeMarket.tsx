import { useEffect, useMemo, useState } from "react";
import { client } from "../../api/client";
import type { HistoryResponse, Ware } from "../../api/types";
import { HistoryChart } from "../../components/HistoryChart";
import { Modal } from "../../components/Modal";
import { useToast } from "./toast/useToast";

type NewWareRow = { name: string; price: string };

export function OfficeMarket() {
  const { showToast } = useToast();
  const [wares, setWares] = useState<Ware[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftById, setDraftById] = useState<Record<string, { name: string; price: string }>>({});
  const [newRows, setNewRows] = useState<NewWareRow[]>([{ name: "", price: "" }]);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  const load = async () => {
    try {
      const res = await client.getWares();
      setWares(res.wares);
      setDraftById((prev) => {
        const next = { ...prev };
        for (const w of res.wares) next[w.id] = { name: w.name, price: String(w.priceCoins) };
        return next;
      });
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => wares, [wares]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>Market</h1>
        <button
          type="button"
          onClick={async () => {
            setShowHistory(true);
            try {
              setHistory(await client.getHistoryWares());
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

      {err ? <div style={{ marginBottom: 10, color: "var(--accent)" }}>Error: {err}</div> : null}

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((w) => {
          const d = draftById[w.id] ?? { name: w.name, price: String(w.priceCoins) };
          return (
            <div
              key={w.id}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "var(--panel)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={d.name}
                    onChange={(e) =>
                      setDraftById((p) => ({ ...p, [w.id]: { ...d, name: e.target.value } }))
                    }
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.2)",
                    }}
                  />
                  <input
                    inputMode="numeric"
                    value={d.price}
                    onChange={(e) =>
                      setDraftById((p) => ({ ...p, [w.id]: { ...d, price: e.target.value } }))
                    }
                    style={{
                      width: 120,
                      padding: 8,
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.2)",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const price = Number(d.price);
                      if (!Number.isInteger(price) || price < 0 || d.name.trim().length === 0)
                        return;
                      setBusy(true);
                      try {
                        await client.patchWare(w.id, { name: d.name, price });
                        await load();
                        showToast(`${d.name.trim()} saved (Ǥ${price.toLocaleString()})`);
                      } finally {
                        setBusy(false);
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
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const label = d.name.trim() || w.name;
                      setBusy(true);
                      try {
                        await client.deleteWare(w.id);
                        await load();
                        showToast(`${label} deleted`);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    style={{
                      font: "inherit",
                      borderRadius: 10,
                      padding: "8px 10px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(0,0,0,0.14)",
                      color: "var(--text)",
                      opacity: busy ? 0.6 : 0.85,
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>{w.id}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 18, margin: "16px 0 10px 0" }}>Add wares</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {newRows.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="name"
              value={r.name}
              onChange={(e) =>
                setNewRows((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
              }
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
            <input
              placeholder="price"
              inputMode="numeric"
              value={r.price}
              onChange={(e) =>
                setNewRows((prev) => prev.map((x, idx) => (idx === i ? { ...x, price: e.target.value } : x)))
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
              onClick={() => setNewRows((prev) => prev.filter((_, idx) => idx !== i))}
              style={{
                font: "inherit",
                borderRadius: 10,
                padding: "8px 10px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.14)",
                color: "var(--text)",
                opacity: 0.85,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setNewRows((prev) => [...prev, { name: "", price: "" }])}
            style={{
              font: "inherit",
              borderRadius: 10,
              padding: "8px 10px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.14)",
              color: "var(--text)",
              opacity: 0.9,
            }}
          >
            Add row
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const rowsToAdd = newRows
                .map((r) => ({ name: r.name.trim(), price: Number(r.price) }))
                .filter((r) => r.name.length > 0 && Number.isInteger(r.price) && r.price >= 0);
              if (rowsToAdd.length === 0) return;
              setBusy(true);
              try {
                for (const r of rowsToAdd) {
                  await client.postWare(r.name, r.price);
                }
                setNewRows([{ name: "", price: "" }]);
                await load();
                if (rowsToAdd.length === 1) {
                  const r = rowsToAdd[0]!;
                  showToast(`${r.name} created (Ǥ${r.price.toLocaleString()})`);
                } else {
                  showToast(`Created ${rowsToAdd.length} wares`);
                }
              } finally {
                setBusy(false);
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
            Create
          </button>
        </div>
      </div>

      {showHistory ? (
        <Modal title="Wares history" onClose={() => setShowHistory(false)}>
          {history ? <HistoryChart data={history} height={520} yMinZero /> : <div>No data.</div>}
        </Modal>
      ) : null}
    </div>
  );
}


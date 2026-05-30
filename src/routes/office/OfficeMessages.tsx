import { useEffect, useMemo, useState } from "react";
import { client } from "../../api/client";
import type { Message } from "../../api/types";

export function OfficeMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newText, setNewText] = useState("");
  const [draftById, setDraftById] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const res = await client.getMessages();
      setMessages(res.messages);
      setDraftById((prev) => {
        const next = { ...prev };
        for (const m of res.messages) next[m.id] = m.text;
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

  const rows = useMemo(() => messages, [messages]);

  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>Messages</h1>
      {err ? <div style={{ marginBottom: 10, color: "var(--accent)" }}>Error: {err}</div> : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="new message"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            const text = newText.trim();
            if (!text) return;
            setBusy(true);
            try {
              await client.postMessage(text);
              setNewText("");
              await load();
            } finally {
              setBusy(false);
            }
          }}
          style={{
            font: "inherit",
            borderRadius: 10,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(0,0,0,0.22)",
            color: "var(--text)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((m) => {
          const draft = draftById[m.id] ?? m.text;
          return (
            <div
              key={m.id}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "var(--panel)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraftById((p) => ({ ...p, [m.id]: e.target.value }))}
                rows={2}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.2)",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ opacity: 0.7, fontSize: 12 }}>{m.id}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const text = draft.trim();
                      if (!text) return;
                      setBusy(true);
                      try {
                        await client.patchMessage(m.id, text);
                        await load();
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
                      setBusy(true);
                      try {
                        await client.deleteMessage(m.id);
                        await load();
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


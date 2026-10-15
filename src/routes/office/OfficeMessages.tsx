import { useEffect, useState } from "react";
import { client } from "../../api/client";
import type { Message } from "../../api/types";
import { omitKey } from "../../utils/omitKey";
import { toErrorMessage } from "../../utils/toErrorMessage";
import { useToast } from "./toast/useToast";

export function OfficeMessages() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newText, setNewText] = useState("");
  // Only messages the user has edited and not yet saved; others show server text.
  const [draftById, setDraftById] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const res = await client.getMessages();
      setMessages(res.messages);
      setErr(null);
    } catch (e) {
      setErr(toErrorMessage(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = messages;

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
              showToast("Message added");
            } catch (e) {
              showToast(`Couldn't add the message: ${toErrorMessage(e)}`, "error");
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
                        setDraftById((p) => omitKey(p, m.id));
                        await load();
                        showToast("Message saved");
                      } catch (e) {
                        showToast(`Couldn't save the message: ${toErrorMessage(e)}`, "error");
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
                        setDraftById((p) => omitKey(p, m.id));
                        await load();
                        showToast("Message deleted");
                      } catch (e) {
                        showToast(`Couldn't delete the message: ${toErrorMessage(e)}`, "error");
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


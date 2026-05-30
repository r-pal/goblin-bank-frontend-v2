import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setOfficeAuthed } from "./auth";
import { OfficeLoginP5 } from "./OfficeLoginP5";

export function OfficeLogin() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.length > 0 && secret.length > 0, [name, secret]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <OfficeLoginP5 />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name === "snivell" && secret === "sssh") {
            setOfficeAuthed(true);
            nav("/office/bank", { replace: true });
          } else {
            setError("No.");
          }
        }}
        style={{
          width: "min(420px, 92vw)",
          padding: 16,
          borderRadius: 14,
          background: "var(--panel)",
          backdropFilter: "blur(10px)",
          zIndex: 1,
        }}
      >
        <h1 style={{ margin: "0 0 12px 0" }}>Office</h1>

        <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
          <span>what&apos;s your name?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <span>what&apos;s your secret?</span>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            type="password"
            autoComplete="off"
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
          />
        </label>

        {error ? <div style={{ marginBottom: 10, color: "var(--accent)" }}>{error}</div> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.25)",
            color: "var(--text)",
            font: "inherit",
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}


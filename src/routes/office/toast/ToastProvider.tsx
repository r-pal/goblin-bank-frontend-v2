import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./ToastContext";
import styles from "./ToastStack.module.css";

type Toast = { id: number; message: string };

const TOAST_MS = 3_500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={styles.toast} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

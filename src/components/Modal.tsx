import { useEffect } from "react";
import styles from "./Modal.module.css";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
      <button className={styles.backdropBtn} type="button" onClick={onClose} aria-label="Close" />
    </div>
  );
}


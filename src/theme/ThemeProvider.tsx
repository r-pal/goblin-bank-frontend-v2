import React, { createContext, useEffect, useMemo, useState } from "react";
import { getScheduledMode, type ThemeMode } from "./themeSchedule";

export type { ThemeMode };
export type ThemeOverride = "auto" | "day" | "night";

type ThemeContextValue = {
  override: ThemeOverride;
  setOverride: (next: ThemeOverride) => void;
  mode: ThemeMode;
};

const STORAGE_KEY = "goblin-theme-override";

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function modeFromOverride(override: ThemeOverride): ThemeMode {
  if (override === "day") return "day";
  if (override === "night") return "night";
  return getScheduledMode(new Date());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<ThemeOverride>(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === "day" || raw === "night" || raw === "auto") return raw;
    return "auto";
  });

  const [mode, setMode] = useState<ThemeMode>(() => modeFromOverride(override));

  const setOverride = (next: ThemeOverride) => {
    setOverrideState(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  };

  useEffect(() => {
    setMode(modeFromOverride(override));
  }, [override]);

  useEffect(() => {
    if (override !== "auto") return;
    const id = window.setInterval(() => {
      setMode(getScheduledMode(new Date()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [override]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo(() => ({ override, setOverride, mode }), [override, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}


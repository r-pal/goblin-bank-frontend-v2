import { beforeEach, describe, expect, test } from "vitest";
import {
  authenticateOffice,
  canAccessOfficeBank,
  defaultOfficePath,
  getOfficeRole,
  setOfficeSession,
  verifySnivellSecret,
} from "./auth";

beforeEach(() => {
  sessionStorage.clear();
});

describe("office auth", () => {
  test("logs each user in with their own secret only", () => {
    expect(authenticateOffice("snivell", "sssh")).toBe("full");
    expect(authenticateOffice("pawn", "teehee")).toBe("pawn");
    expect(authenticateOffice("snivell", "teehee")).toBeNull();
  });

  test("remembers the role after login and forgets it after logout", () => {
    expect(getOfficeRole()).toBeNull();
    setOfficeSession("pawn");
    expect(getOfficeRole()).toBe("pawn");
    setOfficeSession(null);
    expect(getOfficeRole()).toBeNull();
  });

  test("ignores roles that weren't set by logging in", () => {
    sessionStorage.setItem("goblin-office-role", "full");
    expect(getOfficeRole()).toBeNull();

    sessionStorage.setItem("goblin-office-authed", "true");
    sessionStorage.setItem("goblin-office-role", "admin");
    expect(getOfficeRole()).toBeNull();
  });

  test("only the full role can open the bank, and each role has its own landing page", () => {
    expect(canAccessOfficeBank("full")).toBe(true);
    expect(canAccessOfficeBank("pawn")).toBe(false);
    expect(defaultOfficePath("full")).toBe("/office/bank");
    expect(defaultOfficePath("pawn")).toBe("/office/market");
  });

  test("only snivell's secret unlocks the reset", () => {
    expect(verifySnivellSecret("sssh")).toBe(true);
    expect(verifySnivellSecret("teehee")).toBe(false);
  });
});

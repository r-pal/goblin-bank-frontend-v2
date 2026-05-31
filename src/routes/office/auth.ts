export type OfficeRole = "full" | "pawn";

const AUTH_KEY = "goblin-office-authed";
const ROLE_KEY = "goblin-office-role";

const USERS: { name: string; secret: string; role: OfficeRole }[] = [
  { name: "snivell", secret: "sssh", role: "full" },
  { name: "pawn", secret: "teehee", role: "pawn" },
];

export function authenticateOffice(name: string, secret: string): OfficeRole | null {
  const match = USERS.find((u) => u.name === name && u.secret === secret);
  return match?.role ?? null;
}

export function isOfficeAuthed(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function getOfficeRole(): OfficeRole | null {
  if (!isOfficeAuthed()) return null;
  const role = sessionStorage.getItem(ROLE_KEY);
  return role === "full" || role === "pawn" ? role : null;
}

export function canAccessOfficeBank(role: OfficeRole | null = getOfficeRole()): boolean {
  return role === "full";
}

export function setOfficeSession(role: OfficeRole | null) {
  if (!role) {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    return;
  }
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(ROLE_KEY, role);
}

/** @deprecated Use setOfficeSession(null) */
export function setOfficeAuthed(authed: boolean) {
  if (!authed) setOfficeSession(null);
}

export function defaultOfficePath(role: OfficeRole): string {
  return role === "pawn" ? "/office/market" : "/office/bank";
}

export function verifySnivellSecret(secret: string): boolean {
  return USERS.some((u) => u.name === "snivell" && u.secret === secret);
}

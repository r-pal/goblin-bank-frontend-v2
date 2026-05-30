const KEY = "goblin-office-authed";

export function isOfficeAuthed(): boolean {
  return sessionStorage.getItem(KEY) === "true";
}

export function setOfficeAuthed(authed: boolean) {
  sessionStorage.setItem(KEY, authed ? "true" : "false");
}


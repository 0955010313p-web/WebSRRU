import { getToken } from "./api";

export function getUsernameFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.username === "string" ? payload.username : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getRoleFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function canManageActivities(): boolean {
  const role = getRoleFromToken();
  return role === "COORDINATOR" || role === "ADMIN";
}

export function isStudent(): boolean {
  return getRoleFromToken() === "STUDENT";
}

export function usesAppShell(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/dashboard") return true;
  if (pathname === "/suggestions") return true;
  if (pathname === "/special-hours") return true;
  if (pathname === "/amendments") return true;
  if (pathname.startsWith("/staff")) return true;
  if (pathname.startsWith("/activities")) return true;
  return false;
}

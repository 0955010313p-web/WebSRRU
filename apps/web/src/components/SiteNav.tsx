"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/api";
import { getUsernameFromToken } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    setLoggedIn(!!getToken());
    setDisplayName(getUsernameFromToken() ?? "User");
  }, [pathname]);

  const logout = () => {
    clearToken();
    setLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-[var(--background)] sticky top-0 z-40 border-b border-transparent">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-[var(--srru-green)]">
          SRRU Activities
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-[var(--srru-muted)]">
          <Link className="hover:text-[var(--srru-green-dark)]" href="/activities">
            กิจกรรม
          </Link>
          <Link className="hover:text-[var(--srru-green-dark)]" href="/faculty">
            คณะ
          </Link>
          {loggedIn && (
            <>
              <Link className="hover:text-[var(--srru-green-dark)]" href="/dashboard">
                แดชบอร์ด
              </Link>
              <Link className="hover:text-[var(--srru-green-dark)]" href="/scan">
                สแกน QR
              </Link>
            </>
          )}
          {!loggedIn ? (
            <>
              <Link className="hover:text-[var(--srru-green-dark)]" href="/login">
                เข้าสู่ระบบ
              </Link>
              <Link
                className="rounded-md bg-[var(--srru-green)] px-3 py-1.5 text-white shadow-sm ui-btn hover:bg-[var(--srru-green-dark)]"
                href="/register"
              >
                สมัคร
              </Link>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-800">{displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-[var(--srru-surface)] px-3 py-1.5 hover:bg-[var(--srru-surface)]"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

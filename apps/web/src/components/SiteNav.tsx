"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/api";
import { useEffect, useState } from "react";

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, [pathname]);

  const logout = () => {
    clearToken();
    setLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          SRRU Activities
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <Link className="hover:text-indigo-600" href="/activities">
            กิจกรรม
          </Link>
          {loggedIn && (
            <>
              <Link className="hover:text-indigo-600" href="/dashboard">
                แดชบอร์ด
              </Link>
              <Link className="hover:text-indigo-600" href="/scan">
                สแกน QR
              </Link>
            </>
          )}
          {!loggedIn ? (
            <>
              <Link className="hover:text-indigo-600" href="/login">
                เข้าสู่ระบบ
              </Link>
              <Link
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
                href="/register"
              >
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              ออกจากระบบ
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

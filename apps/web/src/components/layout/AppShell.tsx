"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearToken } from "@/lib/api";
import {
  canManageActivities,
  getUsernameFromToken,
  isLoggedIn,
  isStudent,
} from "@/lib/auth-client";

type Session = {
  loggedIn: boolean;
  student: boolean;
  staff: boolean;
};

type MenuItem = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  requireAuth?: "student" | "staff";
};

const BASE_MENU: MenuItem[] = [
  {
    href: "/activities",
    label: "กิจกรรม",
    match: (p) =>
      p === "/activities" ||
      (p.startsWith("/activities/") && !p.includes("/create") && !p.includes("/edit")),
  },
  {
    href: "/special-hours",
    label: "ยื่นขอชั่วโมงกิจกรรม",
    match: (p) => p === "/special-hours",
    requireAuth: "student",
  },
  {
    href: "/amendments",
    label: "คำร้องขอแก้ไข",
    match: (p) => p === "/amendments",
    requireAuth: "student",
  },
  { href: "/dashboard", label: "ตรวจสอบกิจกรรม", match: (p) => p === "/dashboard" },
  {
    href: "/activities/create",
    label: "สร้างกิจกรรม",
    match: (p) => p === "/activities/create",
    requireAuth: "staff",
  },
  {
    href: "/staff/review",
    label: "อนุมัติคำร้อง",
    match: (p) => p.startsWith("/staff"),
    requireAuth: "staff",
  },
  {
    href: "/suggestions",
    label: "คำแนะนำหรือข้อเสนอของนักศึกษา",
    match: (p) => p === "/suggestions",
  },
];

function filterMenu(items: MenuItem[], mounted: boolean, session: Session) {
  return items.filter((item) => {
    if (!item.requireAuth) return true;
    if (!mounted) return false;
    if (item.requireAuth === "student") return session.loggedIn && session.student;
    if (item.requireAuth === "staff") return session.loggedIn && session.staff;
    return true;
  });
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session>({
    loggedIn: false,
    student: false,
    staff: false,
  });
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    setMounted(true);
    setSession({
      loggedIn: isLoggedIn(),
      student: isStudent(),
      staff: canManageActivities(),
    });
    setDisplayName(getUsernameFromToken() ?? "User");
  }, [pathname]);

  useEffect(() => {
    const onStorage = () => {
      setSession({
        loggedIn: isLoggedIn(),
        student: isStudent(),
        staff: canManageActivities(),
      });
      setDisplayName(getUsernameFromToken() ?? "User");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const menu = useMemo(
    () => filterMenu(BASE_MENU, mounted, session),
    [mounted, session],
  );

  const logout = () => {
    clearToken();
    setSession({ loggedIn: false, student: false, staff: false });
    router.push("/login");
  };

  const navClass = (active: boolean) =>
    `rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px] flex items-center ${
      active
        ? "bg-[var(--srru-green-20)] font-semibold text-[var(--srru-green-dark)] border border-[var(--srru-card-border)]"
        : "text-[var(--foreground)] hover:bg-[var(--srru-green-10)] hover:text-[var(--srru-green-dark)]"
    }`;

  return (
    <div className="flex min-h-screen bg-[var(--srru-surface)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--srru-card-border)] bg-[var(--srru-sidebar)] md:flex lg:w-72">
        <div className="border-b border-[var(--srru-card-border)] px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/srru-logo.png"
              alt="ตรามหาวิทยาลัยราชภัฏสุรินทร์"
              width={56}
              height={56}
              priority
              className="rounded-full ring-2 ring-[var(--srru-purple-20)]"
            />
            <div>
              <p className="text-xs font-bold leading-tight text-[var(--srru-green-dark)]">
                มหาวิทยาลัยราชภัฏสุรินทร์
              </p>
              <p className="text-[11px] font-medium text-[var(--srru-purple)]">ระบบกิจกรรมนักศึกษา</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="เมนูหลัก">
          <Link href="/" className={navClass(pathname === "/")}>
            หน้าหลัก
          </Link>
          {menu.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.match(pathname))}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--srru-card-border)] bg-[var(--srru-header)]/95 backdrop-blur-sm">
          <div className="flex items-center justify-end gap-3 px-4 py-3 sm:gap-4 md:px-6">
            <Link href="/" className="mr-auto flex items-center gap-2 md:hidden">
              <Image
                src="/srru-logo.png"
                alt="SRRU"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-[var(--srru-purple-20)]"
              />
              <span className="text-sm font-bold text-[var(--srru-green-dark)]">SRRU</span>
            </Link>
            <div className="flex items-center gap-2 text-sm sm:gap-3">
              {mounted && session.loggedIn ? (
                <>
                  <span className="max-w-[120px] truncate font-semibold text-[var(--foreground)] sm:max-w-none">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="ui-btn min-h-[44px] rounded-lg border border-[var(--srru-card-border)] bg-[var(--srru-card)] px-3 py-2 text-[var(--foreground)] hover:bg-[var(--srru-purple-10)]"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="ui-btn inline-flex min-h-[44px] items-center rounded-lg border border-[var(--srru-card-border)] bg-[var(--srru-card)] px-3 py-2 text-[var(--foreground)] hover:bg-[var(--srru-green-10)]"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="ui-btn inline-flex min-h-[44px] items-center rounded-lg bg-[var(--srru-green)] px-3 py-2 font-medium text-white hover:bg-[var(--srru-green-dark)]"
                  >
                    สมัคร
                  </Link>
                </>
              )}
            </div>
          </div>
          <nav
            className="flex gap-1.5 overflow-x-auto border-t border-[var(--srru-card-border)] px-2 py-2 md:hidden"
            aria-label="เมนูมือถือ"
          >
            <Link
              href="/"
              className={`shrink-0 rounded-lg px-3 py-2.5 text-xs font-medium min-h-[44px] flex items-center ${
                pathname === "/"
                  ? "bg-[var(--srru-green-20)] text-[var(--srru-green-dark)]"
                  : "text-[var(--foreground)] hover:bg-[var(--srru-green-10)]"
              }`}
            >
              หน้าหลัก
            </Link>
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2.5 text-xs font-medium min-h-[44px] flex items-center ${
                  item.match(pathname)
                    ? "bg-[var(--srru-green-20)] text-[var(--srru-green-dark)]"
                    : "text-[var(--foreground)] hover:bg-[var(--srru-green-10)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

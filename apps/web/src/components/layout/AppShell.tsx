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

function SidebarLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
        active
          ? "bg-[var(--srru-purple-active)] font-semibold text-white shadow-inner"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span
        className={`nav-dot ${
          active ? "bg-[var(--srru-green-bright)] shadow-[0_0_6px_rgba(34,165,90,0.6)]" : "bg-white/35 group-hover:bg-white/60"
        }`}
      />
      <span className="leading-snug">{label}</span>
    </Link>
  );
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

  const mobileNavClass = (active: boolean) =>
    `shrink-0 flex min-h-[44px] items-center rounded-full px-4 py-2 text-xs font-medium transition-colors ${
      active
        ? "bg-white text-[var(--srru-purple-deep)] shadow-sm"
        : "bg-white/15 text-white hover:bg-white/25"
    }`;

  return (
    <div className="flex min-h-screen bg-[var(--srru-surface)]">
      {/* Sidebar — ม่วงเข้มแบบระบบมหาวิทยาลัย */}
      <aside className="hidden w-[260px] shrink-0 flex-col bg-[var(--srru-sidebar)] shadow-xl md:flex lg:w-[280px]">
        <div className="border-b border-white/10 px-5 py-6">
          <Link href="/" className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/srru-logo.png"
              alt="ตรามหาวิทยาลัยราชภัฏสุรินทร์"
              width={72}
              height={72}
              priority
              className="rounded-full ring-4 ring-white/20"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-white">
                ระบบกิจกรรมนักศึกษา
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/70">
                มหาวิทยาลัยราชภัฏสุรินทร์
              </p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="เมนูหลัก">
          <SidebarLink href="/" label="หน้าหลัก" active={pathname === "/"} />
          {menu.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={item.match(pathname)}
            />
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-center text-[10px] text-white/40">SRRU Student Activities</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — ขาวสะอาด มีเงา */}
        <header className="sticky top-0 z-30 bg-[var(--srru-header)] shadow-[0_2px_12px_rgba(74,45,122,0.08)]">
          {/* Mobile purple bar */}
          <div className="flex items-center gap-3 bg-[var(--srru-sidebar)] px-4 py-3 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/srru-logo.png"
                alt="SRRU"
                width={36}
                height={36}
                className="rounded-full ring-2 ring-white/30"
              />
              <div>
                <p className="text-xs font-bold text-white">ระบบกิจกรรมนักศึกษา</p>
                <p className="text-[10px] text-white/60">ม.ราชภัฏสุรินทร์</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 py-3 sm:gap-4 md:px-8">
            <div className="mr-auto hidden md:block">
              <p className="text-xs font-medium text-[var(--srru-muted)]">ยินดีต้อนรับ</p>
              <p className="text-sm font-bold text-[var(--srru-purple-deep)]">
                {mounted && session.loggedIn ? displayName : "ผู้ใช้งานทั่วไป"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm sm:gap-3">
              {mounted && session.loggedIn ? (
                <>
                  <span className="max-w-[120px] truncate rounded-full bg-[var(--srru-purple-10)] px-3 py-1.5 text-xs font-semibold text-[var(--srru-purple-deep)] sm:max-w-none md:hidden">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="ui-btn min-h-[44px] rounded-full border border-[var(--srru-card-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm hover:border-[var(--srru-purple)] hover:text-[var(--srru-purple)]"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="ui-btn inline-flex min-h-[44px] items-center rounded-full border border-[var(--srru-purple)] px-4 py-2 text-sm font-medium text-[var(--srru-purple)] hover:bg-[var(--srru-purple-10)]"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="ui-btn inline-flex min-h-[44px] items-center rounded-full bg-[var(--srru-green)] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[var(--srru-green-dark)]"
                  >
                    สมัคร
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile nav — scroll บนพื้นม่วง */}
          <nav
            className="flex gap-2 overflow-x-auto bg-[var(--srru-sidebar)] px-3 pb-3 md:hidden"
            aria-label="เมนูมือถือ"
          >
            <Link href="/" className={mobileNavClass(pathname === "/")}>
              หน้าหลัก
            </Link>
            {menu.map((item) => (
              <Link key={item.href} href={item.href} className={mobileNavClass(item.match(pathname))}>
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

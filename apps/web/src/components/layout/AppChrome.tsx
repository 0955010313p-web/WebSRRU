"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { AppShell } from "@/components/layout/AppShell";
import { usesAppShell } from "@/lib/shell-routes";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (usesAppShell(pathname)) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}

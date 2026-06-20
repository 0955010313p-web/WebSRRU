"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { canManageActivities, isLoggedIn } from "@/lib/auth-client";

type Props = {
  children: React.ReactNode;
  loginNext?: string;
};

/** อนุญาตเฉพาะ COORDINATOR / ADMIN */
export function StaffGuard({ children, loginNext = "/activities/create" }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }
    if (!canManageActivities()) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router, loginNext]);

  if (!allowed) {
    return (
      <p className="py-12 text-center text-sm text-[var(--srru-muted)]">
        กำลังตรวจสอบสิทธิ์…
      </p>
    );
  }

  return <>{children}</>;
}

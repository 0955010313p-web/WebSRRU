"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, isStudent } from "@/lib/auth-client";

type Props = {
  children: React.ReactNode;
  loginNext: string;
};

/** อนุญาตเฉพาะนักศึกษาที่ล็อกอินแล้ว */
export function StudentGuard({ children, loginNext }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }
    if (!isStudent()) {
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

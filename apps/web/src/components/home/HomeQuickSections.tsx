"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import {
  canManageActivities,
  isLoggedIn,
  isStudent,
} from "@/lib/auth-client";

type Section = {
  title: string;
  description: string;
  href: string;
  cta: string;
  dotColor: string;
  iconBg: string;
  needsLogin: boolean;
};

export function HomeQuickSections() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const sections = useMemo(() => {
    if (!ready) return [];

    const list: Section[] = [
      {
        title: "ตรวจสอบการเข้าร่วมกิจกรรม",
        description: "ดูชั่วโมงสะสม สถานะการลงทะเบียน และผลการเช็คชื่อ",
        href: "/dashboard",
        cta: "ไปแดชบอร์ด",
        dotColor: "bg-[var(--srru-green-bright)]",
        iconBg: "bg-[var(--srru-green-10)]",
        needsLogin: true,
      },
    ];

    if (isLoggedIn() && isStudent()) {
      list.push(
        {
          title: "ยื่นขอชั่วโมงกิจกรรม",
          description:
            "กิจกรรมที่ไม่อยู่ในระบบ แต่เข้าร่วมแล้วและมีประโยชน์ต่อมหาวิทยาลัย — รอผู้ประสานงานพิจารณา",
          href: "/special-hours",
          cta: "ยื่นคำขอ",
          dotColor: "bg-[var(--srru-green-bright)]",
          iconBg: "bg-[var(--srru-green-10)]",
          needsLogin: true,
        },
        {
          title: "คำร้องขอแก้ไข",
          description: "แจ้งแก้ไขข้อมูลการลงทะเบียนหรือการเข้าร่วมกิจกรรม",
          href: "/amendments",
          cta: "ส่งคำร้อง",
          dotColor: "bg-[var(--srru-purple)]",
          iconBg: "bg-[var(--srru-purple-10)]",
          needsLogin: true,
        },
      );
    }

    if (isLoggedIn() && canManageActivities()) {
      list.push({
        title: "สร้างกิจกรรม",
        description: "สำหรับผู้ประสานงาน — กำหนดรายละเอียดและเผยแพร่กิจกรรม",
        href: "/activities/create",
        cta: "สร้างกิจกรรมใหม่",
        dotColor: "bg-[var(--srru-purple)]",
        iconBg: "bg-[var(--srru-purple-10)]",
        needsLogin: true,
      });
    }

    list.push({
      title: "คำแนะนำจากนักศึกษา",
      description: "เสนอแนะหรือแจ้งความต้องการกิจกรรมที่อยากให้จัดขึ้น",
      href: "/suggestions",
      cta: "ส่งข้อเสนอ",
      dotColor: "bg-[var(--srru-yellow)]",
      iconBg: "bg-amber-50",
      needsLogin: true,
    });

    return list;
  }, [ready]);

  const handleClick = (href: string, needsLogin: boolean) => {
    if (needsLogin && !isLoggedIn()) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  if (!ready) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-44 animate-pulse rounded-2xl bg-white/60 shadow-[var(--srru-card-shadow)]"
          />
        ))}
      </div>
    );
  }

  return (
    <section>
      <h2 className="section-title mb-4">เมนูลัด</h2>
      <div
        className={`grid gap-4 md:items-stretch ${
          sections.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {sections.map((s) => (
          <Card key={s.title} className="flex flex-col border-0 p-0 shadow-[var(--srru-card-shadow)]">
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}
                >
                  <span className={`nav-dot ${s.dotColor}`} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--srru-muted)]">
                    {s.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleClick(s.href, s.needsLogin)}
                className="ui-btn mt-5 w-full rounded-full bg-[var(--srru-green)] px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-[var(--srru-green-dark)]"
              >
                {s.cta}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

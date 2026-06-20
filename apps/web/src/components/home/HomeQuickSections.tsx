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
  accent: string;
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
        accent: "border-t-4 border-[var(--srru-green)]",
        needsLogin: true,
      },
    ];

    if (isLoggedIn() && isStudent()) {
      list.push(
        {
          title: "ยื่นขอชั่วโมงกิจกรรม",
          description: "กิจกรรมที่ไม่อยู่ในระบบ แต่เข้าร่วมแล้วและมีประโยชน์ต่อมหาวิทยาลัย — รอผู้ประสานงานพิจารณา",
          href: "/special-hours",
          cta: "ยื่นคำขอ",
          accent: "border-t-4 border-[var(--srru-green)]",
          needsLogin: true,
        },
        {
          title: "คำร้องขอแก้ไข",
          description: "แจ้งแก้ไขข้อมูลการลงทะเบียนหรือการเข้าร่วมกิจกรรม",
          href: "/amendments",
          cta: "ส่งคำร้อง",
          accent: "border-t-4 border-[var(--srru-purple)]",
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
        accent: "border-t-4 border-[var(--srru-purple)]",
        needsLogin: true,
      });
    }

    list.push({
      title: "คำแนะนำจากนักศึกษา",
      description: "เสนอแนะหรือแจ้งความต้องการกิจกรรมที่อยากให้จัดขึ้น",
      href: "/suggestions",
      cta: "ส่งข้อเสนอ",
      accent: "border-t-4 border-[var(--srru-yellow)]",
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

  if (!ready) return null;

  return (
    <div
      className={`grid gap-4 md:items-stretch ${
        sections.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {sections.map((s) => (
        <Card key={s.title} className={`flex flex-col p-6 ${s.accent}`}>
          <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--srru-muted)]">
            {s.description}
          </p>
          <button
            type="button"
            onClick={() => handleClick(s.href, s.needsLogin)}
            className="ui-btn mt-6 w-full rounded-lg bg-[var(--srru-green)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--srru-green-dark)]"
          >
            {s.cta}
          </button>
        </Card>
      ))}
    </div>
  );
}

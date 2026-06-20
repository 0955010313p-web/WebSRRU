"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth-client";
import Card from "@/components/ui/Card";
import { levelLabel, natureLabel } from "@/data/srru-rules";

type Activity = {
  id: string;
  title: string;
  description: string;
  hours: number;
  nature: string;
  level: string;
  eligibleYears?: number[] | null;
  leaderOnly?: boolean;
  studentProgram?: string | null;
  startTime: string;
};

type StudentProfile = {
  yearLevel: number;
  studentType: string;
};

export function HomeActivitiesList() {
  const router = useRouter();
  const [list, setList] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [filter, setFilter] = useState<"all" | "CORE_REQUIRED" | "ELECTIVE_REQUIRED">("all");

  useEffect(() => {
    const load = async () => {
      setLoggedIn(isLoggedIn());
      try {
        let query = "";
        if (isLoggedIn()) {
          try {
            const me = await apiFetch<StudentProfile>("/students/me");
            query = `?yearLevel=${me.yearLevel}&studentType=${me.studentType}`;
          } catch {
            /* แสดงทั้งหมดถ้าโหลดโปรไฟล์ไม่ได้ */
          }
        }
        const data = await apiFetch<Activity[]>(`/activities${query}`, { auth: false });
        setList(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      }
    };
    load();
  }, []);

  const goRegister = (activityId: string) => {
    if (!isLoggedIn()) {
      router.push(`/login?next=/activities/${activityId}`);
      return;
    }
    router.push(`/activities/${activityId}`);
  };

  const filtered =
    filter === "all" ? list : list.filter((a) => a.nature === filter);

  return (
    <section id="activities" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">กิจกรรมที่เปิดรับสมัคร</h1>
          <p className="mt-1 text-sm text-[var(--srru-muted)]">
            ตามประกาศ ม.ราชภัฏสุรินทร์ — บังคับแกน 6 ชม. · บังคับเลือก 5 ชม.
          </p>
        </div>
        <Link href="/activities" className="text-sm text-[var(--srru-purple)] hover:underline">
          ดูทั้งหมด
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "ทั้งหมด"],
            ["CORE_REQUIRED", "บังคับแกน"],
            ["ELECTIVE_REQUIRED", "บังคับเลือก"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === key
                ? "bg-[var(--srru-green)] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Card key={a.id} className="flex flex-col p-5">
            <div className="flex flex-wrap gap-1">
              <span className="rounded bg-[var(--srru-purple-10)] px-2 py-0.5 text-[10px] font-medium text-[var(--srru-purple)]">
                {natureLabel(a.nature)}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {levelLabel(a.level)}
              </span>
              {a.leaderOnly && (
                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">
                  ผู้นำ/ตัวแทน
                </span>
              )}
            </div>
            <h2 className="mt-2 font-semibold text-slate-900">{a.title}</h2>
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-700">{a.description}</p>
            <p className="mt-3 text-xs text-[var(--srru-muted)]">
              {Array.isArray(a.eligibleYears) && a.eligibleYears.length > 0
                ? `ชั้นปีที่ ${a.eligibleYears.join(", ")} · `
                : ""}
              {new Date(a.startTime).toLocaleString("th-TH")} · {a.hours} ชม.
            </p>
            <button
              type="button"
              onClick={() => goRegister(a.id)}
              className="ui-btn mt-4 w-full rounded-lg bg-[var(--srru-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--srru-green-dark)]"
            >
              ลงทะเบียนกิจกรรม
            </button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !error && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-[var(--srru-muted)]">
          ยังไม่มีกิจกรรมในหมวดนี้ — รัน seed ที่ API หรือรอเจ้าหน้าที่เผยแพร่กิจกรรม
        </p>
      )}

      {!loggedIn && filtered.length > 0 && (
        <p className="mt-3 text-center text-xs text-[var(--srru-muted)]">
          ต้องเข้าสู่ระบบก่อนจึงจะลงทะเบียนได้
        </p>
      )}
    </section>
  );
}

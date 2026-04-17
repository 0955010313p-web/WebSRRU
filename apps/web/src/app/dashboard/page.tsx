"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";
import Link from "next/link";

type Hours = {
  totalHours: number;
  targetHours: number;
  approvedActivityCount: number;
  minActivitiesRequired: number;
  meetsHourTarget: boolean;
  meetsActivityCount: boolean;
  evaluationReady: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export default function DashboardPage() {
  const [hours, setHours] = useState<Hours | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [certLoading, setCertLoading] = useState(false);

  const downloadCertificate = async () => {
    const t = getToken();
    if (!t) return;
    setCertLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/certificates/me/participation.pdf`,
        { headers: { Authorization: `Bearer ${t}` } },
      );
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "participation-certificate.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setCertLoading(false);
    }
  };

  useEffect(() => {
    apiFetch<Hours>("/students/me/hours")
      .then(setHours)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-800">
        {error}{" "}
        <Link href="/login" className="underline">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (!hours) {
    return <p className="text-slate-700">กำลังโหลด…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ดนักศึกษา</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
          <p className="text-sm text-slate-700">ชั่วโมงสะสมที่นับแล้ว</p>
          <p className="mt-2 text-3xl font-semibold">
            {hours.totalHours} / {hours.targetHours}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
          <p className="text-sm text-slate-700">จำนวนกิจกรรม (อนุมัติแล้ว)</p>
          <p className="mt-2 text-3xl font-semibold">
            {hours.approvedActivityCount} / {hours.minActivitiesRequired}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
        <p className="font-medium">
          สถานะเกณฑ์สำเร็จการศึกษา (เบื้องต้น):{" "}
          <span
            className={
              hours.evaluationReady ? "text-emerald-600" : "text-amber-600"
            }
          >
            {hours.evaluationReady ? "ครบเงื่อนไขหลัก" : "ยังไม่ครบเงื่อนไข"}
          </span>
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
          <li>ชั่วโมง: {hours.meetsHourTarget ? "ผ่าน" : "ยังไม่ผ่าน"}</li>
          <li>
            จำนวนกิจกรรม:{" "}
            {hours.meetsActivityCount ? "ผ่าน" : "ยังไม่ผ่าน"}
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/activities"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            ไปลงทะเบียนกิจกรรม
          </Link>
          {hours.evaluationReady && (
            <button
              type="button"
              onClick={downloadCertificate}
              disabled={certLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {certLoading ? "กำลังสร้างไฟล์…" : "ดาวน์โหลดใบรับรอง (PDF)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

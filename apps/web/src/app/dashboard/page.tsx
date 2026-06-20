"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type YearTarget = {
  year: number;
  minActivities: number;
  minHours: number;
  isCurrentYear: boolean;
};

type Hours = {
  totalHours: number;
  targetHours: number;
  approvedActivityCount: number;
  minActivitiesRequired: number;
  meetsHourTarget: boolean;
  meetsActivityCount: boolean;
  evaluationReady: boolean;
  programLabel?: string;
  yearLevel?: number;
  yearlyTargets?: YearTarget[];
  rulesReference?: string;
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
      {hours.programLabel && (
        <p className="text-sm text-[var(--srru-muted)]">
          {hours.programLabel}
          {hours.yearLevel ? ` · ชั้นปีที่ ${hours.yearLevel}` : ""}
          {hours.rulesReference ? ` · ${hours.rulesReference}` : ""}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-[var(--srru-muted)]">ชั่วโมงสะสมที่นับแล้ว</p>
          <p className="mt-2 text-3xl font-semibold">
            {hours.totalHours} / {hours.targetHours}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-[var(--srru-muted)]">จำนวนกิจกรรม (อนุมัติแล้ว)</p>
          <p className="mt-2 text-3xl font-semibold">
            {hours.approvedActivityCount} / {hours.minActivitiesRequired}
          </p>
        </Card>
      </div>
      {hours.yearlyTargets && hours.yearlyTargets.length > 0 && (
        <Card className="p-6">
          <p className="mb-3 text-sm font-medium text-slate-800">เป้าหมายรายชั้นปี (ตามประกาศ)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--srru-muted)]">
                  <th className="py-2 pr-4">ชั้นปี</th>
                  <th className="py-2 pr-4">กิจกรรมขั้นต่ำ</th>
                  <th className="py-2">ชั่วโมงขั้นต่ำ</th>
                </tr>
              </thead>
              <tbody>
                {hours.yearlyTargets.map((y) => (
                  <tr
                    key={y.year}
                    className={y.isCurrentYear ? "bg-[var(--srru-green-10)] font-medium" : ""}
                  >
                    <td className="py-2 pr-4">ปี {y.year}</td>
                    <td className="py-2 pr-4">{y.minActivities}</td>
                    <td className="py-2">{y.minHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Card className="p-6">
        <p className="font-medium">
          สถานะเกณฑ์สำเร็จการศึกษา (เบื้องต้น):{" "}
          <span className={hours.evaluationReady ? "text-[var(--srru-green)]" : "text-[var(--srru-yellow)]"}>
            {hours.evaluationReady ? "ครบเงื่อนไขหลัก" : "ยังไม่ครบเงื่อนไข"}
          </span>
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-[var(--srru-muted)]">
          <li>ชั่วโมง: {hours.meetsHourTarget ? "ผ่าน" : "ยังไม่ผ่าน"}</li>
          <li>
            จำนวนกิจกรรม: {" "}
            {hours.meetsActivityCount ? "ผ่าน" : "ยังไม่ผ่าน"}
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/activities">
            <Button>ไปลงทะเบียนกิจกรรม</Button>
          </Link>
          {hours.evaluationReady && (
            <Button type="button" onClick={downloadCertificate} disabled={certLoading}>
              {certLoading ? "กำลังสร้างไฟล์…" : "ดาวน์โหลดใบรับรอง (PDF)"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

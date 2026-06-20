"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StaffGuard } from "@/components/auth/StaffGuard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type SpecialPending = {
  id: string;
  title: string;
  description: string;
  hoursAsked: number;
  student: { firstName: string; lastName: string; studentCode: string };
};

type AmendmentPending = {
  id: string;
  reason: string;
  registration: {
    student: { firstName: string; lastName: string; studentCode: string };
    activity: { title: string };
  };
};

function ReviewContent() {
  const [specials, setSpecials] = useState<SpecialPending[]>([]);
  const [amendments, setAmendments] = useState<AmendmentPending[]>([]);
  const [decidedHours, setDecidedHours] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      apiFetch<SpecialPending[]>("/special-hours/pending"),
      apiFetch<AmendmentPending[]>("/amendments/pending"),
    ])
      .then(([s, a]) => {
        setSpecials(s);
        setAmendments(a);
      })
      .catch((e) => setMsg(e instanceof Error ? e.message : "โหลดไม่สำเร็จ"));
  };

  useEffect(() => {
    load();
  }, []);

  const resolveSpecial = async (id: string, status: "APPROVED" | "REJECTED") => {
    setMsg(null);
    try {
      await apiFetch(`/special-hours/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          decidedHours:
            status === "APPROVED" ? Number(decidedHours[id] || specials.find((s) => s.id === id)?.hoursAsked) : undefined,
        }),
      });
      setMsg(status === "APPROVED" ? "อนุมัติชั่วโมงแล้ว" : "ปฏิเสธคำขอแล้ว");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    }
  };

  const resolveAmendment = async (id: string, status: "APPROVED" | "REJECTED") => {
    setMsg(null);
    try {
      await apiFetch(`/amendments/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMsg(status === "APPROVED" ? "อนุมัติคำร้องแล้ว" : "ปฏิเสธคำร้องแล้ว");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">อนุมัติคำร้อง</h1>
        <p className="mt-2 text-sm text-[var(--srru-muted)]">
          สำหรับผู้ประสานงาน/เจ้าหน้าที่ — พิจารณาคำขอชั่วโมงกิจกรรมนอกระบบและคำร้องขอแก้ไข
        </p>
        {msg && <p className="mt-2 text-sm text-[var(--srru-green)]">{msg}</p>}
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">คำขอชั่วโมงกิจกรรมนอกระบบ (รอพิจารณา {specials.length})</h2>
        {specials.length === 0 ? (
          <p className="text-sm text-[var(--srru-muted)]">ไม่มีคำขอค้าง</p>
        ) : (
          <ul className="space-y-4">
            {specials.map((s) => (
              <li key={s.id} className="rounded-lg border border-slate-100 p-4 text-sm">
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-[var(--srru-muted)]">
                  {s.student.firstName} {s.student.lastName} ({s.student.studentCode})
                </p>
                <p className="mt-2">{s.description}</p>
                <p className="mt-1 text-xs">ขอ {s.hoursAsked} ชม.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="ชม.ที่ให้"
                    value={decidedHours[s.id] ?? String(s.hoursAsked)}
                    onChange={(e) =>
                      setDecidedHours((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    className="w-24 rounded border border-slate-200 px-2 py-1 text-sm"
                  />
                  <Button type="button" onClick={() => resolveSpecial(s.id, "APPROVED")}>
                    อนุมัติชั่วโมง
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => resolveSpecial(s.id, "REJECTED")}>
                    ไม่อนุมัติ
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">คำร้องขอแก้ไข (รอพิจารณา {amendments.length})</h2>
        {amendments.length === 0 ? (
          <p className="text-sm text-[var(--srru-muted)]">ไม่มีคำร้องค้าง</p>
        ) : (
          <ul className="space-y-4">
            {amendments.map((a) => (
              <li key={a.id} className="rounded-lg border border-slate-100 p-4 text-sm">
                <p className="font-medium">{a.registration.activity.title}</p>
                <p className="text-xs text-[var(--srru-muted)]">
                  {a.registration.student.firstName} {a.registration.student.lastName} (
                  {a.registration.student.studentCode})
                </p>
                <p className="mt-2">{a.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" onClick={() => resolveAmendment(a.id, "APPROVED")}>
                    อนุมัติ
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => resolveAmendment(a.id, "REJECTED")}>
                    ไม่อนุมัติ
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function StaffReviewPage() {
  return (
    <StaffGuard loginNext="/staff/review">
      <ReviewContent />
    </StaffGuard>
  );
}

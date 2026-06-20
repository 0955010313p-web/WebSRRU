"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StudentGuard } from "@/components/auth/StudentGuard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Registration = {
  id: string;
  status: string;
  activity: { title: string; hours: number };
};

type Amendment = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  registration: { activity: { title: string } };
};

const STATUS: Record<string, string> = {
  PENDING: "รอพิจารณา",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ไม่อนุมัติ",
};

function AmendmentsContent() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [list, setList] = useState<Amendment[]>([]);
  const [registrationId, setRegistrationId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    apiFetch<{ registrations: Registration[] }>("/students/me/transcript")
      .then((t) => setRegs(t.registrations))
      .catch(() => setRegs([]));
    apiFetch<Amendment[]>("/amendments/me")
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ"));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/amendments", {
        method: "POST",
        body: JSON.stringify({ registrationId, reason }),
      });
      setReason("");
      setRegistrationId("");
      setMsg("ส่งคำร้องขอแก้ไขเรียบร้อย — รอผู้ประสานงานพิจารณา");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งคำร้องไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คำร้องขอแก้ไขกิจกรรม</h1>
        <p className="mt-2 text-sm text-[var(--srru-muted)]">
          ใช้เมื่อข้อมูลการลงทะเบียน/การเข้าร่วมกิจกรรมไม่ถูกต้อง ต้องการให้ผู้ประสานงานตรวจสอบและแก้ไข
          (ตามระบบ Amendment Request ในเอกสารวิจัย)
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">กิจกรรมที่ต้องการแก้ไข</label>
            <select
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">— เลือกกิจกรรม —</option>
              {regs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.activity.title} ({r.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">เหตุผล / รายละเอียดที่ต้องการแก้</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="เช่น เช็คชื่อแล้วแต่สถานะยังไม่อัปเดต"
            />
          </div>
          {msg && <p className="text-sm text-[var(--srru-green)]">{msg}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || regs.length === 0}>
            {loading ? "กำลังส่ง…" : "ส่งคำร้องขอแก้ไข"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">คำร้องของฉัน</h2>
        {list.length === 0 ? (
          <p className="text-sm text-[var(--srru-muted)]">ยังไม่มีคำร้อง</p>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id} className="rounded-lg border border-slate-100 p-4 text-sm">
                <p className="font-medium">{a.registration.activity.title}</p>
                <p className="mt-1 text-[var(--srru-muted)]">{a.reason}</p>
                <p className="mt-2 text-xs">
                  สถานะ:{" "}
                  <span
                    className={
                      a.status === "APPROVED"
                        ? "text-[var(--srru-green)]"
                        : a.status === "REJECTED"
                          ? "text-red-600"
                          : "text-amber-600"
                    }
                  >
                    {STATUS[a.status] ?? a.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function AmendmentsPage() {
  return (
    <StudentGuard loginNext="/amendments">
      <AmendmentsContent />
    </StudentGuard>
  );
}

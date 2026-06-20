"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StudentGuard } from "@/components/auth/StudentGuard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type SpecialRequest = {
  id: string;
  title: string;
  description: string;
  hoursAsked: number;
  decidedHours: number | null;
  status: string;
  createdAt: string;
};

const STATUS: Record<string, string> = {
  PENDING: "รอพิจารณา",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ไม่อนุมัติ",
};

function SpecialHoursContent() {
  const [list, setList] = useState<SpecialRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hoursAsked, setHoursAsked] = useState("5");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    apiFetch<SpecialRequest[]>("/special-hours/me")
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
      await apiFetch("/special-hours", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          hoursAsked: Number(hoursAsked),
        }),
      });
      setTitle("");
      setDescription("");
      setHoursAsked("5");
      setMsg("ยื่นคำขอเรียบร้อย — รอผู้ประสานงานพิจารณา");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยื่นคำขอไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ยื่นขอชั่วโมงกิจกรรม</h1>
        <p className="mt-2 text-sm text-[var(--srru-muted)]">
          สำหรับกิจกรรมที่<strong>ไม่อยู่ในระบบลงทะเบียน</strong> แต่นักศึกษาเข้าร่วมแล้ว
          และมีประโยชน์ต่อมหาวิทยาลัย ตามเกณฑ์ประกาศ (ข้อ 10, 13) — ไม่จำกัดแค่กิจกรรมนอกสถานที่
          ผู้ประสานงาน/เจ้าหน้าที่จะพิจารณาให้ชั่วโมงหรือไม่ให้ชั่วโมง
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อกิจกรรม</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">รายละเอียด / หลักฐานที่มี</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="อธิบายกิจกรรม สถานที่ วันที่ และประโยชน์ที่ได้รับ"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ชั่วโมงที่ขอพิจารณา</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={hoursAsked}
              onChange={(e) => setHoursAsked(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-[var(--srru-green)]">{msg}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังส่ง…" : "ยื่นคำขอชั่วโมงกิจกรรม"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">คำขอของฉัน</h2>
        {list.length === 0 ? (
          <p className="text-sm text-[var(--srru-muted)]">ยังไม่มีคำขอ</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 p-4 text-sm">
                <p className="font-medium">{r.title}</p>
                <p className="mt-1 text-[var(--srru-muted)]">{r.description}</p>
                <p className="mt-2 text-xs">
                  ขอ {r.hoursAsked} ชม. · สถานะ:{" "}
                  <span
                    className={
                      r.status === "APPROVED"
                        ? "text-[var(--srru-green)]"
                        : r.status === "REJECTED"
                          ? "text-red-600"
                          : "text-amber-600"
                    }
                  >
                    {STATUS[r.status] ?? r.status}
                  </span>
                  {r.status === "APPROVED" && r.decidedHours != null && (
                    <> · ได้รับ {r.decidedHours} ชม.</>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function SpecialHoursPage() {
  return (
    <StudentGuard loginNext="/special-hours">
      <SpecialHoursContent />
    </StudentGuard>
  );
}

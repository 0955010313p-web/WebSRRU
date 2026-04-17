"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ScanPage() {
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const data = JSON.parse(raw) as { activityId: string; qrSecret: string };
      if (!data.activityId || !data.qrSecret) {
        throw new Error("ต้องมี activityId และ qrSecret");
      }
      await apiFetch("/attendances/check-in", {
        method: "POST",
        body: JSON.stringify({
          activityId: data.activityId,
          qrSecret: data.qrSecret,
        }),
      });
      setMsg("เช็คชื่อสำเร็จ — รอเจ้าหน้าที่อนุมัติชั่วโมง");
      setRaw("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "สแกนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
      <h1 className="text-xl font-semibold">เช็คชื่อด้วย QR (ทดสอบ)</h1>
      <p className="text-sm text-slate-700">
        วาง JSON จาก API{" "}
        <code className="rounded bg-slate-100 px-1">GET /activities/:id/qr</code>{" "}
        (ต้องเป็นผู้ประสานงาน) หรือสแกนจากแอปอ่าน QR ที่ฝั่งคุณแปลงเป็น JSON
        นี้
      </p>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          className="h-32 w-full rounded-md border border-slate-300 p-2 font-mono text-sm"
          placeholder='{"activityId":"...","qrSecret":"...","v":1}'
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-white disabled:opacity-50"
        >
          {loading ? "กำลังส่ง…" : "ยืนยันเช็คชื่อ"}
        </button>
      </form>
      {msg && <p className="text-sm text-slate-800">{msg}</p>}
    </div>
  );
}

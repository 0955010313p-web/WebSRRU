"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { StaffGuard } from "@/components/auth/StaffGuard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CreateActivityPage() {
  return (
    <StaffGuard loginNext="/activities/create">
      <CreateActivityForm />
    </StaffGuard>
  );
}

function CreateActivityForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("2");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/activities", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          category: "CULTURE",
          nature: "CORE_REQUIRED",
          level: "UNIVERSITY",
          hours: Number(hours),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          status: "DRAFT",
        }),
      });
      router.push("/activities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างกิจกรรมไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/activities" className="text-sm text-[var(--srru-purple)] hover:underline">
        ← กลับรายการกิจกรรม
      </Link>
      <h1 className="text-2xl font-bold">สร้างกิจกรรม</h1>
      <p className="text-sm text-[var(--srru-muted)]">
        สำหรับผู้ประสานงาน/เจ้าหน้าที่ — ตามบทบาทในเอกสารวิจัย (ผู้ประสานงานกิจกรรม)
      </p>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อกิจกรรม</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">รายละเอียด</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ชั่วโมง</label>
            <Input
              type="number"
              min={1}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">เริ่ม</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">สิ้นสุด</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก…" : "บันทึกกิจกรรม"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

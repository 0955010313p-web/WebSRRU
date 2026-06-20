"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StaffGuard } from "@/components/auth/StaffGuard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Activity = {
  id: string;
  title: string;
  description: string;
  hours: number;
  nature: string;
  level: string;
  category: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function EditActivityPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <StaffGuard loginNext={`/activities/${id}/edit`}>
      <EditActivityForm id={id} />
    </StaffGuard>
  );
}

function EditActivityForm({ id }: { id: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("6");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Activity>(`/activities/${id}`, { auth: false })
      .then((a) => {
        setTitle(a.title);
        setDescription(a.description);
        setHours(String(a.hours));
        setStatus(a.status);
        setStartTime(toLocalInput(a.startTime));
        setEndTime(toLocalInput(a.endTime));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ"));
  }, [id, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/activities/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description,
          hours: Number(hours),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          status,
        }),
      });
      router.push("/activities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/activities" className="text-sm text-[var(--srru-purple)] hover:underline">
        ← กลับรายการกิจกรรม
      </Link>
      <h1 className="text-2xl font-bold">แก้ไขกิจกรรม</h1>
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
          <div>
            <label className="mb-1 block text-sm font-medium">สถานะ</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="DRAFT">ร่าง</option>
              <option value="PUBLISHED">เผยแพร่</option>
              <option value="ONGOING">กำลังดำเนินการ</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
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
            {loading ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

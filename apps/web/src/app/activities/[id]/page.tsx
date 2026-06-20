"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth-client";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string;
  hours: number;
  startTime: string;
  endTime: string;
};

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Activity>(`/activities/${id}`, { auth: false })
      .then(setActivity)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [id]);

  const register = async () => {
    if (!isLoggedIn()) {
      router.push(`/login?next=/activities/${id}`);
      return;
    }
    setMsg(null);
    setLoading(true);
    try {
      await apiFetch("/registrations", {
        method: "POST",
        body: JSON.stringify({ activityId: id }),
      });
      setMsg("ลงทะเบียนเรียบร้อย");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ลงทะเบียนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!activity) {
    return <p>กำลังโหลด…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
      <Link href="/activities" className="text-sm text-indigo-600">
        ← กลับ
      </Link>
      <h1 className="text-2xl font-bold">{activity.title}</h1>
      <p className="whitespace-pre-wrap text-slate-800">{activity.description}</p>
      <p className="text-sm text-slate-700">
        เวลา: {new Date(activity.startTime).toLocaleString("th-TH")} —{" "}
        {activity.hours} ชั่วโมง
      </p>
      {msg && <p className="text-sm text-indigo-700">{msg}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={register}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          ลงทะเบียน
        </button>
        <button
          type="button"
          onClick={() => router.push("/scan")}
          className="rounded-lg border border-slate-300 px-4 py-2"
        >
          ไปหน้าสแกน QR
        </button>
      </div>
    </div>
  );
}

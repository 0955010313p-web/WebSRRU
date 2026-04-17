"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  startTime: string;
  endTime: string;
  status: string;
};

export default function ActivitiesPage() {
  const [list, setList] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Activity[]>("/activities", { auth: false })
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">กิจกรรมที่เปิดรับสมัคร</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => (
          <article
            key={a.id}
            className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900"
          >
            <h2 className="font-semibold text-slate-900">{a.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-slate-800">
              {a.description}
            </p>
            <p className="mt-3 text-xs text-slate-700">
              {new Date(a.startTime).toLocaleString("th-TH")} — {a.hours}{" "}
              ชม.
            </p>
            <Link
              href={`/activities/${a.id}`}
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              รายละเอียด / ลงทะเบียน
            </Link>
          </article>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-slate-700">ยังไม่มีกิจกรรมที่เผยแพร่</p>
      )}
    </div>
  );
}

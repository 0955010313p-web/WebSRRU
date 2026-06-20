"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth-client";
import Card from "@/components/ui/Card";
import { levelLabel, natureLabel } from "@/data/srru-rules";
import type { ActivityItem } from "@/components/activities/ActivitiesList";

const SLIDE_MS = 5000;

export function HomeFeaturedCarousel() {
  const router = useRouter();
  const [slides, setSlides] = useState<ActivityItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch<ActivityItem[]>("/activities", { auth: false })
      .then((data) => {
        const featured = data
          .filter((a) => a.nature === "CORE_REQUIRED")
          .slice(0, 3);
        setSlides(featured.length > 0 ? featured : data.slice(0, 3));
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const goRegister = (id: string) => {
    if (!isLoggedIn()) {
      router.push(`/login?next=/activities/${id}`);
      return;
    }
    router.push(`/activities/${id}`);
  };

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">กิจกรรมแนะนำ</h2>
        <Link href="/activities" className="text-xs text-[var(--srru-purple)] hover:underline">
          ดูกิจกรรมทั้งหมด →
        </Link>
      </div>
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-[var(--srru-purple-10)] px-2 py-0.5 text-xs font-medium text-[var(--srru-purple)]">
            {natureLabel(current.nature)}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {levelLabel(current.level)}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold text-slate-900 md:text-2xl">{current.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-700">{current.description}</p>
        <p className="mt-3 text-xs text-[var(--srru-muted)]">
          {current.hours} ชั่วโมง · {new Date(current.startTime).toLocaleDateString("th-TH")}
        </p>
        <button
          type="button"
          onClick={() => goRegister(current.id)}
          className="ui-btn mt-5 rounded-lg bg-[var(--srru-green)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--srru-green-dark)]"
        >
          ลงทะเบียนกิจกรรม
        </button>
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`สไลด์ ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-[var(--srru-green)]" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

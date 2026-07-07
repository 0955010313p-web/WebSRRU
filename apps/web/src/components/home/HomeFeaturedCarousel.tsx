"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth-client";
import { levelLabel, natureLabel } from "@/data/srru-rules";
import type { ActivityItem } from "@/components/activities/ActivitiesList";

const SLIDE_MS = 6000;

export function HomeFeaturedCarousel() {
  const router = useRouter();
  const [slides, setSlides] = useState<ActivityItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch<ActivityItem[]>("/activities", { auth: false })
      .then((data) => {
        const featured = data.filter((a) => a.nature === "CORE_REQUIRED").slice(0, 3);
        setSlides(featured.length > 0 ? featured : data.slice(0, 3));
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const goRegister = (id: string) => {
    if (!isLoggedIn()) {
      router.push(`/login?next=/activities/${id}`);
      return;
    }
    router.push(`/activities/${id}`);
  };

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  if (slides.length === 0) {
    return (
      <section className="mb-8">
        <div className="hero-gradient flex min-h-[200px] items-center justify-center rounded-2xl shadow-[var(--srru-card-shadow-lg)]">
          <p className="text-white/80">กำลังโหลดกิจกรรมแนะนำ…</p>
        </div>
      </section>
    );
  }

  const current = slides[index];

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">กิจกรรมแนะนำ</h2>
        <Link
          href="/activities"
          className="rounded-full bg-[var(--srru-purple-10)] px-4 py-1.5 text-xs font-semibold text-[var(--srru-purple)] hover:bg-[var(--srru-purple-20)]"
        >
          ดูกิจกรรมทั้งหมด →
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl shadow-[var(--srru-card-shadow-lg)]">
        <div className="hero-gradient">
          <div className="grid min-h-[260px] md:min-h-[300px] md:grid-cols-[1fr_auto]">
            {/* เนื้อหา */}
            <div className="relative z-10 flex flex-col justify-center p-6 md:p-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {natureLabel(current.nature)}
                </span>
                <span className="rounded-full bg-[var(--srru-green)] px-3 py-1 text-xs font-semibold text-white">
                  {levelLabel(current.level)}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold leading-snug text-white md:text-2xl lg:text-3xl">
                {current.title}
              </h3>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                {current.description}
              </p>
              <p className="mt-3 text-xs font-medium text-white/70">
                {current.hours} ชั่วโมง ·{" "}
                {new Date(current.startTime).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                type="button"
                onClick={() => goRegister(current.id)}
                className="ui-btn mt-5 w-fit rounded-full bg-white px-7 py-2.5 text-sm font-bold text-[var(--srru-purple-deep)] shadow-lg hover:bg-[var(--srru-green-10)] hover:text-[var(--srru-green-dark)]"
              >
                ลงทะเบียนกิจกรรม
              </button>
            </div>

            {/* โลโก้ decorative */}
            <div className="relative hidden items-center justify-center pr-8 md:flex">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
              <Image
                src="/srru-logo.png"
                alt=""
                width={160}
                height={160}
                className="rounded-full opacity-90 drop-shadow-2xl ring-4 ring-white/20"
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* ปุ่มเลื่อน */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="กิจกรรมก่อนหน้า"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/35"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="กิจกรรมถัดไป"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/35"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`สไลด์ ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";

const faculties = [
  { slug: "education", name: "คณะครุศาสตร์" },
  { slug: "science", name: "คณะวิทยาศาสตร์และเทคโนโลยี" },
  { slug: "humanities", name: "คณะมนุษยศาสตร์และสังคมศาสตร์" },
  { slug: "management", name: "คณะวิทยาการจัดการ" },
  { slug: "industrial", name: "คณะเทคโนโลยีอุตสาหกรรม" },
  { slug: "agriculture", name: "คณะเกษตรและอุตสาหกรรมเกษตร" },
];

export default function FacultyIndexPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[var(--srru-green)]">คณะและหลักสูตร</h1>
        <p className="mt-2 text-[var(--srru-muted)]">เลือกคณะที่ต้องการดูข้อมูลหลักสูตรและการติดต่อ</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {faculties.map((f) => (
          <Card key={f.slug} className="p-4">
            <h3 className="font-medium">{f.name}</h3>
            <div className="mt-3">
              <Link href={`/faculty/${f.slug}`}>
                <a className="text-[var(--srru-purple)] hover:underline">ดูรายละเอียด</a>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Card from "@/components/ui/Card";

export default function FacultyAgriculturePage() {
  const programs = [
    { id: 1, name: "ครุศาสตรบัณฑิต (เกษตรศาสตร์)", credits: 139 },
    { id: 2, name: "วิทยาศาสตรบัณฑิต (สัตวศาสตร์)", credits: 135 },
    { id: 3, name: "วิทยาศาสตรบัณฑิต (เกษตรศาสตร์)", credits: 124 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[var(--srru-green)]">คณะเกษตรและอุตสาหกรรมเกษตร</h1>
        <p className="mt-2 text-[var(--srru-muted)]">ปรัชญา: องค์กรการศึกษาเพื่อพัฒนาวิชาการเกษตรและอุตสาหกรรมเกษตรในท้องถิ่น</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium">หลักสูตรตัวอย่าง</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-[var(--srru-muted)]">
          {programs.map((p) => (
            <li key={p.id} className="py-1">{p.name} — {p.credits} หน่วยกิต</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

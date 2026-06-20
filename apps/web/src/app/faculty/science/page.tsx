"use client";
import React from "react";
import Card from "@/components/ui/Card";

export default function FacultySciencePage() {
  const programs = [
    { id: 1, name: "ครุศาสตรบัณฑิต (คณิตศาสตร์)", credits: 140 },
    { id: 2, name: "ครุศาสตรบัณฑิต (เคมี)", credits: 142 },
    { id: 3, name: "ครุศาสตรบัณฑิต (ชีววิทยา)", credits: 139 },
    { id: 4, name: "ครุศาสตรบัณฑิต (ฟิสิกส์)", credits: 140 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[var(--srru-green)]">คณะวิทยาศาสตร์และเทคโนโลยี</h1>
        <p className="mt-2 text-[var(--srru-muted)]">ปรัชญา: สถาบันอุดมศึกษาเพื่อพัฒนาท้องถิ่น</p>
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

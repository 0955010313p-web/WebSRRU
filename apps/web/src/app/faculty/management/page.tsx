"use client";
import React from "react";
import Card from "@/components/ui/Card";

export default function FacultyManagementPage() {
  const programs = [
    { id: 1, name: "วิทยาการจัดการ — เศรษฐศาสตร์ธุรกิจ", credits: 124 },
    { id: 2, name: "นิเทศศาสตรบัณฑิต — นิเทศศาสตร์และนวัตกรรมการสื่อสาร", credits: 0 },
    { id: 3, name: "บริหารธุรกิจบัณฑิต — การท่องเที่ยวและการโรงแรม", credits: 127 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[var(--srru-green)]">คณะวิทยาการจัดการ</h1>
        <p className="mt-2 text-[var(--srru-muted)]">ปรัชญา: ส่งเสริมการศึกษา พัฒนาความรู้ มุ่งสู่การวิจัยและบริการท้องถิ่นสู่สากล</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium">หลักสูตรตัวอย่าง</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-[var(--srru-muted)]">
          {programs.map((p) => (
            <li key={p.id} className="py-1">{p.name} {p.credits ? `— ${p.credits} หน่วยกิต` : ''}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

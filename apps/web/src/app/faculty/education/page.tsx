"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function FacultyEducationPage() {
  const programs = [
    { code: 1, name: "ครุศาสตรบัณฑิต (เทคโนโลยีดิจิทัลเพื่อการศึกษา)", credits: 140, note: "ปรับปรุง พ.ศ. 2567" },
    { code: 2, name: "ครุศาสตรบัณฑิต (การศึกษาปฐมวัย)", credits: 139, note: "ปรับปรุง พ.ศ. 2567" },
    { code: 3, name: "ครุศาสตรบัณฑิต (การประถมศึกษา)", credits: 139, note: "ปรับปรุง พ.ศ. 2567" },
    { code: 4, name: "ครุศาสตรบัณฑิต (พลศึกษา)", credits: 140, note: "ปรับปรุง พ.ศ. 2567" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[var(--srru-green)]">คณะครุศาสตร์</h1>
        <p className="mt-2 text-sm text-[var(--srru-muted)]">ปรัชญา: ผลิตและพัฒนาครูดี มีความรู้ คู่คุณธรรม</p>
        <p className="mt-3">ปณิธาน: แหล่งวิทยาการ มาตรฐานการศึกษางานวิจัยก้าวหน้าศูนย์รวมภูมิปัญญา พัฒนาท้องถิ่นและวัฒนธรรม</p>
        <p className="mt-2">วิสัยทัศน์: คณะครุศาสตร์มุ่งผลิต พัฒนาครู และบุคลากรทางการศึกษาให้มีคุณภาพตามมาตรฐานวิชาชีพเป็นผู้นำด้านวิชาการ การวิจัย การบริการทางวิชาการแก่ชุมชนและส่งเสริมสนับสนุนศิลปวัฒนธรรมอันดีงามให้ยั่งยืน</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary">ติดต่อ: 044-558-344</Button>
          <Button>อีเมล: it-science@srru.ac.th</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium">หลักสูตรที่แนะนำสำหรับนักศึกษา</h2>
        <p className="text-sm text-[var(--srru-muted)] mt-1">เลือกหลักสูตรที่เหมาะสมกับความสนใจและความสะดวกในการเรียน</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-[var(--srru-muted)]">
                <th className="pb-2">ลำดับ</th>
                <th className="pb-2">หลักสูตร</th>
                <th className="pb-2">หน่วยกิต</th>
                <th className="pb-2">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.code} className="border-t">
                  <td className="py-3">{p.code}</td>
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">{p.credits}</td>
                  <td className="py-3 text-[var(--srru-muted)]">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-sm">คำแนะนำ: หากต้องการให้ผมเพิ่มหน้าของคณะอื่น ๆ (เช่น คณะวิทยาศาสตร์, มนุษยศาสตร์) ผมจะสร้างแบบเดียวกันให้ครบตามรายชื่อที่ส่งมา</p>
        </div>
      </Card>
    </div>
  );
}

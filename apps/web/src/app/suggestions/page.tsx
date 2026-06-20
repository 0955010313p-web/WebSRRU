"use client";

import Link from "next/link";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SuggestionsPage() {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/" className="text-sm text-[var(--srru-muted)] hover:underline">
        ← หน้าหลัก
      </Link>
      <h1 className="text-2xl font-bold">คำแนะนำหรือข้อเสนอของนักศึกษา</h1>
      <p className="text-sm text-[var(--srru-muted)]">
        แจ้งความต้องการกิจกรรมที่อยากให้มหาวิทยาลัยจัด — สอดคล้องกับการบริหารกิจกรรมในงานวิจัย
      </p>
      <Card className="p-6">
        {sent ? (
          <p className="text-sm text-[var(--srru-green)]">
            บันทึกข้อเสนอเรียบร้อย (โหมดตัวอย่าง — จะเชื่อม API ในขั้นตอนถัดไป)
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">หัวข้อ</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">รายละเอียด</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                required
                rows={5}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[var(--srru-green)]"
              />
            </div>
            <Button type="submit" className="w-full">
              ส่งข้อเสนอ
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    studentCode: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    faculty: "",
    major: "",
    yearLevel: 1,
    studentType: "REGULAR" as "REGULAR" | "SPECIAL",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Client-side validation
    const v = validateForm(form);
    if (!v.valid) {
      setError(v.message);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          ...form,
          email: form.email || undefined,
          yearLevel: Number(form.yearLevel),
        }),
      });
      setToken(res.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  };

  function validateForm(values: typeof form) {
    if (!values.studentCode || values.studentCode.trim().length < 6) {
      return { valid: false, message: 'รหัสนักศึกษาต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }
    if (!values.password || values.password.length < 8) {
      return { valid: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
    }
    if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
      return { valid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
    }
    if (!values.firstName || !values.lastName) {
      return { valid: false, message: 'โปรดระบุชื่อและนามสกุล' };
    }
    return { valid: true };
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
      <h1 className="text-xl font-semibold">สมัครสมาชิก (นักศึกษา)</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">รหัสนักศึกษา</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.studentCode}
            onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">อีเมล (ไม่บังคับ)</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">ชื่อ</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">นามสกุล</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">คณะ</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">สาขา</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.major}
            onChange={(e) => setForm({ ...form, major: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">ชั้นปี</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.yearLevel}
            onChange={(e) =>
              setForm({ ...form, yearLevel: Number(e.target.value) })
            }
            required
          >
            <option value={1}>ปีที่ 1</option>
            <option value={2}>ปีที่ 2</option>
            <option value={3}>ปีที่ 3</option>
            <option value={4}>ปีที่ 4</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">ประเภทนักศึกษา</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
            value={form.studentType}
            onChange={(e) =>
              setForm({
                ...form,
                studentType: e.target.value as "REGULAR" | "SPECIAL",
              })
            }
          >
            <option value="REGULAR">ภาคปกติ (100 ชม.)</option>
            <option value="SPECIAL">ภาคพิเศษ (50 ชม.)</option>
          </select>
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "กำลังสมัคร…" : "สมัครสมาชิก"}
          </button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-slate-700">
        มีบัญชีแล้ว?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

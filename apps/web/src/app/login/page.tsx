"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ username, password }),
      });
      setToken(res.accessToken);
      router.push(nextPath.startsWith("/") ? nextPath : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-xl font-bold text-[var(--srru-purple-deep)]">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-[var(--srru-muted)]">ใช้รหัสนักศึกษาและรหัสผ่าน</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            รหัสนักศึกษา / ชื่อผู้ใช้
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            รหัสผ่าน
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </Button>
      </form>
        <p className="mt-4 text-center text-sm text-[var(--srru-muted)]">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-[var(--srru-purple)] hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-600">กำลังโหลด…</p>}>
      <LoginForm />
    </Suspense>
  );
}

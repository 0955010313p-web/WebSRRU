import Link from "next/link";
import UploadForm from "../components/UploadForm";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-300 border border-slate-200 text-slate-900">
        <h1 className="text-2xl font-bold text-slate-900">
          ระบบกิจกรรมนักศึกษา SRRU
        </h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          เว็บแอปพลิเคชันสำหรับลงทะเบียนกิจกรรม ตรวจสอบชั่วโมงสะสม
          และเช็คชื่อด้วย QR Code ตามหลักเกณฑ์กิจกรรมเสริมหลักสูตร
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            สมัครสมาชิก (นักศึกษา)
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/activities"
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            ดูกิจกรรม
          </Link>
        </div>
      </section>

      <section>
        <UploadForm />
      </section>
    </div>
  );
}

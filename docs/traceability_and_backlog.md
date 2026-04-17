Traceability Matrix — ฟีเจอร์หลักและการแมปไปยังโค้ด

1) การลงทะเบียน (Register)
- ข้อกำหนด (ย่อ): ฟอร์มลงทะเบียนนักศึกษา เก็บ studentCode, password, email, firstName, lastName, faculty, major, yearLevel, studentType
- Frontend: apps/web/src/app/register/page.tsx
- Backend endpoint: POST /api/auth/register (apps/api/src/auth/*)
- DB: Prisma model `Student` และ `User` (apps/api/prisma/schema.prisma)
- สถานะ: implemented (UI ปรับปรุงแล้ว, backend มี module auth)

2) การเช็คอินด้วย QR (QR check-in)
- ข้อกำหนด: นักเรียนสแกน/ส่ง `activityId` + `qrSecret`, ภายในช่วงเวลา activity
- Backend: apps/api/src/attendances/attendances.controller.ts, attendances.service.ts
- Validation added: server-side validation of `proofImagePath` (apps/api/src/attendances/attendances.service.ts)
- สถานะ: implemented (logic, approval flow present)

3) อัปโหลดหลักฐาน (Uploads presign/local)
- ข้อกำหนด: presigned S3 flow + local fallback; whitelist content types; 10MB local limit
- Backend: apps/api/src/uploads/uploads.controller.ts, uploads.service.ts, apps/api/README_UPLOADS.md
- Existing: content-type whitelist and 10 MB local limit already present
- สถานะ: implemented

4) การอนุมัติการเข้าร่วม (Attendance approval)
- ข้อกำหนด: เจ้าหน้าที่ (ADMIN/COORDINATOR) ดูรายการ pending, อนุมัติ/ปฏิเสธ
- Backend: apps/api/src/attendances/attendances.controller.ts, attendances.service.ts
- สถานะ: implemented

5) การคำนวณชั่วโมงรวมและเงื่อนไข (Hour aggregation)
- ข้อกำหนดย่อ: Regular = 100 ชม + 25 กิจกรรมขั้นต่ำ; Special = 50 ชม + 4 กิจกรรมขั้นต่ำ; คำนวนรวมจาก attendances ที่ `APPROVED`, credit transfers, special approvals
- Backend: apps/api/src/students/students.service.ts (`summarizeHours`, `transcript`)
- สถานะ: implemented

6) ใบรับรอง PDF (Certificate generation)
- ข้อกำหนด: สร้าง PDF พร้อมเลข certificate, ตรวจสอบเงื่อนไขชั่วโมงก่อนออก
- Backend: apps/api/src/certificates/certificates.service.ts (ใช้ pdfkit)
- สถานะ: implemented (ตรวจสอบ `evaluationReady`)

7) รายงาน / Export (Excel/PDF)
- ข้อกำหนด: รายงานสรุปผู้เข้าร่วม, การส่งออก
- Backend: apps/api/src/reports/*
- Frontend: pages/reports
- สถานะ: partial (implementations exist; verify exports per spec)

8) RBAC และ Guards
- ข้อกำหนด: บทบาท ADMIN / COORDINATOR / STUDENT ควบคุมการเข้าถึง
- Backend: apps/api/src/common/guards, auth module
- สถานะ: implemented (RolesGuard present)

Prioritized Backlog (ถัดไป — ข้อเสนอการทำงาน)

1. High
- สร้าง traceability matrix (นี้) + แจกแจง acceptance criteria (done)
- ตรวจสอบและเพิ่ม server-side validation เพิ่มเติม (ทำแล้ว: proofImagePath validation)
- ยืนยันการป้องกัน endpoint ดาวน์โหลดใน production (protect `GET /api/uploads/download` with auth) — ACTION: add auth guard to DownloadsController

2. Medium
- เพิ่ม unit/e2e tests สำหรับ QR check-in edge cases (invalid token, outside window, duplicate check-in)
- ตรวจสอบและปรับการ export รายงาน ให้ตรงตามข้อกำหนด (Excel columns, ภาษาไทย/อังกฤษ)

3. Low
- UI polish รายงานและ certificate preview
- เพิ่ม lifecycle/cleanup rules สำหรับ uploads ใน production (S3 lifecycle)

Suggested Immediate Code Tasks (I can implement now)
- [x] Add server-side validation for `proofImagePath` (done)
- [ ] Protect `GET /api/uploads/download` behind `AuthGuard('jwt')` and RolesGuard for production-safe use
- [ ] Add tests for check-in and uploads
- [ ] Verify reports export formatting against spec

Next steps I will take if you confirm:
- Implement auth guard on DownloadsController and add a config flag to enable/require it in non-dev.
- Add basic tests for QR check-in and upload endpoints and run them locally.
- Produce a concise CSV/Markdown traceability export mapping each functional requirement to implementation files.

If you want me to proceed, tell me which immediate task to prioritize (protect downloads, add tests, or verify reports), or I will start by protecting the downloads endpoint and adding tests.

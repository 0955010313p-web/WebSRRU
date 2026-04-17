# Prioritized Backlog (ลำดับความสำคัญ)

รายการงานลำดับความสำคัญจากการแม็ปข้อกำหนดและสถานะปัจจุบัน

1. [High] Registration validation checks
   - ตรวจสอบ/เติม validation rules (studentCode format, password strength, email) ทั้ง frontend/back-end
   - Files: `apps/web/src/app/register/page.tsx`, `apps/api/src/auth/*`

2. [High] Upload validation & storage safety
   - ยืนยันขนาดไฟล์และชนิดใน backend, sanitize filenames, presign expiry
   - Files: `apps/web/src/components/UploadForm.tsx`, uploads backend module

3. [High] QR check-in hardening
   - ทดสอบ replay/expired/invalid QR, เพิ่ม logging และ rate-limiting ถ้าจำเป็น
   - Files: `apps/api/src/attendances/*`, `apps/web/src/app/scan/page.tsx`

4. [Medium] Business rules for hours & pass criteria
   - ยืนยันกฎ (ปกติ 100 ชม., พิเศษ 50 ชม.) และเขียน unit tests
   - Files: `apps/api/src/reports/*`, `apps/api/src/special-hours/*`, `apps/web/src/app/dashboard/*`

5. [Medium] Reviewer workflow & RBAC mapping
   - แม็ปรายการ role→permission ให้ตรงสเปค และปรับ guards
   - Files: `apps/api/src/auth/*`, `apps/api/src/common/guards/*`

6. [Medium] Reports UI and exports
   - สร้าง UI สำหรับรายงานหลักและเชื่อมกับ endpoints ส่งออก Excel/PDF
   - Files: `apps/web/src/app/reports/*`, `apps/api/src/reports/*`

7. [Low] UI polish and accessibility
   - มาตรฐานสี, ป้ายข้อความแสดงสถานะ, keyboard accessibility
   - Files: frontend components

8. [Low] Tests & CI
   - เพิ่ม unit/integration tests สำหรับ critical flows (register, check-in, certificate generation)

9. [Optional] Production hardening
   - CORS strict policy, helmet, rate-limits, file storage policy review


ถัดไปผมจะเริ่มทำงานรายการที่ 1 และ 2 — ต้องการให้ผมทำทีละรายการหรือสร้าง branch + PR สำหรับแต่ละงาน? 

# Traceability Matrix — สรุปการแม็ปข้อกำหนดกับโค้ด

รายการสั้นต่อไปนี้แม็ปจากไฟล์สเปค (`docs/spec_document_xml/document.xml`) ไปยังไฟล์โค้ดที่เกี่ยวข้อง พร้อมสถานะและงานถัดไป

- ID: R1
  - ข้อกำหนด: ลงทะเบียนนักศึกษา (ฟิลด์: studentCode, password, email, firstName, lastName, faculty, major, yearLevel, studentType)
  - Frontend: apps/web/src/app/register/page.tsx
  - Backend: apps/api/src/auth/auth.controller.ts, apps/api/src/auth/dto/register-student.dto.ts
  - สถานะ: Implemented
  - งานถัดไป: ตรวจสอบ validation rules ตามสเปค (min/max length, format)

- ID: R2
  - ข้อกำหนด: สร้าง/แก้ไขกิจกรรม (ชื่อ, วันที่, เวลา, สถานที่, ประเภท, ชั่วโมง, QR secret)
  - Frontend: apps/web/src/app/activities/page.tsx, apps/web/src/app/activities/[id]/page.tsx
  - Backend: apps/api/src/activities/activities.controller.ts, apps/api/src/activities/activities.service.ts, apps/api/src/activities/dto/create-activity.dto.ts
  - สถานะ: Implemented (core)
  - งานถัดไป: ตรวจสอบฟิลด์ QR secret generation และ expiry policy

- ID: R3
  - ข้อกำหนด: สมัครเข้าร่วม / ยกเลิกการสมัคร
  - Frontend: apps/web/src/app/activities/[id]/page.tsx
  - Backend: apps/api/src/registrations/registrations.controller.ts, apps/api/src/registrations/registrations.service.ts, apps/api/src/registrations/dto/register-for-activity.dto.ts
  - สถานะ: Implemented
  - งานถัดไป: เพิ่ม feedback UI เมื่อสมัคร/ยกเลิกสำเร็จ

- ID: R4
  - ข้อกำหนด: เช็คอินด้วย QR Code (POST /attendances/check-in)
  - Frontend: apps/web/src/app/scan/page.tsx
  - Backend: apps/api/src/attendances/attendances.controller.ts, apps/api/src/attendances/attendances.service.ts, apps/api/src/attendances/dto/check-in.dto.ts
  - สถานะ: Implemented
  - งานถัดไป: ทดสอบกรณีกรอง (replay, expired QR, mismatched activityId)

- ID: R5
  - ข้อกำหนด: บันทึก/อนุมัติการเข้าร่วม (review by staff)
  - Backend: apps/api/src/attendances/attendances.controller.ts, apps/api/src/attendances/dto/review-attendance.dto.ts
  - สถานะ: Implemented (backend endpoints present)
  - งานถัดไป: ตรวจสอบ workflow UI สำหรับ reviewer (allowed roles)

- ID: R6
  - ข้อกำหนด: สะสมชั่วโมงและกฎผ่าน (เช่น ปกติ 100 ชม., พิเศษ 50 ชม.)
  - Frontend: apps/web/src/app/dashboard/page.tsx
  - Backend: apps/api/src/reports/reports.service.ts, apps/api/src/special-hours/special-hours.service.ts
  - สถานะ: Partial
  - งานถัดไป: ตรวจสอบ business rules กับสเปคและเขียน unit tests

- ID: R7
  - ข้อกำหนด: อัปโหลดหลักฐาน (รูปภาพ / PDF) พร้อมขนาดจำกัด
  - Frontend: apps/web/src/components/UploadForm.tsx, apps/web/src/lib/uploads.ts
  - Backend: uploads endpoints / presign handler (ตรวจสอบใน modules ที่เกี่ยวข้อง)
  - สถานะ: Partial
  - งานถัดไป: ยืนยันขนาด/ชนิดไฟล์ใน backend และแสดง error messages ที่เหมาะสม

- ID: R8
  - ข้อกำหนด: สร้าง/ดาวน์โหลดใบรับรอง (PDF)
  - Frontend: apps/web/src/app/dashboard/page.tsx (download link)
  - Backend: apps/api/src/certificates/certificates.service.ts, apps/api/src/certificates/certificates.controller.ts
  - สถานะ: Implemented
  - งานถัดไป: ตรวจสอบรูปแบบใบรับรองตามตัวอย่างในสเปค

- ID: R9
  - ข้อกำหนด: รายงาน / ส่งออก (Excel/PDF)
  - Backend: apps/api/src/reports/reports.service.ts, apps/api/src/reports/reports.controller.ts
  - Frontend: รายงานบางส่วนยังขาด UI
  - สถานะ: Partial
  - งานถัดไป: สร้างหน้า UI สำหรับรายงานที่สำคัญ (ยอดชั่วโมง, สรุปกิจกรรม)

- ID: R10
  - ข้อกำหนด: สิทธิ์/บทบาท (RBAC)
  - Backend: apps/api/src/auth/*, apps/api/src/common/guards
  - สถานะ: Implemented (ต้องแม็ป role→permission ตามสเปค)
  - งานถัดไป: ตรวจสอบ mapping role/permission กับเอกสาร


หมายเหตุ: ไฟล์และสถานะข้างต้นมาจากการค้นหาโครงสร้างโปรเจคและไฟล์ที่พบใน repo; งานถัดไปจะเป็นการตรวจสอบเชิงลึก (open PRs/edges) และเขียนรายการงานที่ต้องทำจริงๆ ใน backlog

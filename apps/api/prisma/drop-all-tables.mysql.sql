-- =============================================================================
-- อันตราย: ลบทุกตารางในฐานข้อมูลที่กำลังใช้อยู่ (DATABASE() ปัจจุบัน)
-- ใช้เมื่อ Prisma แจ้ง P3005 (schema ไม่ว่าง) และคุณยืนยันว่าไม่ต้องการข้อมูลเดิม
-- ขั้นตอน: ใน phpMyAdmin เลือกฐาน (เช่น 66122420114) → แท็บ SQL → วางแล้วรัน
-- จากนั้นใน apps/api: npm run prisma:migrate แล้ว npm run db:seed
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

SET @tables = NULL;
SELECT GROUP_CONCAT(CONCAT('`', REPLACE(table_name, '`', '``'), '`'))
INTO @tables
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE';

SET @stmt = IF(
  @tables IS NULL,
  'SELECT ''no tables'' AS notice',
  CONCAT('DROP TABLE IF EXISTS ', @tables)
);

PREPARE drop_all FROM @stmt;
EXECUTE drop_all;
DEALLOCATE PREPARE drop_all;

SET FOREIGN_KEY_CHECKS = 1;

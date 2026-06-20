/** สรุปหลักเกณฑ์ ม.ราชภัฏสุรินทร์ (ฉบับ 273/2566) สำหรับแสดงบน UI */
export const SRRU_RULES_UI = {
  announcement: "ประกาศ ม.ราชภัฏสุรินทร์ ฉบับที่ 273/2566",
  nature: {
    CORE_REQUIRED: { label: "บังคับแกน", hours: 6 },
    ELECTIVE_REQUIRED: { label: "บังคับเลือก", hours: 5 },
  },
  categories: [
    "ส่งเสริมศิลปะและวัฒนธรรม",
    "วิชาการ",
    "กีฬาและส่งเสริมสุขภาพ",
    "จิตอาสา/บำเพ็ญประโยชน์/สิ่งแวดล้อม",
    "เสริมสร้างคุณธรรมและจริยธรรม",
  ],
  regular: {
    label: "ภาคปกติ",
    totalActivities: 25,
    totalHours: 100,
    yearly: [
      { year: 1, activities: 8, hours: 40 },
      { year: 2, activities: 6, hours: 30 },
      { year: 3, activities: 6, hours: 20 },
      { year: 4, activities: 5, hours: 10 },
    ],
  },
  special: {
    label: "ภาคพิเศษ",
    totalActivities: 15,
    totalHours: 50,
    yearly: [
      { year: 1, activities: 6, hours: 20 },
      { year: 2, activities: 4, hours: 15 },
      { year: 3, activities: 3, hours: 10 },
      { year: 4, activities: 2, hours: 5 },
    ],
  },
  certificateMinHours: 100,
} as const;

export function natureLabel(nature: string): string {
  return (
    SRRU_RULES_UI.nature[nature as keyof typeof SRRU_RULES_UI.nature]?.label ??
    nature
  );
}

export function levelLabel(level: string): string {
  return level === "UNIVERSITY" ? "มหาวิทยาลัย" : "คณะ";
}

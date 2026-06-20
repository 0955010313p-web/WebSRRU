import { StudentType } from '@prisma/client';

/** ตามประกาศ ม.ราชภัฏสุรินทร์ เรื่องหลักเกณฑ์กิจกรรมเสริมหลักสูตร พ.ศ. 2566 */
export const GRADUATION_RULES = {
  announcement: 'ประกาศ ม.ราชภัฏสุรินทร์ ฉบับที่ 273/2566',
  categories: [
    { key: 'CULTURE', label: 'ส่งเสริมศิลปะและวัฒนธรรม' },
    { key: 'ACADEMIC', label: 'วิชาการ' },
    { key: 'SPORTS', label: 'กีฬาและส่งเสริมสุขภาพ' },
    { key: 'VOLUNTEERING', label: 'จิตอาสา/บำเพ็ญประโยชน์/สิ่งแวดล้อม' },
    { key: 'ETHICS', label: 'เสริมสร้างคุณธรรมและจริยธรรม' },
  ],
  natureLabels: {
    CORE_REQUIRED: 'บังคับแกน (มหาวิทยาลัย)',
    ELECTIVE_REQUIRED: 'บังคับเลือก',
  },
  hourPerNature: {
    CORE_REQUIRED: 6,
    ELECTIVE_REQUIRED: 5,
  },
  programs: {
    [StudentType.REGULAR]: {
      label: 'ภาคปกติ',
      minActivities: 25,
      minHours: 100,
      yearly: [
        { year: 1, minActivities: 8, minHours: 40 },
        { year: 2, minActivities: 6, minHours: 30 },
        { year: 3, minActivities: 6, minHours: 20 },
        { year: 4, minActivities: 5, minHours: 10 },
      ],
    },
    [StudentType.SPECIAL]: {
      label: 'ภาคพิเศษ',
      minActivities: 15,
      minHours: 50,
      yearly: [
        { year: 1, minActivities: 6, minHours: 20 },
        { year: 2, minActivities: 4, minHours: 15 },
        { year: 3, minActivities: 3, minHours: 10 },
        { year: 4, minActivities: 2, minHours: 5 },
      ],
    },
  },
} as const;

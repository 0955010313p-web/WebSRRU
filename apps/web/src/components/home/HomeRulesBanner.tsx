"use client";

import { SRRU_RULES_UI } from "@/data/srru-rules";
import Card from "@/components/ui/Card";

export function HomeRulesBanner() {
  const r = SRRU_RULES_UI.regular;
  const s = SRRU_RULES_UI.special;

  return (
    <Card className="mb-6 border border-[var(--srru-green-10)] bg-[var(--srru-green-10)]/40 p-5">
      <h2 className="text-sm font-semibold text-[var(--srru-green-dark)]">
        หลักเกณฑ์กิจกรรมเสริมหลักสูตร — {SRRU_RULES_UI.announcement}
      </h2>
      <p className="mt-2 text-xs text-[var(--srru-muted)]">
        บังคับแกน {SRRU_RULES_UI.nature.CORE_REQUIRED.hours} ชม./กิจกรรม · บังคับเลือก{" "}
        {SRRU_RULES_UI.nature.ELECTIVE_REQUIRED.hours} ชม./กิจกรรม · ใบรับรองเมื่อครบอย่างน้อย{" "}
        {SRRU_RULES_UI.certificateMinHours} ชม.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white/80 p-3 text-xs">
          <p className="font-medium text-slate-800">{r.label}</p>
          <p className="mt-1 text-[var(--srru-muted)]">
            รวม {r.totalActivities} กิจกรรม · {r.totalHours} ชม.
          </p>
          <ul className="mt-2 space-y-0.5 text-slate-700">
            {r.yearly.map((y) => (
              <li key={y.year}>
                ปี {y.year}: {y.activities} กิจกรรม / {y.hours} ชม.
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white/80 p-3 text-xs">
          <p className="font-medium text-slate-800">{s.label}</p>
          <p className="mt-1 text-[var(--srru-muted)]">
            รวม {s.totalActivities} กิจกรรม · {s.totalHours} ชม.
          </p>
          <ul className="mt-2 space-y-0.5 text-slate-700">
            {s.yearly.map((y) => (
              <li key={y.year}>
                ปี {y.year}: {y.activities} กิจกรรม / {y.hours} ชม.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

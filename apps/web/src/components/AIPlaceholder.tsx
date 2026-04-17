'use client'

import React from 'react'

export default function AIPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`ai-placeholder ui-card p-4 ${className || ''}`}>
      <strong>คำแนะนำส่วนตัว (ตัวอย่าง)</strong>
      <p className="muted-text mt-2">ที่นี่จะเป็นที่วางของโมดูล AI เพื่อแสดงคำแนะนำกิจกรรมหรือการแจ้งเตือนส่วนบุคคล</p>
    </div>
  )
}

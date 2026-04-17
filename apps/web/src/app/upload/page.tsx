'use client'

import React from 'react'
import UploadForm from '../../components/UploadForm'
import './upload.css'

export default function UploadPage() {
  return (
    <div style={{padding: 24}}>
      <h1 style={{marginBottom: 8}}>ตัวอย่างอัปโหลดไฟล์</h1>
      <p style={{color: '#666', marginBottom: 16}}>ระบบจะพยายามอัปโหลดไปยัง S3 โดยใช้ presigned URL หากยังไม่ตั้งค่า จะ fallback เป็นการอัปโหลดท้องถิ่น</p>
      <UploadForm />
    </div>
  )
}

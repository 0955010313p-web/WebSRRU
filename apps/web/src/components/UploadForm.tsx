'use client'

import React, { useState, useRef } from 'react'
import { requestPresign, uploadToPresignedUrl, uploadLocalBase64 } from '../lib/uploads'
import '../app/upload/upload.css'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  type UploadResult =
    | { storage: 's3'; key: string; bucket: string }
    | { storage: 'local'; path: string }
    | { error: string }
    | null

  const [result, setResult] = useState<UploadResult>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

  function handlePick() {
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files ? e.target.files[0] : null
    if (f) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setStatus('ชนิดไฟล์ไม่รองรับ — อนุญาตเฉพาะ PNG, JPG, PDF')
        setFile(null)
        return
      }
      if (f.size > MAX_FILE_BYTES) {
        setStatus('ไฟล์ขนาดใหญ่เกิน 10MB')
        setFile(null)
        return
      }
    }
    setFile(f)
    setResult(null)
    setStatus(null)
    setProgress(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setStatus('กรุณาเลือกไฟล์ก่อน')
    // final client-side check before upload
    if (!ALLOWED_TYPES.includes(file.type)) return setStatus('ชนิดไฟล์ไม่รองรับ')
    if (file.size > MAX_FILE_BYTES) return setStatus('ไฟล์ขนาดใหญ่เกิน 10MB')
    setLoading(true)
    setStatus('กำลังอัปโหลด...')
    setProgress(5)
    try {
      // Try presign flow first
      const presign = await requestPresign(file.name, file.type || 'application/octet-stream')
      setProgress(30)
      await uploadToPresignedUrl(presign.url, file, file.type || 'application/octet-stream')
      setProgress(100)
      setStatus('อัปโหลดขึ้น S3 สำเร็จ')
      setResult({ storage: 's3', key: presign.key, bucket: presign.bucket })
    } catch (_err) {
      try {
        // Fallback to local base64 upload
        setStatus('Presign ไม่สำเร็จ — ใช้ fallback ท้องถิ่น')
        const res = await uploadLocalBase64(file.name, file)
        setProgress(100)
        setStatus('อัปโหลดแบบท้องถิ่นสำเร็จ')
        setResult({ storage: 'local', path: res.url || res.path || res })
      } catch (err2) {
        setStatus('อัปโหลดล้มเหลว')
        setResult({ error: String(err2) })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-card">
      <h2 className="upload-title">อัปโหลดหลักฐานการเข้าร่วมกิจกรรม</h2>
      <p className="upload-sub">รองรับภาพหรือไฟล์ PDF ขนาดไม่เกินที่กำหนด</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <input ref={inputRef} type="file" className="upload-input" onChange={onFileChange} />

        <div className="dropzone" onClick={handlePick} role="button" tabIndex={0}>
          {file ? (
            <div className="file-info">
              <strong>{file.name}</strong>
              <span>{Math.round(file.size / 1024)} KB</span>
            </div>
          ) : (
            <div className="drop-hint">คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด</div>
          )}
        </div>

        <div className="actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => { setFile(null); setResult(null); setStatus(null); setProgress(0); }}>
            ยกเลิก
          </button>
        </div>

        <div className="progress-wrap" aria-hidden={progress === 0}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {status && <div className="status">{status}</div>}
        {result && (
          <pre className="result">{JSON.stringify(result, null, 2)}</pre>
        )}
      </form>
    </div>
  )
}

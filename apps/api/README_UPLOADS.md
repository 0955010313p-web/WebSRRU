Uploads (presign & local)

Short guide to enable presigned S3 uploads and local fallback for development.

Required environment variables for presigned S3 flow:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

Example: (Windows PowerShell)

```powershell
$env:AWS_ACCESS_KEY_ID = 'AKIA...'
$env:AWS_SECRET_ACCESS_KEY = 'secret'
$env:AWS_REGION = 'ap-southeast-1'
$env:AWS_S3_BUCKET = 'my-bucket'
npm run start:dev
```

Endpoints

- `POST /api/uploads/presign` — request a presigned PUT URL (body: `{ filename, contentType }`). Returns `{ url, key, bucket, expiresIn }` when S3 configured.
- `POST /api/uploads/local` — local fallback for development (body: `{ filename, contentBase64 }`). Returns `{ url, absolute }`.
- `GET /api/uploads/download?storage={s3|local}&key={key}` — download helper: for `s3` returns a presigned GET URL, for `local` streams the local file. NOTE: protect this endpoint behind authentication in production.

Notes

- If S3 is not configured the presign endpoint returns HTTP 501 with a hint message recommending configuration or use of the local endpoint.
- Local uploads are saved under `/uploads/...` relative to project root; serving them requires adding a static middleware or using the secure download endpoint above. Do not publicly expose uploads without access control in production.
- For production-grade deployments prefer S3 with lifecycle rules and server-side virus scanning/integration with a quarantine workflow. Use S3 lifecycle rules to auto-expire temporary files and enable server-side encryption.
- A simple cleanup script is included at `apps/api/scripts/cleanup-uploads.ts` for development; schedule it with your system cron or CI task runner if you rely on local storage.

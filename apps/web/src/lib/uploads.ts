// Example upload helper: presigned S3 PUT flow and local base64 fallback
export async function requestPresign(filename: string, contentType = 'application/octet-stream') {
  const res = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to request presign');
  }
  return res.json(); // { url, key, bucket, expiresIn }
}

export async function uploadToPresignedUrl(url: string, file: Blob, contentType = 'application/octet-stream') {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!res.ok) throw new Error('Presigned upload failed');
  return true;
}

export async function uploadLocalBase64(filename: string, file: Blob) {
  // Read file as base64
  function toBase64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const contentBase64 = await toBase64(file);
  const res = await fetch('/api/uploads/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentBase64 }),
  });
  if (!res.ok) throw new Error('Local upload failed');
  return res.json();
}

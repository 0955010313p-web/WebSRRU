import { join } from 'path';
import { promises as fs } from 'fs';

async function cleanup(maxAgeDays = 30) {
  const uploadsDir = join(process.cwd(), 'uploads');
  try {
    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    const cutoff = now - maxAgeDays * 24 * 60 * 60 * 1000;
    let removed = 0;
    for (const f of files) {
      const p = join(uploadsDir, f);
      try {
        const stat = await fs.stat(p);
        if (stat.isFile() && stat.mtimeMs < cutoff) {
          await fs.unlink(p);
          removed++;
        }
      } catch (e) {
        // ignore individual file errors
      }
    }
    console.log(`Cleanup removed ${removed} files older than ${maxAgeDays} days`);
  } catch (e) {
    console.warn('Uploads cleanup: uploads directory not present or inaccessible');
  }
}

const days = process.env.CLEANUP_MAX_DAYS ? parseInt(process.env.CLEANUP_MAX_DAYS, 10) : 30;
cleanup(days).catch((e) => {
  console.error('Cleanup error', e);
  process.exit(1);
});

import { mkdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshotPath = path.join(__dirname, '..', '..', 'snapshot.json');
const restoredPath = path.join(__dirname, '..', '..', 'workspace_restored');

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  try {
    await stat(snapshotPath);

    try {
      await stat(restoredPath);
      throw new Error('FS operation failed');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    const snapshotContent = await readFile(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(snapshotContent);

    await mkdir(restoredPath);

    for (const entry of snapshot.entries) {
      const normalizedEntryPath = entry.path.split('/').join(path.sep);
      const targetPath = path.join(restoredPath, normalizedEntryPath);

      if (entry.type === 'directory') {
        await mkdir(targetPath, { recursive: true });
      } else if (entry.type === 'file') {
        await mkdir(path.dirname(targetPath), { recursive: true });

        const fileBuffer = Buffer.from(entry.content, 'base64');
        await writeFile(targetPath, fileBuffer);
      }
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await restore();

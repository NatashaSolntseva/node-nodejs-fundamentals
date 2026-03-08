import { fileURLToPath } from 'url';
import path from 'path';
import { readdir, readFile, writeFile, stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacePath = path.join(__dirname, '..', '..', 'workspace');
const normalizedRootPath = workspacePath.replaceAll(path.sep, '/');
const snapshotPath = path.join(__dirname, '..', '..', 'snapshot.json');

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const entries = [];

  async function walk(currentPath) {
    const items = await readdir(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const itemStat = await stat(fullPath);
      const relativePath = path.relative(workspacePath, fullPath).replaceAll(path.sep, '/');

      if (itemStat.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory',
        });

        await walk(fullPath);
      } else if (itemStat.isFile()) {
        const contentBuffer = await readFile(fullPath);

        entries.push({
          path: relativePath,
          type: 'file',
          size: itemStat.size,
          content: contentBuffer.toString('base64'),
        });
      }
    }
  }

  try {
    const workspaceStat = await stat(workspacePath);

    if (!workspaceStat.isDirectory()) {
      throw new Error();
    }

    await walk(workspacePath);

    const snapshotData = {
      rootPath: normalizedRootPath,
      entries,
    };

    await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
  } catch {
    throw new Error('FS operation failed');
  }


};

await snapshot();

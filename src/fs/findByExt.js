import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacePath = path.join(__dirname, '..', '..', 'workspace');

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  try {
    await stat(workspacePath);

    const extArgIndex = process.argv.indexOf('--ext');
    const rawExtension =
      extArgIndex !== -1 && process.argv[extArgIndex + 1]
        ? process.argv[extArgIndex + 1]
        : '.txt';

    const extension = rawExtension.startsWith('.')
      ? rawExtension
      : `.${rawExtension}`;

    const matchedFiles = [];

    async function walk(currentPath) {
      const items = await readdir(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const itemStat = await stat(fullPath);

        if (itemStat.isDirectory()) {
          await walk(fullPath);
        } else if (itemStat.isFile() && path.extname(item) === extension) {
          const relativePath = path
            .relative(workspacePath, fullPath)
            .replaceAll(path.sep, '/');

          matchedFiles.push(relativePath);
        }
      }
    }

    await walk(workspacePath);

    matchedFiles.sort();

    for (const filePath of matchedFiles) {
      console.log(filePath);
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacePath = path.join(__dirname, '..', '..', 'workspace');
const partsPath = path.join(workspacePath, 'parts');
const mergedFilePath = path.join(workspacePath, 'merged.txt');

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  try {
    const partsStat = await stat(partsPath);

    if (!partsStat.isDirectory()) {
      throw new Error('FS operation failed');
    }

    const filesArgIndex = process.argv.indexOf('--files');
    let filesToMerge = [];

    if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
      filesToMerge = process.argv[filesArgIndex + 1]
        .split(',')
        .map((fileName) => fileName.trim())
        .filter(Boolean);

      if (filesToMerge.length === 0) {
        throw new Error('FS operation failed');
      }

      for (const fileName of filesToMerge) {
        const filePath = path.join(partsPath, fileName);
        const fileStat = await stat(filePath);

        if (!fileStat.isFile()) {
          throw new Error('FS operation failed');
        }
      }
    } else {
      const items = await readdir(partsPath);

      filesToMerge = items
        .filter((item) => path.extname(item) === '.txt')
        .sort();

      if (filesToMerge.length === 0) {
        throw new Error('FS operation failed');
      }
    }

    let mergedContent = '';

    for (const fileName of filesToMerge) {
      const filePath = path.join(partsPath, fileName);
      const content = await readFile(filePath, 'utf-8');
      mergedContent += content;
    }

    await writeFile(mergedFilePath, mergedContent);
  } catch (error) {
    if (error instanceof Error && error.message === 'FS operation failed') {
      throw error;
    }

    throw new Error('FS operation failed');
  }
};

await merge();
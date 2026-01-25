import { writeFile, copyFile } from "fs/promises";
import { join, basename } from "path";

export async function copyImageToDirectory(
  sourcePath: string,
  targetDirectory: string,
): Promise<string> {
  const filename = basename(sourcePath);
  const targetPath = join(targetDirectory, filename);
  await copyFile(sourcePath, targetPath);
  return targetPath;
}

export async function saveImage(
  base64Data: string,
  directory: string,
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-${timestamp}.png`;
  const filepath = join(directory, filename);

  const buffer = Buffer.from(base64Data, "base64");
  await writeFile(filepath, buffer);

  return filepath;
}

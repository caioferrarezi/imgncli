import { writeFile } from "fs/promises";
import { join } from "path";

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

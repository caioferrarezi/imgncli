import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Copies an image file to the system clipboard (macOS only)
 */
export async function copyImageToClipboard(imagePath: string): Promise<void> {
  // Use AppleScript to copy image to clipboard on macOS
  const script = `set the clipboard to (read (POSIX file "${imagePath}") as TIFF picture)`;

  try {
    await execAsync(`osascript -e '${script}'`);
  } catch (error) {
    throw new Error(
      `Failed to copy image to clipboard: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

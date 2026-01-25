import { exec } from "child_process";
import { promisify } from "util";
import { platform } from "os";

const execAsync = promisify(exec);

/**
 * Copies an image file to the system clipboard (macOS and Linux)
 */
export async function copyImageToClipboard(imagePath: string): Promise<void> {
  const currentPlatform = platform();

  try {
    if (currentPlatform === "darwin") {
      // macOS: Use AppleScript to copy image to clipboard
      const script = `set the clipboard to (read (POSIX file "${imagePath}") as TIFF picture)`;
      await execAsync(`osascript -e '${script}'`);
    } else if (currentPlatform === "linux") {
      // Linux: Use xclip to copy image to clipboard
      // Requires xclip to be installed: apt install xclip
      await execAsync(`xclip -selection clipboard -t image/png -i "${imagePath}"`);
    } else {
      throw new Error(`Clipboard copy is not supported on ${currentPlatform}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to copy image to clipboard: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

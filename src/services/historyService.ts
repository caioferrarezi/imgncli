import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { historyRepository } from "../database/repositories/historyRepository";
import { getImagesDir, ensureAppDirectories } from "../database/database";
import type { HistoryEntry } from "../database/models";

/**
 * Service for history-related business logic
 */
export const historyService = {
  /**
   * Gets all history entries
   */
  async getHistory(): Promise<HistoryEntry[]> {
    return historyRepository.getAll();
  },

  /**
   * Saves an image to disk and adds to history
   */
  async saveImageToHistory(
    base64Data: string,
    prompt: string,
    model: string
  ): Promise<HistoryEntry> {
    await ensureAppDirectories();

    const id = randomUUID();
    const imagePath = join(getImagesDir(), `${id}.png`);
    const buffer = Buffer.from(base64Data, "base64");

    await writeFile(imagePath, buffer);

    const entry: HistoryEntry = {
      id,
      prompt,
      imagePath,
      createdAt: new Date().toISOString(),
      model,
    };

    await historyRepository.add(entry);
    return entry;
  },

  /**
   * Clears all history entries
   */
  async clearHistory(): Promise<void> {
    await ensureAppDirectories();
    return historyRepository.clear();
  },
};

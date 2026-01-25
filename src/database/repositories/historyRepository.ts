import { getHistoryDb } from "../database";
import type { HistoryEntry } from "../models";

/**
 * Repository for history data access
 */
export const historyRepository = {
  /**
   * Gets all history entries
   */
  async getAll(): Promise<HistoryEntry[]> {
    const db = await getHistoryDb();
    return db.data.entries || [];
  },

  /**
   * Adds a new history entry at the beginning
   */
  async add(entry: HistoryEntry): Promise<void> {
    const db = await getHistoryDb();
    db.data.entries.unshift(entry);
    await db.write();
  },

  /**
   * Clears all history entries
   */
  async clear(): Promise<void> {
    const db = await getHistoryDb();
    db.data.entries = [];
    await db.write();
  },
};

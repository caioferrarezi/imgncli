import { getConfigDb } from "../database";

/**
 * Repository for config data access
 */
export const configRepository = {
  /**
   * Gets the API key from config
   */
  async getApiKey(): Promise<string | null> {
    const db = await getConfigDb();
    return db.data.apiKey || null;
  },

  /**
   * Sets the API key in config
   */
  async setApiKey(apiKey: string): Promise<void> {
    const db = await getConfigDb();
    db.data.apiKey = apiKey;
    await db.write();
  },

  /**
   * Gets the selected model ID from config
   */
  async getSelectedModelId(): Promise<string | null> {
    const db = await getConfigDb();
    return db.data.selectedModel || null;
  },

  /**
   * Sets the selected model ID in config
   */
  async setSelectedModelId(modelId: string): Promise<void> {
    const db = await getConfigDb();
    db.data.selectedModel = modelId;
    await db.write();
  },
};

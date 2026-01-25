import { configRepository } from "../database/repositories/configRepository";
import { AVAILABLE_MODELS, DEFAULT_MODEL, type Model } from "../database/models";

/**
 * Service for config-related business logic
 */
export const configService = {
  /**
   * Gets the API key
   */
  async getApiKey(): Promise<string | null> {
    return configRepository.getApiKey();
  },

  /**
   * Saves the API key
   */
  async saveApiKey(apiKey: string): Promise<void> {
    return configRepository.setApiKey(apiKey);
  },

  /**
   * Gets the selected model (with fallback to default)
   */
  async getSelectedModel(): Promise<Model> {
    const modelId = await configRepository.getSelectedModelId();
    if (!modelId) return DEFAULT_MODEL;
    return AVAILABLE_MODELS.find((m) => m.id === modelId) || DEFAULT_MODEL;
  },

  /**
   * Saves the selected model
   */
  async saveSelectedModel(model: Model): Promise<void> {
    return configRepository.setSelectedModelId(model.id);
  },
};

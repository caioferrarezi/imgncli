export interface HistoryEntry {
  id: string;
  prompt: string;
  imagePath: string;
  createdAt: string;
  model?: string;
}

export const AVAILABLE_MODELS = [
  {
    id: "google/gemini-2.5-flash-image",
    name: "🍌 Nano Banana",
    default: true,
  },
  {
    id: "google/gemini-3-pro-image-preview",
    name: "🍌 Nano Banana Pro",
    default: false,
  },
  {
    id: "openai/gpt-5-image",
    name: "GPT-5 Image",
    default: false,
  },
  {
    id: "openai/gpt-5-image-mini",
    name: "GPT-5 Image Mini",
    default: false,
  },
] as const;

export const DEFAULT_MODEL = AVAILABLE_MODELS[0];
export type Model = (typeof AVAILABLE_MODELS)[number];
export type ModelId = Model["id"];

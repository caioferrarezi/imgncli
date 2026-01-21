import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { randomUUID } from "crypto";

const APP_DIR = join(homedir(), ".aiascii");
const IMAGES_DIR = join(APP_DIR, "images");
const HISTORY_FILE = join(APP_DIR, "history.json");
const CONFIG_FILE = join(APP_DIR, "config.json");

interface ConfigData {
  apiKey?: string;
  selectedModel?: string;
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
] as const;

export const DEFAULT_MODEL = AVAILABLE_MODELS[0]!.id;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];

/**
 * Loads the config from the global config file
 */
async function loadConfig(): Promise<ConfigData> {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data) as ConfigData;
  } catch {
    return {};
  }
}

/**
 * Saves the config to the global config file
 */
async function saveConfig(config: ConfigData): Promise<void> {
  await ensureAppDirectories();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Loads the API key from the global config file
 */
export async function loadApiKey(): Promise<string | null> {
  const config = await loadConfig();
  return config.apiKey || null;
}

/**
 * Saves the API key to the global config file
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  const config = await loadConfig();
  config.apiKey = apiKey;
  await saveConfig(config);
}

/**
 * Loads the selected model from config
 */
export async function loadSelectedModel(): Promise<ModelId> {
  const config = await loadConfig();
  return (config.selectedModel || DEFAULT_MODEL) as ModelId;
}

/**
 * Saves the selected model to config
 */
export async function saveSelectedModel(modelId: ModelId): Promise<void> {
  const config = await loadConfig();
  config.selectedModel = modelId;
  await saveConfig(config);
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  imagePath: string;
  createdAt: string;
}

interface HistoryData {
  entries: HistoryEntry[];
}

/**
 * Ensures the global app directories exist
 */
export async function ensureAppDirectories(): Promise<void> {
  await mkdir(APP_DIR, { recursive: true });
  await mkdir(IMAGES_DIR, { recursive: true });
}

/**
 * Loads history from the global history file
 */
export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const data = await readFile(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(data) as HistoryData;
    // Ensure we always return an array
    if (Array.isArray(parsed.entries)) {
      return parsed.entries;
    }
    return [];
  } catch {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

/**
 * Saves history to the global history file
 */
async function saveHistory(entries: HistoryEntry[]): Promise<void> {
  const data: HistoryData = { entries };
  await writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
}

/**
 * Saves an image to the global images directory and adds to history
 */
export async function saveImageToHistory(
  base64Data: string,
  prompt: string,
): Promise<HistoryEntry> {
  await ensureAppDirectories();

  const id = randomUUID();
  const imagePath = join(IMAGES_DIR, `${id}.png`);
  const buffer = Buffer.from(base64Data, "base64");

  await writeFile(imagePath, buffer);

  const entry: HistoryEntry = {
    id,
    prompt,
    imagePath,
    createdAt: new Date().toISOString(),
  };

  const history = await loadHistory();
  history.unshift(entry); // Add to beginning (newest first)
  await saveHistory(history);

  return entry;
}

/**
 * Gets the global app directory path
 */
export function getAppDir(): string {
  return APP_DIR;
}

/**
 * Gets the images directory path
 */
export function getImagesDir(): string {
  return IMAGES_DIR;
}

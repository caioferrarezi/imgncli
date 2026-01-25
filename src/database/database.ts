import { JSONFilePreset } from "lowdb/node";
import { join } from "path";
import { homedir } from "os";
import { mkdir } from "fs/promises";
import type { HistoryEntry } from "./models";

const APP_DIR = join(homedir(), ".aiascii");
const IMAGES_DIR = join(APP_DIR, "images");
const HISTORY_FILE = join(APP_DIR, "history.json");
const CONFIG_FILE = join(APP_DIR, "config.json");

export interface ConfigData {
  apiKey?: string;
  selectedModel?: string;
}

export interface HistoryData {
  entries: HistoryEntry[];
}

const defaultConfigData: ConfigData = {};
const defaultHistoryData: HistoryData = { entries: [] };

let configDbInstance: Awaited<ReturnType<typeof JSONFilePreset<ConfigData>>> | null = null;
let historyDbInstance: Awaited<ReturnType<typeof JSONFilePreset<HistoryData>>> | null = null;

/**
 * Ensures the global app directories exist
 */
export async function ensureAppDirectories(): Promise<void> {
  await mkdir(APP_DIR, { recursive: true });
  await mkdir(IMAGES_DIR, { recursive: true });
}

/**
 * Gets the config database instance (singleton)
 */
export async function getConfigDb() {
  if (!configDbInstance) {
    await ensureAppDirectories();
    configDbInstance = await JSONFilePreset<ConfigData>(CONFIG_FILE, defaultConfigData);
  }
  return configDbInstance;
}

/**
 * Gets the history database instance (singleton)
 */
export async function getHistoryDb() {
  if (!historyDbInstance) {
    await ensureAppDirectories();
    historyDbInstance = await JSONFilePreset<HistoryData>(HISTORY_FILE, defaultHistoryData);
  }
  return historyDbInstance;
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

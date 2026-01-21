import { createContext, useContext, useState, useEffect } from "react";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "../utils/storage";
import {
  loadHistory,
  loadApiKey,
  loadSelectedModel,
  type HistoryEntry,
  type ModelId,
} from "../utils/storage";

interface ImageResult {
  filepath: string;
  prompt: string;
}

interface StateContextType {
  selectedModel: ModelId;
  setSelectedModel: (modelId: ModelId) => void;
  imageResult: ImageResult | null;
  setImageResult: (result: ImageResult | null) => void;
  history: HistoryEntry[];
  setHistory: (history: HistoryEntry[]) => void;
  apiKey: string | null;
  setApiKey: (apiKey: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

const StateContext = createContext<StateContextType | null>(null);

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory().then(setHistory);
    loadApiKey().then(setApiKey);
    loadSelectedModel().then(setSelectedModel);
  }, []);

  function reset() {
    setError("");
    setImageResult(null);
  }

  return (
    <StateContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        imageResult,
        setImageResult,
        history,
        setHistory,
        apiKey,
        setApiKey,
        error,
        setError,
        reset,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

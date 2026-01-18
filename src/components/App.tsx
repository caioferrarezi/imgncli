import React, { useState, useEffect } from "react";
import { Box, Text, useStdout, useInput } from "ink";
import TextInput from "ink-text-input";
import Image, { TerminalInfoProvider } from "ink-picture";
import { generateImage } from "../api/openrouter";
import {
  saveImageToHistory,
  loadHistory,
  loadApiKey,
  saveApiKey,
  loadSelectedModel,
  saveSelectedModel,
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  type HistoryEntry,
} from "../utils/storage";
import { copyImageToClipboard } from "../utils/clipboard";
import BigText from "ink-big-text";
import Spinner from "ink-spinner";
import { SelectList } from "./SelectList";
import { CommandInput } from "./CommandInput";

type AppState =
  | "input"
  | "loading"
  | "displaying"
  | "error"
  | "history"
  | "viewing"
  | "setup"
  | "help"
  | "models";

interface ImageResult {
  filepath: string;
  prompt: string;
}

function AppContent() {
  const [state, setState] = useState<AppState>("input");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [setupInput, setSetupInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [modelIndex, setModelIndex] = useState(0);

  const { stdout } = useStdout();
  const [resizeKey, setResizeKey] = useState(0);

  const selectedModelName = AVAILABLE_MODELS.find(
    (m) => m.id === selectedModel,
  )?.name;

  useEffect(() => {
    const handleResize = () => {
      setResizeKey((prev) => prev + 1);
    };

    stdout?.on("resize", handleResize);
    return () => {
      stdout?.off("resize", handleResize);
    };
  }, [stdout]);

  // Load API key and selected model on mount
  useEffect(() => {
    loadApiKey().then(setApiKey);
    loadSelectedModel().then((model) => {
      setSelectedModel(model);
      const idx = AVAILABLE_MODELS.findIndex((m) => m.id === model);
      setModelIndex(idx >= 0 ? idx : 0);
    });
  }, []);

  function selectHistoryOption(index: number) {
    const selected = history[index];
    if (selected) {
      setImageResult({
        filepath: selected.imagePath,
        prompt: selected.prompt,
      });
      setState("viewing");
    }
  }

  function quitHistory() {
    setState("input");
    setPrompt("");
  }

  // Handle keyboard navigation in history view
  useInput(
    (input, key) => {
      if (state === "viewing") {
        if (key.return || key.escape || input === "q") {
          setState("history");
          setCopyStatus(null);
        } else if (input === "c" && imageResult) {
          setCopyStatus("Copying...");
          copyImageToClipboard(imageResult.filepath)
            .then(() => setCopyStatus("✅ Copied to clipboard!"))
            .catch(() => setCopyStatus("❌ Failed to copy"));
        }
      }
    },
    { isActive: state === "viewing" },
  );

  function selectModelOption(index: number) {
    const model = AVAILABLE_MODELS[index];
    if (model) {
      setSelectedModel(model.id);
      saveSelectedModel(model.id);
      setState("input");
    }
  }

  function quitModels() {
    setState("input");
  }

  // Handle keyboard navigation in models view
  useInput(
    (input, key) => {
      if (key.upArrow) {
        setModelIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setModelIndex((prev) =>
          Math.min(AVAILABLE_MODELS.length - 1, prev + 1),
        );
      } else if (key.return) {
        const model = AVAILABLE_MODELS[modelIndex];
        if (model) {
          setSelectedModel(model.id);
          saveSelectedModel(model.id);
          setState("input");
        }
      } else if (key.escape || input === "q") {
        setState("input");
      }
    },
    { isActive: state === "models" },
  );

  async function handleSubmit(value: string) {
    // Check for /history command
    if (value.trim().toLowerCase() === "/history") {
      const entries = await loadHistory();
      setHistory(entries);
      setState("history");
      setPrompt("");
      return;
    }

    // Check for /setup command
    if (value.trim().toLowerCase() === "/setup") {
      setState("setup");
      setPrompt("");
      setSetupInput("");
      return;
    }

    // Check for /help command
    if (value.trim().toLowerCase() === "/help") {
      setState("help");
      setPrompt("");
      return;
    }

    // Check for /models command
    if (value.trim().toLowerCase() === "/models") {
      const idx = AVAILABLE_MODELS.findIndex((m) => m.id === selectedModel);
      setModelIndex(idx >= 0 ? idx : 0);
      setState("models");
      setPrompt("");
      return;
    }

    if (!value.trim()) {
      setError("Please enter a prompt");
      setState("error");
      return;
    }

    setState("loading");
    setError("");

    const result = await generateImage(value, apiKey || "", selectedModel);

    if (!result.success) {
      setError(result.error);
      setState("error");
      return;
    }

    try {
      const entry = await saveImageToHistory(result.imageBase64, value);
      setImageResult({
        filepath: entry.imagePath,
        prompt: value,
      });
      setState("displaying");
    } catch (err) {
      setError(
        `Failed to save image: ${err instanceof Error ? err.message : String(err)}`,
      );
      setState("error");
    }
  }

  const handleReset = () => {
    setPrompt("");
    setError("");
    setImageResult(null);
    setState("input");
  };

  return (
    <Box flexDirection="column" padding={1}>
      {["input", "history", "models"].includes(state) && (
        <BigText text="imgncli" colors={["green", "green"]} />
      )}

      {state === "input" && (
        <CommandInput
          value={prompt}
          selectedModel={selectedModelName || ""}
          onChange={setPrompt}
          onSubmit={handleSubmit}
        />
      )}

      {state === "loading" && (
        <Box flexDirection="column">
          <Text color="green">
            <Text color="grey">
              <Spinner />
            </Text>{" "}
            Generating image...
          </Text>
          <Text dimColor>Prompt: {prompt}</Text>
        </Box>
      )}

      {state === "error" && (
        <Box flexDirection="column">
          <Text color="red">❌ Error: {error}</Text>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to try again...</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={handleReset} />
        </Box>
      )}

      {state === "displaying" && imageResult && (
        <Box flexDirection="column">
          <Text color="green">✅ Image generated and saved!</Text>
          <Text dimColor>Saved to: {imageResult.filepath}</Text>
          <Box marginTop={1} flexDirection="column" height={20}>
            <Image key={resizeKey} src={imageResult.filepath} />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to generate another image...</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={handleReset} />
        </Box>
      )}

      {state === "history" && (
        <SelectList
          title="Generation History"
          options={history.slice(0, 10).map((entry) => ({
            id: entry.id,
            name: entry.prompt.slice(0, 60),
            description: new Date(entry.createdAt).toLocaleDateString(),
          }))}
          onSelect={selectHistoryOption}
          onQuit={quitHistory}
        />
      )}

      {state === "viewing" && imageResult && (
        <Box flexDirection="column">
          <Text bold color="green">
            📷 Viewing Past Generation
          </Text>
          <Box marginTop={1} />
          <Text color="grey">
            Prompt:{" "}
            <Text bold color="white">
              {imageResult.prompt}
            </Text>
          </Text>
          <Box marginTop={1} flexDirection="column" height={20}>
            <Image key={resizeKey} src={imageResult.filepath} />
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>
              Press 'c' to copy to clipboard | Enter/Esc to go back
            </Text>
            {copyStatus && <Text color="green">{copyStatus}</Text>}
          </Box>
        </Box>
      )}

      {state === "setup" && (
        <Box flexDirection="column">
          <Text bold color="yellow">
            ⚙️ API Key Setup
          </Text>
          <Text dimColor>Get your API key from https://openrouter.ai/keys</Text>
          <Box marginTop={1}>
            <Text>Enter your OpenRouter API key:</Text>
          </Box>
          <Box>
            <Text color="green">&gt; </Text>
            <TextInput
              value={setupInput}
              onChange={setSetupInput}
              onSubmit={async (value) => {
                if (value.trim()) {
                  await saveApiKey(value.trim());
                  setApiKey(value.trim());
                }
                setState("input");
                setSetupInput("");
              }}
              placeholder="sk-or-..."
            />
          </Box>
          {apiKey && (
            <Box marginTop={1}>
              <Text dimColor>
                Current key: {apiKey.slice(0, 10)}...{apiKey.slice(-4)}
              </Text>
            </Box>
          )}
        </Box>
      )}

      {state === "models" && (
        <SelectList
          title="Select Model"
          options={AVAILABLE_MODELS.map((model) => ({
            id: model.id,
            name: model.name,
            description: model.id,
            selected: model.id === selectedModel,
          }))}
          onSelect={selectModelOption}
          onQuit={quitModels}
        />
      )}
    </Box>
  );
}

export function App() {
  return (
    <TerminalInfoProvider>
      <AppContent />
    </TerminalInfoProvider>
  );
}

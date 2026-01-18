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
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  // Handle keyboard navigation in history view
  useInput(
    (input, key) => {
      if (state === "history") {
        if (key.upArrow) {
          setSelectedIndex((prev) => Math.max(0, prev - 1));
        } else if (key.downArrow) {
          setSelectedIndex((prev) => Math.min(history.length - 1, prev + 1));
        } else if (key.return) {
          const selected = history[selectedIndex];
          if (selected) {
            setImageResult({
              filepath: selected.imagePath,
              prompt: selected.prompt,
            });
            setState("viewing");
          }
        } else if (key.escape || input === "q") {
          setState("input");
          setPrompt("");
        }
      } else if (state === "viewing") {
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
    { isActive: state === "history" || state === "viewing" },
  );

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

  const handleSubmit = async (value: string) => {
    // Check for /history command
    if (value.trim().toLowerCase() === "/history") {
      const entries = await loadHistory();
      setHistory(entries);
      setSelectedIndex(0);
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
  };

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
        <>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="grey"
            paddingX={1}
          >
            <Box>
              <Text color="green">&gt; </Text>
              <TextInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                placeholder="Generate an image or type /help for commands..."
              />
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text color="grey">Model: </Text>
            <Text color="green">{selectedModelName}</Text>
          </Box>
        </>
      )}

      {state === "loading" && (
        <Box flexDirection="column">
          <Text color="yellow">⏳ Generating image...</Text>
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
          <Box marginTop={1} flexDirection="column" height={30}>
            <Image key={resizeKey} src={imageResult.filepath} />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to generate another image...</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={handleReset} />
        </Box>
      )}

      {state === "history" && (
        <Box flexDirection="column">
          <Text bold>📜 Generation History</Text>
          <Text dimColor>
            Use ↑↓ to navigate, Enter to view, Esc/q to go back
          </Text>
          <Box marginTop={1} flexDirection="column">
            {history.length === 0 ? (
              <Text dimColor>No history yet. Generate some images first!</Text>
            ) : (
              history.slice(0, 10).map((entry, index) => (
                <Box key={entry.id}>
                  <Text
                    color={index === selectedIndex ? "cyan" : undefined}
                    bold={index === selectedIndex}
                  >
                    {index === selectedIndex ? "▶ " : "  "}
                    {entry.prompt.slice(0, 60)}
                    {entry.prompt.length > 60 ? "..." : ""}
                  </Text>
                  <Text dimColor>
                    {" "}
                    ({new Date(entry.createdAt).toLocaleDateString()})
                  </Text>
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}

      {state === "viewing" && imageResult && (
        <Box flexDirection="column">
          <Text bold color="magenta">
            📷 Viewing Past Generation
          </Text>
          <Text>Prompt: {imageResult.prompt}</Text>
          <Box marginTop={1} flexDirection="column" height={30}>
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

      {state === "help" && (
        <Box flexDirection="column">
          <Text bold color="cyan">
            📚 Available Commands
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text>
              <Text color="green">/help</Text> - Show this help message
            </Text>
            <Text>
              <Text color="green">/setup</Text> - Configure your OpenRouter API
              key
            </Text>
            <Text>
              <Text color="green">/models</Text> - Select AI model
            </Text>
            <Text>
              <Text color="green">/history</Text> - Browse past image
              generations
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Or just type any prompt to generate an image!</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to go back...</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={handleReset} />
        </Box>
      )}

      {state === "models" && (
        <Box flexDirection="column">
          <Text bold color="yellow">
            🤖 Select Model
          </Text>
          <Text dimColor>
            Use ↑↓ to navigate, Enter to select, Esc/q to cancel
          </Text>
          <Box marginTop={1} flexDirection="column">
            {AVAILABLE_MODELS.map((model, index) => (
              <Box key={model.id}>
                <Text
                  color={index === modelIndex ? "cyan" : undefined}
                  bold={index === modelIndex}
                >
                  {index === modelIndex ? "▶ " : "  "}
                  {model.name}
                </Text>
                <Text dimColor> ({model.id})</Text>
                {model.id === selectedModel && <Text color="green"> ✓</Text>}
              </Box>
            ))}
          </Box>
        </Box>
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

import { useState, useEffect } from "react";
import { Box, Text, useStdout, useInput, Spacer } from "ink";
import Image from "ink-picture";
import { copyImageToClipboard } from "../utils/clipboard";
import { copyImageToDirectory } from "../utils/file";

interface ImageDisplayProps {
  filepath: string;
  prompt: string;
  modelName?: string;
  showSaveInfo?: boolean;
  onBack: () => void;
  backLabel?: string;
}

export function ImageDisplay({
  filepath,
  prompt,
  modelName,
  showSaveInfo = false,
  onBack,
  backLabel = "Enter to continue",
}: ImageDisplayProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { stdout } = useStdout();
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setResizeKey((prev) => prev + 1);
    };

    stdout?.on("resize", handleResize);
    return () => {
      stdout?.off("resize", handleResize);
    };
  }, [stdout]);

  useEffect(() => {
    if (copyStatus) {
      setTimeout(() => {
        setCopyStatus(null);
      }, 2000);
    }
    if (saveStatus) {
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }
  }, [copyStatus, saveStatus]);

  useInput((input, key) => {
    if (key.ctrl) return;

    if (key.return || key.escape || input === "q") {
      onBack();
    } else if (input === "c") {
      setCopyStatus("Copying...");
      copyImageToClipboard(filepath)
        .then(() => setCopyStatus("✅ Copied to clipboard!"))
        .catch(() => setCopyStatus("❌ Failed to copy"));
    } else if (input === "s") {
      setSaveStatus("Saving...");
      copyImageToDirectory(filepath, process.cwd())
        .then((savedPath) => setSaveStatus(`✅ Saved to ${savedPath}`))
        .catch(() => setSaveStatus("❌ Failed to save"));
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="green">
        📷 {showSaveInfo ? "Image generated and saved!" : "Viewing Image"}
      </Text>
      {showSaveInfo && <Text dimColor>Saved to: {filepath}</Text>}
      <Box marginTop={1} />
      <Text color="grey">
        Prompt:{" "}
        <Text bold color="white">
          {prompt}
        </Text>
      </Text>
      {modelName && (
        <Text color="grey">
          Model:{" "}
          <Text bold color="white">
            {modelName}
          </Text>
        </Text>
      )}
      <Box marginTop={3} flexDirection="column" height={20}>
        <Image key={resizeKey} src={filepath} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Press 's' to save | 'c' to copy to clipboard | {backLabel}</Text>
        {saveStatus && <Text color="green">{saveStatus}</Text>}
        {copyStatus && <Text color="green">{copyStatus}</Text>}
      </Box>
    </Box>
  );
}

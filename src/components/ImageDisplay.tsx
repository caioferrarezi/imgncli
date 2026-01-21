import React, { useState, useEffect } from "react";
import { Box, Text, useStdout, useInput } from "ink";
import Image from "ink-picture";
import { copyImageToClipboard } from "../utils/clipboard";

interface ImageDisplayProps {
  filepath: string;
  prompt: string;
  showSaveInfo?: boolean;
  onBack: () => void;
  backLabel?: string;
}

export function ImageDisplay({
  filepath,
  prompt,
  showSaveInfo = false,
  onBack,
  backLabel = "Enter to continue",
}: ImageDisplayProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
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

  useInput((input, key) => {
    if (key.return || key.escape || input === "q") {
      onBack();
    } else if (input === "c") {
      setCopyStatus("Copying...");
      copyImageToClipboard(filepath)
        .then(() => setCopyStatus("✅ Copied to clipboard!"))
        .catch(() => setCopyStatus("❌ Failed to copy"));
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
      <Box marginTop={1} flexDirection="column" height={20}>
        <Image key={resizeKey} src={filepath} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Press 'c' to copy to clipboard | {backLabel}</Text>
        {copyStatus && <Text color="green">{copyStatus}</Text>}
      </Box>
    </Box>
  );
}

import { useState } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { CommandInput } from "../components/CommandInput";
import { useRouter, type RouteState } from "../contexts/RouterContext";
import { generateImage } from "../api/openrouter";
import { historyService } from "../services/historyService";
import { useStateContext } from "../contexts/StateContext";
import BigText from "ink-big-text";

export function InputPage() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const { selectedModel, apiKey, setError, setImageResult, setHistory } =
    useStateContext();
  const { navigate } = useRouter();

  async function handleSubmit(value: string) {
    if (!value) return;

    const isCommand = value.startsWith("/");

    if (isCommand) {
      if (value === "/clear") {
        await historyService.clearHistory();
        setHistory([]);
        setPrompt("");
        return;
      }

      navigate(value.slice(1) as RouteState);
      return;
    }

    await generate(value);
  }

  async function generate(value: string) {
    setLoading(true);

    const result = await generateImage(value, apiKey || "", selectedModel.id);

    if (!result.success) {
      setError(result.error);
      navigate("error");
      return;
    }

    try {
      const entry = await historyService.saveImageToHistory(result.imageBase64, value);
      setImageResult({
        filepath: entry.imagePath,
        prompt: value,
      });
      navigate("displaying");
    } catch (err) {
      setError(
        `Failed to save image: ${err instanceof Error ? err.message : String(err)}`,
      );
      navigate("error");
    }
  }

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">
          <Text color="grey">
            <Spinner />
          </Text>{" "}
          Generating image...
        </Text>
        <Text dimColor>Prompt: {prompt}</Text>
      </Box>
    );
  }

  return (
    <>
      <BigText text="imgncli" colors={["green", "green"]} />

      <Box flexDirection="column" padding={1}>
        <CommandInput
          value={prompt}
          selectedModel={selectedModel.name}
          onChange={setPrompt}
          onSubmit={handleSubmit}
        />
      </Box>
    </>
  );
}

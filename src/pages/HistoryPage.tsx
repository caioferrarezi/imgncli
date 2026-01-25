import { Box } from "ink";
import { SelectList } from "../components/SelectList";
import { useStateContext } from "../contexts/StateContext";
import { useRouter } from "../contexts/RouterContext";
import { useEffect } from "react";
import { loadHistory } from "../utils/storage";

export function HistoryPage() {
  const { history, setHistory, setImageResult } = useStateContext();
  const { navigate, goBack } = useRouter();

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  function handleSelect(index: number) {
    const entry = history[index];
    if (!entry) return;
    setImageResult({
      filepath: entry.imagePath,
      prompt: entry.prompt,
    });
    navigate("viewing");
  }

  function quit() {
    goBack();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <SelectList
        title="Generation History"
        options={history.slice(0, 10).map((entry) => ({
          id: entry.id,
          name: entry.prompt.slice(0, 60),
          description: new Date(entry.createdAt).toLocaleDateString(),
        }))}
        onSelect={handleSelect}
        onQuit={quit}
      />
    </Box>
  );
}

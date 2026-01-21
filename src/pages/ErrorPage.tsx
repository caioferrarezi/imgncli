import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useStateContext } from "../contexts/StateContext";
import { useRouter } from "../contexts/RouterContext";

export function ErrorPage() {
  const { error, reset } = useStateContext();
  const { goBack } = useRouter();

  function onRetry() {
    reset();
    goBack();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="red">❌ Error: {error}</Text>
      <Box marginTop={1}>
        <Text dimColor>Press Enter to try again...</Text>
      </Box>
      <TextInput value="" onChange={() => {}} onSubmit={onRetry} />
    </Box>
  );
}

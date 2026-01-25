import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { configService } from "../services/configService";
import { useStateContext } from "../contexts/StateContext";
import { useRouter } from "../contexts/RouterContext";

export function SetupPage() {
  const [setupInput, setSetupInput] = useState("");
  const { apiKey, setApiKey } = useStateContext();
  const { goBack } = useRouter();

  useInput((input, key) => {
    if (key.escape) {
      goBack();
    }
  });

  async function handleSubmit(value: string) {
    if (!value.trim()) return;
    await configService.saveApiKey(value.trim());
    setApiKey(value.trim());
    goBack();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="white">
        API Key Setup
      </Text>
      <Box>
        <Text dimColor>
          Add your OpenRouter API key, or press Esc to cancel
        </Text>
      </Box>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingX={1}
        marginTop={1}
        borderColor="grey"
        borderStyle="round"
      >
        <Text color="green">&gt; </Text>
        <TextInput
          value={setupInput}
          onChange={setSetupInput}
          onSubmit={handleSubmit}
          placeholder="sk-or-..."
        />
      </Box>
      {apiKey && (
        <Box marginTop={1}>
          <Text dimColor>
            Current key: {apiKey.slice(0, 10)}...
            {apiKey.slice(-4)}
          </Text>
        </Box>
      )}
    </Box>
  );
}

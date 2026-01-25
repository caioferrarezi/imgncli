import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { SelectList } from "./SelectList";

interface CommandInputProps {
  value: string;
  selectedModel: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

const COMMANDS = [
  { id: "/history", name: "/history", description: "View history" },
  { id: "/clear", name: "/clear", description: "Clear history" },
  { id: "/setup", name: "/setup", description: "Setup API key" },
  { id: "/models", name: "/models", description: "View models" },
];

export function CommandInput({
  value,
  selectedModel,
  onChange,
  onSubmit,
}: CommandInputProps) {
  const shouldShowHelp = value.trim().startsWith("/");
  const command = COMMANDS.find((c) => c.id === value);
  const filteredCommands = COMMANDS.filter((c) => c.id.startsWith(value));

  function handleSubmit(value: string) {
    if (command) {
      return onSubmit(command.id);
    }

    if (shouldShowHelp) {
      return;
    }

    onSubmit(value);
  }

  function handleChange(value: string) {
    onChange(value);
  }

  function selectCommand(index: number) {
    const command = filteredCommands[index];
    if (command) {
      onSubmit(command.id);
    }
  }

  function quitCommand() {
    onChange("");
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="grey"
        paddingX={1}
      >
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={value}
            onChange={handleChange}
            onSubmit={handleSubmit}
            placeholder="Type your prompt or / for commands..."
          />
        </Box>
      </Box>

      {shouldShowHelp && (
        <SelectList
          options={filteredCommands}
          onSelect={selectCommand}
          onQuit={quitCommand}
        />
      )}

      <Box>
        <Text color="grey">Model: </Text>
        <Text color="green">{selectedModel}</Text>
      </Box>
    </Box>
  );
}

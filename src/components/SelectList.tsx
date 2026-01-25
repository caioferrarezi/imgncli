import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";

interface SelectListProps {
  title?: string;
  options: {
    id: string;
    name: string;
    description?: string;
    selected?: boolean;
  }[];
  onSelect: (index: number) => void;
  onQuit: () => void;
}

export function SelectList({
  title,
  options,
  onSelect,
  onQuit,
}: SelectListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(options.length - 1, prev + 1));
    }
    if (key.return) {
      onSelect(selectedIndex);
    }
    if (key.escape) {
      onQuit();
    }
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [options]);

  return (
    <Box flexDirection="column">
      {title && (
        <Text bold color="white">
          {title}
        </Text>
      )}
      <Box>
        <Text dimColor>Use ↑↓ to navigate, Enter to select, Esc to cancel</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {options.length === 0 ? (
          <Text>No history found</Text>
        ) : (
          options.map((item, index) => (
            <Box key={item.id}>
              <Text
                color={index === selectedIndex ? "green" : undefined}
                bold={index === selectedIndex}
              >
                {index === selectedIndex ? "▶ " : "  "}
                {item.name}
              </Text>
              {item.description && <Text dimColor> ({item.description})</Text>}
              {item.selected && <Text color="green"> ✓</Text>}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

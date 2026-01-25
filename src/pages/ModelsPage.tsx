import React from "react";
import { Box } from "ink";
import { SelectList } from "../components/SelectList";
import { AVAILABLE_MODELS } from "../database/models";
import { configService } from "../services/configService";
import { useRouter } from "../contexts/RouterContext";
import { useStateContext } from "../contexts/StateContext";

export function ModelsPage() {
  const { goBack } = useRouter();
  const { selectedModel, setSelectedModel } = useStateContext();

  function handleSelect(index: number) {
    const model = AVAILABLE_MODELS[index];

    if (model) {
      setSelectedModel(model);
      configService.saveSelectedModel(model);
    }

    goBack();
  }

  function quit() {
    goBack();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <SelectList
        title="Select Model"
        options={AVAILABLE_MODELS.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.id,
          selected: model.id === selectedModel.id,
        }))}
        onSelect={handleSelect}
        onQuit={quit}
      />
    </Box>
  );
}

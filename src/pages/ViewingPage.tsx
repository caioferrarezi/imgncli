import React from "react";
import { Box } from "ink";
import { ImageDisplay } from "../components/ImageDisplay";
import { useStateContext, getModelName } from "../contexts/StateContext";
import { useRouter } from "../contexts/RouterContext";

interface ViewingPageProps {
  showSaveInfo?: boolean;
}

export function ViewingPage({
  showSaveInfo = false,
}: ViewingPageProps) {
  const { imageResult } = useStateContext();
  const { goBack } = useRouter();

  if (!imageResult) {
    goBack();
    return null;
  }

  function quit() {
    goBack();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <ImageDisplay
        filepath={imageResult.filepath}
        prompt={imageResult.prompt}
        modelName={getModelName(imageResult.model)}
        showSaveInfo={showSaveInfo}
        onBack={quit}
        backLabel="Enter/Esc to go back"
      />
    </Box>
  );
}

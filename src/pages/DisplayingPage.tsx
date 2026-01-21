import React from "react";
import { Box } from "ink";
import { ImageDisplay } from "../components/ImageDisplay";
import { useStateContext } from "../contexts/StateContext";
import { useRouter } from "../contexts/RouterContext";

export function DisplayingPage() {
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
        showSaveInfo={true}
        onBack={quit}
        backLabel="Enter to generate another"
      />
    </Box>
  );
}

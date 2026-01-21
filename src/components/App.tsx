import { Box, Text, useApp, useInput } from "ink";
import { Router, Route } from "../contexts/RouterContext";
import { useScreenSize } from "../hooks/useScreenSize";

import {
  InputPage,
  ErrorPage,
  DisplayingPage,
  HistoryPage,
  ViewingPage,
  SetupPage,
  ModelsPage,
} from "../pages";
import { useState } from "react";

export function App() {
  const { exit } = useApp();
  const { width, height } = useScreenSize();

  const [isCtrlCPressed, setIsCtrlCPressed] = useState(false);

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      if (isCtrlCPressed) {
        exit();
        return;
      }
      setIsCtrlCPressed(true);
    }
  });

  return (
    <Box width={width} height={height} flexDirection="column">
      <Router>
        <Route state="input">
          <InputPage />
        </Route>

        <Route state="displaying">
          <DisplayingPage />
        </Route>

        <Route state="history">
          <HistoryPage />
        </Route>

        <Route state="viewing">
          <ViewingPage />
        </Route>

        <Route state="setup">
          <SetupPage />
        </Route>

        <Route state="models">
          <ModelsPage />
        </Route>

        <Route state="error">
          <ErrorPage />
        </Route>
      </Router>

      {isCtrlCPressed && (
        <Box paddingX={1}>
          <Text color="red">Press CTRL+C again to exit</Text>
        </Box>
      )}
    </Box>
  );
}

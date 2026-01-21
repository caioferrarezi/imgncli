import React from "react";
import { render, useInput } from "ink";
import { App } from "./components/App.js";
import { TerminalInfoProvider } from "ink-picture";
import { StateProvider } from "./contexts/StateContext";

const { rerender, waitUntilExit } = render(<Root />, {
  exitOnCtrlC: false,
});

function Root() {
  return (
    <>
      <TerminalInfoProvider>
        <StateProvider>
          <App />
        </StateProvider>
      </TerminalInfoProvider>
    </>
  );
}

function write(content: string) {
  return new Promise<void>((resolve, reject) => {
    process.stdout.write(content, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function stop() {
  await waitUntilExit();
  await write("\x1b[?1049l");
}

async function start() {
  await write("\x1b[?1049h");

  rerender(
    <>
      <TerminalInfoProvider>
        <StateProvider>
          <App />
        </StateProvider>
      </TerminalInfoProvider>
    </>,
  );
}

await start();
await stop();

process.exit(0);

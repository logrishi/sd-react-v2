import "./assets/styles/globals.css";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/system";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <HeroUIProvider> */}
    <MantineProvider>
      <App />
    </MantineProvider>
    {/* </HeroUIProvider> */}
  </StrictMode>
);

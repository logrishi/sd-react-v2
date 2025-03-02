import "./assets/styles/globals.css";

import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/system";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
);

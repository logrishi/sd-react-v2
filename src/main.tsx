import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/globals.css";
import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/system";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
);

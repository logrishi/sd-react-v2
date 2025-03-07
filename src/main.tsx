import "./assets/styles/globals.css";

import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/system";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SessionManager from "./components/auth/session-manager.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <SessionManager>
        <App />
      </SessionManager>
    </HeroUIProvider>
  </StrictMode>
);

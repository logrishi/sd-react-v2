import "./assets/styles/globals.css";

import * as Sentry from "@sentry/react";

import App from "./App.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

Sentry.init({
  dsn: "https://b59cff73de4daf9fc6a16190ee086c74@o4508995211821056.ingest.de.sentry.io/4508995214508112",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

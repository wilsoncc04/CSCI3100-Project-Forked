import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} // Entry point for the build script in your package.json

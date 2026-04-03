import React from "react";
import { createRoot } from "react-dom/client";

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import App from "./components/App";

require("@rails/activestorage").start();

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} // Entry point for the build script in your package.json
import "./channels"

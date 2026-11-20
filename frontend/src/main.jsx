import React from "react";
// React root.
import { createRoot } from "react-dom/client";
// Main app.
import App from "./App";

// Mount app.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

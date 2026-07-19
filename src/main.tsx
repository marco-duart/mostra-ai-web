import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { globalStyles } from "./theme/stitches.config";
import { queryClient } from "./lib/queryClient";
import { ProducerAuthProvider } from "./contexts/producerAuth";

globalStyles();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProducerAuthProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
      </ProducerAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
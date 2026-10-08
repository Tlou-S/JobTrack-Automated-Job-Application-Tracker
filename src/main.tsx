import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from "./Components/CartContext";
import { SavedProvider } from "./Components/SavedContext";
import { ToastProvider } from "./Components/ToastContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <CartProvider>
        <SavedProvider>
          <App />
        </SavedProvider>
      </CartProvider>
    </ToastProvider>
  </StrictMode>
);
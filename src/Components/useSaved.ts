import { useContext } from "react";
import { SavedContext } from "./SavedContext";

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
}

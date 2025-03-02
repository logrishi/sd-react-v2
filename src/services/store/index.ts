import { createStore } from "./store-factory";
import { createZustandFactory } from "./zustand-adapter";

// Create store instance using Zustand implementation
export const store = createStore(createZustandFactory());

// Export types
export * from "./types";

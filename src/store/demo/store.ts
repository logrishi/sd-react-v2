import { createZustandFactory } from "../zustand-adapter";
import { store as stateDefinition } from "./states";

// Create store instance
const storeFactory = createZustandFactory();

// Create store adapters for each state slice
for (const [key, initialState] of Object.entries(stateDefinition)) {
  const persist = "persist" in initialState ? initialState.persist : false;
  storeFactory.createStore(key, initialState, persist);
}

// Export store instance
export const store = storeFactory;

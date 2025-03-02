import { Store, StoreFactory } from "./types";

import { store as stateDefinition } from "../../store";

// Create store instance using provided factory
export function createStore(factory: StoreFactory): Store {
  const storeMap = new Map<string, any>();

  // Create store adapters for each state slice
  for (const [key, initialState] of Object.entries(stateDefinition)) {
    const persist = "persist" in initialState ? initialState.persist : false;
    const storeSlice = factory.createStore(key, initialState, persist);
    storeMap.set(key, storeSlice);
  }

  return Object.fromEntries(storeMap) as Store;
}

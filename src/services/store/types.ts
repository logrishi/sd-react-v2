// Get state definition type
type StateDefinition = typeof import("./states").store;

// Helper type to extract state type without persist
export type ExtractState<T> = T extends { persist: unknown } ? Omit<T, "persist"> : T;

// Store adapter interface - this defines our core store API
export interface StoreAdapter<T> {
  (): ExtractState<T>; // Callable function that returns state (reactive in React)
  get: () => ExtractState<T>; // Non-reactive getter for snapshots
  set: (value: Partial<ExtractState<T>>) => void; // State setter with partial updates
}

// Store factory interface - this defines what any store implementation must provide
export interface StoreFactory {
  createStore: <T>(key: string, initialState: T, persist?: boolean | string[]) => StoreAdapter<T>;
}

// Helper type for using the store
export type Store = {
  [K in keyof StateDefinition]: StoreAdapter<StateDefinition[K]>;
};

# Store Documentation

## Overview

A lightweight, type-safe state management solution built on Zustand with a clean, consistent API for both React and non-React code.

## Key Features

- 🔄 Reactive state management in React components
- 📸 Non-reactive state snapshots
- 💾 Flexible persistence options
- 🔒 Type-safe operations
- 🎯 Partial state updates
- 🔌 Pluggable storage adapters

## API Reference

### 1. State Access Patterns

#### Reactive State Access (React Components)

```typescript
const { value } = store.slice(); // Subscribe to changes
```

#### Non-Reactive State Access (Anywhere)

```typescript
const value = store.slice.get(); // Get current snapshot
```

#### State Updates (Anywhere)

```typescript
store.slice.set({ value: newValue }); // Partial updates
```

### 2. State Definition Patterns

#### Direct State

```typescript
// Definition
export const counter = {
  count: 0,
};

// Usage
const { count } = store.counter();
store.counter.set({ count: count + 1 });
```

#### Wrapped State

```typescript
// Definition
export const form = {
  value: {
    username: "",
    isValid: false,
  },
};

// Usage
const { username, isValid } = store.form();
store.form.set({ username: "john" });
```

#### Persisted State

```typescript
// Definition
export const theme = {
  mode: "light" as "light" | "dark",
  persist: true, // Persist entire state
};

// Usage
const { mode } = store.theme();
store.theme.set({ mode: "dark" });
```

#### Selective Persistence

```typescript
// Definition
export const cart = {
  items: [] as string[],
  recentlyViewed: [] as string[],
  persist: ["recentlyViewed"], // Only persist specific fields
};

// Usage
const { items, recentlyViewed } = store.cart();
store.cart.set({
  items: [...items, "new-item"],
  recentlyViewed: [...recentlyViewed, "viewed-item"],
});
```

## Best Practices

### 1. State Organization

- Keep state definitions in `states.ts`
- Group related state in a single slice
- Use TypeScript for better type inference

### 2. React Components

- Use function call syntax for reactivity
- Destructure only needed values
- Update state with partial changes

### 3. Non-React Code

- Use `.get()` for snapshots
- Use `.set()` for updates
- Handle errors in persistence operations

### 4. Persistence

- Only persist necessary data
- Use selective persistence for large states
- Consider storage limitations

## Demo

Check out the `/demo` folder for working examples of:

- Basic counter
- Theme switching
- Todo list
- Form handling
- Settings management
- Shopping cart

Run the demo:

```bash
import StoreDemo from "@/core/store/demo";
```

## Type Safety

### Store Types

```typescript
// Store adapter interface
interface StoreAdapter<T> {
  (): ExtractState<T>;
  get: () => ExtractState<T>;
  set: (value: Partial<ExtractState<T>>) => void;
}

// Helper type for wrapped states
type ExtractState<T> = T extends { persist: unknown } ? Omit<T, "persist"> : T;
```

### Type Inference

```typescript
// State definition
const user = {
  value: {
    id: "",
    name: "",
  },
};

// Types are inferred
const { id, name } = store.user(); // ✅ Typed
store.user.set({ id: 123 }); // ❌ Type error
```

## Implementation Details

### Store Factory

- Creates store slices
- Handles persistence
- Manages subscriptions
- Provides consistent API

### Zustand Adapter

- Built on Zustand
- Implements store factory interface
- Handles state updates
- Manages persistence

## Error Handling

```typescript
try {
  const value = store.slice.get();
  store.slice.set({ value });
} catch (error) {
  console.error("Store operation failed:", error);
}
```

## Storage Adapters

```typescript
// Default localStorage
const store = createZustandFactory();

// Custom storage
const store = createZustandFactory(sessionStorage);
```

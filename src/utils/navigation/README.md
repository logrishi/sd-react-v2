# Navigation Utility

A simple navigation utility that works with TanStack Router both inside and outside components.

## Usage

### Inside Functional Components

```typescript
import { useNavigateTo } from "../utils/navigation/navigate";

function MyComponent() {
  const navigateTo = useNavigateTo();

  // Basic navigation
  navigateTo("/dashboard");

  // With URL parameters
  navigateTo("/profile/:id", {
    params: { id: "123" },
  });

  // With search parameters
  navigateTo("/dashboard", {
    search: { view: "grid", sort: "desc" },
  });

  // With state and replace
  navigateTo("/auth/login", {
    state: { from: "/dashboard" },
    replace: true,
  });

  // With hash
  navigateTo("/docs", {
    hash: "section-1",
  });

  // History navigation
  navigateTo("back");
  navigateTo("forward");
}
```

### Outside Functional Components

```typescript
import { navigateTo } from "../utils/navigation/navigate";

// In services, utilities, or any non-component code
function handleLogout() {
  // Basic navigation
  navigateTo("/login");

  // With parameters
  navigateTo("/profile/:id", {
    params: { id: "123" },
    search: { view: "grid" },
    replace: true,
    state: { from: "/dashboard" },
  });
}

// For back/forward navigation
function goBack() {
  navigateTo("back");
}

function goForward() {
  navigateTo("forward");
}
```

## API

### navigateTo(path, options?)

A function that handles navigation. Can be used both inside and outside components.

#### Parameters

1. `path: string`

   - The route path to navigate to
   - Use `:paramName` syntax for dynamic parameters
   - Use 'back' or 'forward' for history navigation

2. `options?: NavigateOptions`
   - Optional configuration object

#### Options

```typescript
{
  // State to pass to the next route
  state?: Record<string, unknown>

  // Replace current history entry instead of pushing
  replace?: boolean

  // URL parameters to replace in path
  params?: Record<string, string | number>

  // Search/Query parameters
  search?: Record<string, string>

  // URL hash
  hash?: string
}
```

### useNavigateTo()

A hook that returns the navigateTo function. Use this inside functional components.

## Examples

### Dynamic Routes

```typescript
// URL: /profile/123
navigateTo("/profile/:id", {
  params: { id: "123" },
});
```

### Search Parameters

```typescript
// URL: /dashboard?view=grid&sort=desc
navigateTo("/dashboard", {
  search: { view: "grid", sort: "desc" },
});
```

### State and Replace

```typescript
// Replace current history entry and pass state
navigateTo("/login", {
  state: { returnTo: "/dashboard" },
  replace: true,
});
```

### Hash Navigation

```typescript
// URL: /docs#installation
navigateTo("/docs", {
  hash: "installation",
});
```

### History Navigation

```typescript
navigateTo("back");
navigateTo("forward");
```

# Project Setup and Configuration

This document outlines the technical setup and configuration details of the project.

## Core Setup

### Vite + React

The project is bootstrapped with Vite, providing:

- Fast development server with HMR
- Optimized production builds
- TypeScript support out of the box

### TailwindCSS

- Version: 3.x
- Configured with PostCSS
- Custom configuration in `tailwind.config.js`
- Global styles in `src/assets/styles/globals.css`

## State Management

### Zustand

- Global state management solution
- State definitions located in `src/store/states.ts`
- Provides simple and scalable state management
- Integrated with React DevTools
- **All component states must be defined in the store folder, not in individual components**
- **Always follow the object-based state format defined in states.ts:**
  ```typescript
  export const store = {
    auth: {
      user: {},
      token: null,
      // other auth state...
    },
    // other state slices...
  };
  ```

### TanStack Query

- Handles server state management
- Configured for data fetching and caching
- Provides automatic background updates
- Optimistic updates support

## Form Validation

### Zod

- Used for all form validations
- Schema definitions in `src/lib/schemas.ts`
- Type-safe validation with detailed error messages
- Integrated with form submissions

## Routing

### React Router

- Type-safe routing solution
- File-based routing in features directory
- Supports nested layouts
- Handles dynamic routes
- Configuration in `src/router.ts`

## UI Components

### HeroUI

- Pre-built component library
- Documentation: https://www.heroui.com
- Customizable through TailwindCSS
- Accessible components out of the box

## Animation Libraries

### Framer Motion

- Production-ready animation library
- Handles complex animations and gestures
- Integrated with React components

### Rombo Animation

- TailwindCSS animation utilities
- Documentation: https://rombo.co/tailwind
- Provides pre-built animation classes

## API Integration

### Backend Services

- API methods located in `src/services/backend/actions.ts`
- Configured with Axios for HTTP requests
- Type-safe API calls
- Error handling middleware

## Import Rules

- **All 3rd party packages imports must come from vendors folder in `src/lib/vendors`**
- **All UI components must be imported from their dedicated files**
- **All icons must be imported from `src/assets/icons/index.ts`**
- **All images must be imported from `src/assets/images/index.ts`**
- **All utility functions must be imported from their respective utility files**

## TypeScript Guidelines

- Strict type checking enabled
- Custom type definitions in `src/types`
- Type utilities and helpers
- **When type is not known or complex, use `unknown` or `any` as the type**
- **Prefer `unknown` over `any` when possible for better type safety**

## Development Tools

### TypeScript

- Strict type checking enabled
- Custom type definitions in `src/types`
- Type utilities and helpers

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Pre-commit hooks for code quality

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_api_url
```

## Additional Configuration

For specific configuration needs:

1. TailwindCSS: `tailwind.config.js`
2. Vite: `vite.config.ts`
3. TypeScript: `tsconfig.json`
4. Environment: `.env` (for local/production development)

## Navigation Utility

### Overview

The project includes a simple navigation utility that works with TanStack Router, allowing for easy navigation both inside and outside of React functional components.

### Usage

#### Inside Functional Components

You can use the `useNavigateTo` hook to navigate between routes easily.

#### Outside Functional Components

You can use the `navigateTo` function directly in services or utilities for navigation without needing a React component context.

### API

- **`useNavigateTo()`**: Returns a function to navigate to a specified path with options.
- **`navigateTo(path: string, options?: NavigateOptions)`**: A function that handles navigation, usable both inside and outside components.

### NavigateOptions

- `state`: State to pass to the next route.
- `replace`: Replace current history entry instead of pushing.
- `params`: URL parameters to replace in the path.
- `search`: Search/query parameters.
- `hash`: URL hash.

## Absolute Imports Setup

To enable absolute imports in the project, the following configuration has been added to the `tsconfig.json` file:

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "*": ["*"]
    }
  },
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

### Usage

After setting up absolute imports, you can import modules using paths relative to the `src` directory. For example:

```typescript
import { useNavigateTo } from "utils/navigation/navigate";
import { store } from "store/states";
```

This eliminates the need for complex relative paths, making your imports cleaner and easier to manage.

# Saraighat Digital Workspace

A modern React application built with Vite and TypeScript, featuring a feature-based architecture and modern tooling.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Progress Documentation](#progress-documentation)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Core Setup](#core-setup)
6. [State Management](#state-management)
   - [Global State (Zustand)](#global-state-zustand)
   <!-- - [Server State (TanStack Query)](#server-state-tanstack-query) -->
7. [Form Validation](#form-validation)
8. [Routing](#routing)
9. [Assets](#assets)
10. [UI Components](#ui-components)
11. [Animation Libraries](#animation-libraries)
12. [API Integration](#api-integration)
13. [Import Rules](#import-rules)
14. [TypeScript Guidelines](#typescript-guidelines)
15. [Development Tools](#development-tools)
16. [Environment Variables](#environment-variables)
17. [Additional Configuration](#additional-configuration)
18. [Navigation Utility](#navigation-utility)
19. [Absolute Imports Setup](#absolute-imports-setup)
20. [Image Handling](#image-handling)
21. [Naming Conventions](#naming-conventions)

## Project Overview

This document outlines the technical setup and configuration details of the project.

### Progress Documentation

- Document every step taken or completed in the `PROGRESS.md` file to maintain a comprehensive and clear history of all changes and updates made to the project.

## Project Structure

The project follows a feature-based folder structure for better scalability and maintainability:

```
src/
├── assets/                  # Static assets (images, fonts, global styles)
│   ├── fonts/              # Font files
│   ├── images/             # Image files
│   └── styles/             # Global styles
│       └── globals.css     # Global CSS file
├── components/             # Shared, app-wide components
│   ├── common/            # Reusable UI elements
│   └── layout/            # Layout components
│   └── navigation/        # Navigation components
├── features/              # Feature-based modules
│   ├── home/              # Feature-specific component
│   ├── about/             # Feature-specific components
├── hooks/                 # Global custom hooks
├── lib/                   # External library configurations
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   └── vendors/           # Vendor libraries
├── services/              # Global API services
│   ├── backend/           # Backend services
│   ├── router/            # Routing services
│   └── store/             # Global state management
├── types/                 # TypeScript type definitions
├── routes.ts              # Main routing file
└── store.ts               # Main state management file
```

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun dev
```

3. Build for production:

```bash
bun run build
```

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

### Global State (Zustand)

- Global state management solution
- State definitions located in `src/store.ts`
- Provides simple and scalable state management
- Integrated with React DevTools
- **All component states must be defined in `src/store.ts` file, not in individual components**
- **Always follow the object-based state format defined in store.ts:**
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

<!-- ### Server State (TanStack Query)

- Handles server state management
- Configured for data fetching and caching
- Provides automatic background updates
- Optimistic updates support -->

## Form Validation

### Zod

- Used for all form validations
- Schema definitions in `src/lib/schemas.ts`
- Type-safe validation with detailed error messages
- Integrated with form submissions

## Routing

### React Router

- Configuration in `src/routes.ts`
- The project includes a simple navigation utility that works with React Router, allowing for easy navigation both inside and outside of React functional components.

## Assets

### Asset Structure

- Static assets are organized in `src/assets/`:
  - `fonts/`: Font files
  - `images/`: Image files
  - `styles/`: Global styles, including `globals.css`

## UI Components

### HeroUI

- Pre-built component library
- Documentation: https://www.heroui.com (using HeroUI v2.7.4)
- Customizable through TailwindCSS
- Accessible components out of the box

## Shadcn/ui

### Navigation Components

#### Sidebar

- Visible on large screens (lg breakpoint and above)
- Navigation items with icons and labels
- Active state tracking
- Supports left/right orientation

#### Bottom Tabs

- Mobile navigation for smaller screens
- Icon and label navigation items
- Active state tracking

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

- **All imports must use absolute paths with the `@/` alias (e.g., `import { something } from "@/store"`)**
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

The project includes a simple navigation utility that works with React Router, allowing for easy navigation both inside and outside of React functional components.

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
- `scrollToTop`: Enables scroll to top.

## Absolute Imports Setup

To enable absolute imports in the project, the following configuration has been added to the `tsconfig.json` file. **This setup must be used consistently across all files in the project**:

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    // "baseUrl": "src",
    // "paths": {
    //   "*": ["*"]
    // }
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Image Handling

When displaying images, ensure that the image paths are prefixed with `VITE_IMAGE_URL`. You can retrieve this value from the environment variables using the `getEnvVar()` function located in `lib/utils.env-vars.ts`. For example:

```javascript
const imageUrl = `${getEnvVar("VITE_IMAGE_URL")}/image-path`;
```

## Naming Conventions

All files and folder names in this project should be in lowercase and hyphen-separated (e.g., `my-file-name`, `my-folder-name`). This convention helps maintain consistency and readability throughout the project.

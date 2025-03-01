# Saraighat Digital Workspace

A modern React application built with Vite and TypeScript, featuring a feature-based architecture and modern tooling.

## Project Structure

The project follows a feature-based folder structure for better scalability and maintainability:

```
src/
├── assets/                  # Static assets (images, fonts, global styles)
├── components/             # Shared, app-wide components
│   ├── common/            # Reusable UI elements
│   └── layout/            # Layout components
├── features/              # Feature-based modules
│   ├── components/       # Feature-specific components
│   ├── hooks/           # Feature-specific custom hooks
│   ├── services/        # Feature-specific API services
│   ├── store/          # Feature-specific state management
│   └── routes/         # Feature routes and pages
├── hooks/               # Global custom hooks
├── lib/                # External library configurations
├── services/           # Global API services
├── store/              # Global state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Features Directory Structure

Each feature in the `features/` directory follows a modular structure:

- `components/`: UI components specific to the feature
- `hooks/`: Custom React hooks used within the feature
- `services/`: API services and data fetching logic
- `store/`: State management specific to the feature
- Route files (`.tsx`): Page components and routing logic

## Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS v3
- **State Management**:
  - Global: Zustand
  - Server State: TanStack Query
- **Routing**: TanStack Router
- **UI Components**: HeroUI
- **Animations**:
  - Framer Motion
  - Rombo Animation

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Documentation

For detailed setup information and configuration details, please refer to [SETUP.md](./SETUP.md).

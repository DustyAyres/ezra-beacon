# Frontend Project Structure

This frontend follows the bulletproof-react project structure for better organization and maintainability.

## Directory Structure

```
src/
├── assets/              # Static assets
│   ├── fonts/          # Font files
│   ├── icons/          # Icon files
│   └── images/         # Image files
│
├── components/         # Shared components used across the application
│   ├── Layout.tsx      # Main layout wrapper
│   └── Sidebar.tsx     # Navigation sidebar
│
├── config/             # Global configuration files
│   ├── authConfig.ts   # Authentication configuration
│   └── constants.ts    # Application constants and limits
│
├── features/           # Feature-based modules
│   ├── auth/          # Authentication feature
│   │   ├── components/
│   │   │   └── LoginPage.tsx
│   │   └── hooks/
│   │       └── useDevAuth.ts
│   │
│   ├── categories/    # Categories feature
│   │   ├── components/
│   │   │   └── CategoryManager.tsx
│   │   └── types/
│   │       └── index.ts
│   │
│   └── tasks/         # Tasks feature
│       ├── components/
│       │   ├── AddTask.tsx
│       │   ├── ImportantView.tsx
│       │   ├── MyDayView.tsx
│       │   ├── PlannedView.tsx
│       │   ├── TaskDetails.tsx
│       │   ├── TaskItem.tsx
│       │   ├── TaskList.tsx
│       │   ├── TasksView.tsx
│       │   └── ViewControls.tsx
│       └── types/
│           └── index.ts
│
├── lib/               # Reusable libraries and services
│   └── api.ts        # API service layer
│
├── styles/           # Global styles
│   └── index.css     # Global CSS and CSS variables
│
├── App.tsx           # Main application component
├── index.tsx         # Application entry point
└── service-worker.ts # PWA service worker
```

## Key Principles

1. **Feature-based organization**: Code is organized by features (tasks, categories, auth) rather than by file type
2. **Shared components**: Only truly shared components remain in the global components folder
3. **Type co-location**: Types are co-located with their features for better maintainability
4. **Clear separation**: Each feature is self-contained with its own components and types
5. **Global configuration**: Shared configuration and constants are centralized in the config folder

## Import Guidelines

- Import feature-specific types from their feature folders
- Import shared types and constants from the config folder
- Import API service from the lib folder
- Use relative imports within features
- Use absolute imports (from src root) when importing across features

This structure makes the codebase more scalable and maintainable as the application grows.

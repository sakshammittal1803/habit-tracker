# Project Structure

## File Organization
React-based single page application with Vite build system:

```
/
├── index.html              # Vite entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx           # React app entry point
│   ├── App.jsx            # Main app component
│   ├── App.css            # App-level styles
│   ├── components/        # React components
│   │   ├── HabitForm.jsx
│   │   ├── WeekNavigation.jsx
│   │   ├── HabitGrid.jsx
│   │   └── HabitRow.jsx
│   ├── hooks/             # Custom React hooks
│   │   └── useLocalStorage.js
│   └── utils/             # Utility functions
│       └── dateUtils.js
└── .kiro/                 # Kiro configuration
    └── steering/          # AI assistant guidance
```

## React Component Conventions
- Use functional components with hooks
- Follow PascalCase for component names
- Use JSX file extension for components
- Implement custom hooks for reusable logic
- Keep components small and focused

## CSS Organization
- Component-scoped CSS files (ComponentName.css)
- CSS modules for style isolation
- Use CSS custom properties for theming
- Mobile-first responsive design

## JavaScript Patterns
- Use React hooks (useState, useEffect, useCallback)
- Custom hooks for complex state logic
- ES6+ syntax with destructuring and arrow functions
- Functional programming patterns where appropriate

## Key Components
1. **App**: Main application container
2. **HabitForm**: Add new habits input form
3. **WeekNavigation**: Week navigation controls
4. **HabitGrid**: Container for all habit rows
5. **HabitRow**: Individual habit with daily checkboxes

## Naming Conventions
- **Components**: PascalCase (HabitTracker.jsx)
- **Files**: PascalCase for components, camelCase for utilities
- **CSS Classes**: BEM methodology or CSS modules
- **Props**: camelCase
- **Hooks**: start with 'use' prefix (useHabits)
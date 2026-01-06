# Technology Stack

## Frontend Technologies
- **React 18**: Component-based UI library
- **CSS3**: Component-scoped styling with CSS variables for theming
- **Modern JavaScript (ES6+)**: JSX and React hooks
- **Recharts**: Data visualization for weekly statistics

## Desktop Application
- **Electron**: Cross-platform desktop app framework
- **Native Menus**: Windows-style application menus with keyboard shortcuts
- **System Integration**: Desktop shortcuts, taskbar integration, file associations

## Architecture
- **Desktop Application**: Native Windows app with Electron wrapper
- **Single Page Application (SPA)**: React-based with component architecture
- **Local storage**: Data persistence handled via browser's localStorage API
- **No server required**: Fully offline desktop application

## Build System
- **Vite**: Fast build tool and dev server for React development
- **Electron Builder**: Desktop app packaging and distribution
- **npm**: Package management
- **ES modules**: Modern JavaScript module system

## Development Commands
- **Install dependencies**: `npm install`
- **Web development server**: `npm run dev`
- **Electron development**: `npm run electron-dev`
- **Build web app**: `npm run build`
- **Build desktop app**: `npm run dist`
- **Run electron app**: `npm run electron`

## File Structure
- `index.html` - Vite entry point
- `src/App.jsx` - Main React component
- `src/main.jsx` - React application entry point
- `src/components/` - React components
- `src/pages/` - Application pages
- `electron/main.js` - Electron main process
- `electron/preload.js` - Electron preload script
- `package.json` - Dependencies and build scripts
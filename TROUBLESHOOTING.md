# Habit Tracker - Troubleshooting Guide

## Common Issues and Solutions

### 1. Exe File Won't Start

**Symptoms:**
- Double-clicking the exe does nothing
- App starts then immediately closes
- White screen or blank window

**Solutions:**

#### A. Run from Command Line to See Errors
```cmd
cd "release\habit-tracker-win32-x64"
habit-tracker.exe
```

#### B. Check Windows Defender/Antivirus
- Windows Defender might block unsigned executables
- Add the app folder to exclusions
- Or right-click exe → Properties → Unblock

#### C. Missing Dependencies
- Install Visual C++ Redistributable 2019/2022
- Download from Microsoft's official site

#### D. Rebuild the App
```cmd
# Run this to rebuild everything
build-app.bat
```

### 2. App Starts But Shows Blank Screen

**Cause:** Usually a path issue in production build

**Solution:**
1. Check if `dist` folder exists and has files
2. Rebuild with: `npm run build && npm run dist`

### 3. Data Not Persisting

**Cause:** App running in wrong mode or permissions issue

**Solutions:**
- Run as administrator once
- Check if app has write permissions to its folder

### 4. Performance Issues

**Solutions:**
- Use the portable version instead of installer
- Close other Electron apps
- Restart the app

### 5. Build Fails with "locked file" or "app.asar" error

**Cause:** A previous instance of the app or a debugger is holding onto the build files.

**Solution:**
1. Open Task Manager and kill all "Habit Tracker" or "Electron" processes.
2. Manually delete the `release` and `dist` folders.
3. Run `build-app.bat` again.

## Build Process

### Clean Build (Recommended)
```cmd
# Use the automated script
build-app.bat
```

### Manual Build
```cmd
# Clean previous builds
rmdir /s /q dist
rmdir /s /q release

# Install dependencies
npm install

# Build React app
npm run build

# Build Electron app
npm run dist
```

## File Locations

### Development
- Source code: `src/`
- Built React app: `dist/`
- Electron files: `electron/`

### Production
- Installer: `release/Habit Tracker Setup 1.0.0.exe`
- Portable: `release/Habit Tracker-1.0.0-portable.exe`
- Unpacked app: `release/win-unpacked/`

## Getting Help

1. Check this troubleshooting guide
2. Run `test-app.bat` to test the current build
3. Look at console output for specific error messages
4. Try rebuilding with `build-app.bat`

## System Requirements

- Windows 10 or later (64-bit)
- 4GB RAM minimum
- 200MB free disk space
- Visual C++ Redistributable (usually pre-installed)
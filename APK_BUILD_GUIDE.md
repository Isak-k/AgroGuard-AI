# 📱 AgroGuard AI - APK Debug Build Guide

## 🎯 Quick Start

### Option 1: Automated Build (Recommended)
```bash
# Build debug APK automatically
build-debug-apk.bat

# Install on connected device
install-debug-apk.bat
```

### Option 2: Manual Build
```bash
# 1. Build web assets
npm run build:debug

# 2. Initialize Android (first time only)
npm run android:init

# 3. Sync and build APK
npm run android:build
```

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18+) - Already installed ✅
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK** (v11+) - Included with Android Studio
4. **Android SDK** - Installed via Android Studio

### Android Studio Setup
1. Install Android Studio
2. Open SDK Manager (Tools → SDK Manager)
3. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

### Environment Variables
Add to your system PATH:
```
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\platform-tools
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\tools
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\build-tools\34.0.0
```

## 🔨 Build Process

### Step 1: Prepare Web Build
```bash
# Build optimized web assets for debug
npm run build:debug
```
This creates a `dist/` folder with the web application.

### Step 2: Initialize Capacitor (First Time Only)
```bash
# Add Android platform
npx cap add android
```
This creates the `android/` folder with the native Android project.

### Step 3: Sync Web Assets
```bash
# Copy web assets to Android project
npx cap sync android
```

### Step 4: Build APK
```bash
# Navigate to android folder and build
cd android
gradlew assembleDebug
```

## 📱 APK Output

### Debug APK Location
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### APK Details
- **Package Name**: `com.agroguard.ai.debug`
- **App Name**: "AgroGuard AI Debug"
- **Version**: 1.0.0-debug
- **Debuggable**: Yes
- **Minimum SDK**: Android 5.1 (API 22)
- **Target SDK**: Android 14 (API 34)

## 📲 Installation Methods

### Method 1: ADB Install (Recommended)
```bash
# Check connected devices
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Start app
adb shell am start -n com.agroguard.ai.debug/com.agroguard.ai.MainActivity
```

### Method 2: Manual Install
1. Copy `app-debug.apk` to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Tap the APK file to install
4. Launch "AgroGuard AI Debug" from app drawer

### Method 3: Android Studio
1. Open `android/` folder in Android Studio
2. Connect your device via USB
3. Click "Run" button or press Shift+F10

## 🛠️ Development Configuration

### Debug Features Enabled
- **DevTools Panel** (🛠️ button) - Real-time debugging
- **Performance Monitor** (📊 button) - Performance tracking
- **Enhanced Error Boundary** - Detailed error information
- **Console Logging** - Verbose debug output
- **Mobile Debug Overlay** - On-screen debugging

### Network Configuration
The debug APK is configured to connect to:
- **Backend API**: http://localhost:3001 (when connected to same network)
- **Development Server**: http://192.168.137.249:8081 (for live reload)

### For Network Testing
1. Ensure your device is on the same WiFi network as your development machine
2. Update `capacitor.config.ts` with your local IP:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:8081',
  cleartext: true
}
```

## 🔧 Build Scripts Available

| Script | Description |
|--------|-------------|
| `npm run build:debug` | Build web assets for debug |
| `npm run android:init` | Initialize Android platform |
| `npm run android:sync` | Sync web assets to Android |
| `npm run android:build` | Build debug APK |
| `npm run android:run` | Build and run on device |
| `npm run android:open` | Open in Android Studio |

## 🐛 Troubleshooting

### Common Issues

#### 1. "Android SDK not found"
**Solution**: Install Android Studio and add SDK to PATH
```bash
# Add to PATH:
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\platform-tools
```

#### 2. "Java not found"
**Solution**: Install Java JDK 11+ or use Android Studio's bundled JDK
```bash
# Set JAVA_HOME to Android Studio's JDK:
C:\Program Files\Android\Android Studio\jbr
```

#### 3. "Gradle build failed"
**Solution**: 
- Clean and rebuild: `cd android && gradlew clean && gradlew assembleDebug`
- Check Android SDK installation
- Verify `android/local.properties` has correct SDK path

#### 4. "Device not found"
**Solution**:
- Enable USB debugging on device
- Install device drivers
- Check connection: `adb devices`

#### 5. "Installation failed"
**Solution**:
- Enable "Install from Unknown Sources"
- Uninstall previous version first
- Use: `adb install -r -d app-debug.apk`

### Debug APK Testing

#### Network Connectivity
1. Connect device to same WiFi as development machine
2. Test backend connection: Open app → DevTools → Test API
3. Check if backend is accessible from device's browser

#### Performance Testing
1. Use Performance Monitor (📊 button) in the app
2. Monitor memory usage and render performance
3. Test on different Android versions and devices

#### Error Testing
1. Use DevTools panel (🛠️ button) for real-time logs
2. Test error boundary with "Test Error" button
3. Export debug information for analysis

## 🚀 Production Build

For production APK (when ready):
```bash
# Build production web assets
npm run build

# Sync to Android
npx cap sync android

# Build release APK (requires signing)
cd android
gradlew assembleRelease
```

## 📊 Build Optimization

### Debug Build Features
- Source maps enabled for debugging
- Verbose logging enabled
- DevTools included
- No code minification
- Fast build times

### File Size
- Debug APK: ~15-20MB (includes debug symbols)
- Release APK: ~8-12MB (optimized and minified)

---

## 🎉 Ready to Build!

Your AgroGuard AI project is now configured for APK builds. Use the automated scripts for the easiest experience:

1. **Build**: Run `build-debug-apk.bat`
2. **Install**: Run `install-debug-apk.bat`
3. **Test**: Launch "AgroGuard AI Debug" on your device

The debug APK includes all development tools and debugging features for optimal testing and development workflow.

*Last updated: January 27, 2026*
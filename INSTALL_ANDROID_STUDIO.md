# 📱 Android Studio Installation Guide

## 🎯 Quick Installation Steps

### 1. Download Android Studio
- Go to: https://developer.android.com/studio
- Download "Android Studio Koala" (latest version)
- File size: ~1GB

### 2. Install Android Studio
1. Run the downloaded installer
2. Follow the setup wizard
3. Choose "Standard" installation
4. Wait for components to download (~3-4GB)

### 3. Configure Android SDK
1. Open Android Studio
2. Go to: File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Install these components:
   - ✅ Android SDK Platform 34
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Command-line Tools

### 4. Add to System PATH
Add these paths to your Windows environment variables:

**Path locations (replace [USERNAME] with your username):**
```
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\platform-tools
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\tools
C:\Users\[USERNAME]\AppData\Local\Android\Sdk\build-tools\34.0.0
```

**How to add to PATH:**
1. Press Win + R, type `sysdm.cpl`, press Enter
2. Click "Environment Variables"
3. Under "System Variables", find and select "Path"
4. Click "Edit" → "New"
5. Add each path above
6. Click OK to save
7. Restart your command prompt

### 5. Verify Installation
Open a new command prompt and test:
```bash
java -version          # Should show Java version
adb version           # Should show ADB version
```

## 🚀 After Installation

Once Android Studio is installed, you can build the APK:

```bash
# Build the debug APK
build-debug-apk.bat

# Or manually:
npm run android:build
```

The APK will be created at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Install APK on Device

### Method 1: USB Installation
```bash
# Connect device via USB, enable USB debugging
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Manual Installation
1. Copy `app-debug.apk` to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install

---

**Estimated time:** 30-45 minutes for full setup
**Disk space needed:** ~5GB total
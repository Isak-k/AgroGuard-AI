@echo off
echo 📱 Installing AgroGuard AI Debug APK...
echo.

REM Check if ADB is available
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ADB not found in PATH
    echo Please install Android SDK Platform Tools
    echo.
    pause
    exit /b 1
)

REM Check if APK exists
if not exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ❌ Debug APK not found
    echo Please run build-debug-apk.bat first
    echo.
    pause
    exit /b 1
)

echo 🔍 Checking connected devices...
adb devices
echo.

echo 📱 Installing APK...
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
if %errorlevel% neq 0 (
    echo ❌ APK installation failed
    echo.
    echo 💡 Troubleshooting:
    echo    1. Enable USB debugging on your device
    echo    2. Allow installation from unknown sources
    echo    3. Check if device is connected: adb devices
    echo    4. Try: adb install -r -d android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ APK installed successfully!
echo.
echo 🚀 Starting app...
adb shell am start -n com.agroguard.ai.debug/com.agroguard.ai.MainActivity
echo.
echo 📱 AgroGuard AI Debug should now be running on your device
echo.
pause
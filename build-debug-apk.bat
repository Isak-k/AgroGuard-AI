@echo off
echo 🔨 Building AgroGuard AI Debug APK...
echo.

REM Check if Android SDK is available
where android >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Android SDK not found in PATH
    echo Please install Android Studio and add SDK to PATH
    echo.
    pause
    exit /b 1
)

REM Check if Java is available
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java not found in PATH
    echo Please install Java JDK 11 or higher
    echo.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

echo 📦 Step 1: Building web assets for debug...
call npm run build:debug
if %errorlevel% neq 0 (
    echo ❌ Web build failed
    pause
    exit /b 1
)

echo ✅ Web build completed
echo.

echo 🔄 Step 2: Initializing Capacitor Android (if needed)...
if not exist "android" (
    echo Creating Android project...
    call npx cap add android
    if %errorlevel% neq 0 (
        echo ❌ Failed to add Android platform
        pause
        exit /b 1
    )
) else (
    echo Android project already exists
)

echo 🔄 Step 3: Syncing web assets to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Capacitor sync failed
    pause
    exit /b 1
)

echo ✅ Capacitor sync completed
echo.

echo 🔨 Step 4: Building Android Debug APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ Android build failed
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ APK Build Completed Successfully!
echo.
echo 📱 Debug APK Location:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 📋 APK Information:
dir "android\app\build\outputs\apk\debug\app-debug.apk" 2>nul
echo.
echo 🚀 Next Steps:
echo    1. Install on device: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo    2. Or copy APK to device and install manually
echo    3. Enable USB debugging on your Android device
echo.
pause
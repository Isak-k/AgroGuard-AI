@echo off
echo 🌐 Creating APK using Online Builder...
echo.

echo 📦 Step 1: Building web assets...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Web build completed
echo.

echo 📋 Step 2: Preparing for online build...
echo.
echo 🌐 Your app is ready for online APK building!
echo.
echo 📁 Files ready in 'dist/' folder
echo 📊 App size: 
dir dist /s /-c | find "bytes"
echo.

echo 🚀 Next steps to get your APK:
echo.
echo Option 1 - GitHub Actions (Automated):
echo   1. Push this code to GitHub
echo   2. Go to Actions tab
echo   3. Run "Build Android APK" workflow
echo   4. Download APK when complete
echo.
echo Option 2 - Capacitor Live:
echo   1. Sign up at https://capacitorjs.com/cloud
echo   2. Upload your project
echo   3. Build APK online
echo   4. Download app-debug.apk
echo.
echo Option 3 - AppGyver (Free):
echo   1. Sign up at https://www.appgyver.com
echo   2. Import web app from dist/ folder
echo   3. Build Android APK
echo   4. Download app-debug.apk
echo.

pause
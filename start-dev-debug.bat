@echo off
echo 🛠️ Starting AgroGuard in Debug Mode...
echo.

REM Set development environment variables
set NODE_ENV=development
set VITE_DEBUG=true
set VITE_VERBOSE_LOGGING=true
set VITE_MOBILE_DEBUG=true

echo 📋 Environment Configuration:
echo    NODE_ENV=%NODE_ENV%
echo    VITE_DEBUG=%VITE_DEBUG%
echo    VITE_VERBOSE_LOGGING=%VITE_VERBOSE_LOGGING%
echo    VITE_MOBILE_DEBUG=%VITE_MOBILE_DEBUG%
echo.

REM Check if backend is running
echo 🔍 Checking backend status...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend not running. Starting backend first...
    echo.
    start "AgroGuard Backend" cmd /k "cd backend && npm run dev"
    echo ⏳ Waiting for backend to start...
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Backend is already running
)

echo.
echo 🚀 Starting frontend with debug configuration...
echo    Using vite.config.dev.ts for enhanced debugging
echo    DevTools will be available in the app
echo    Check browser console for detailed logs
echo.

REM Start frontend with development config
npm run dev:debug

echo.
echo 🏁 Development session ended
pause
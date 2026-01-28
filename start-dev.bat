@echo off
echo Starting AgroGuard Development Servers...
echo.

echo Installing dependencies...
call npm install
cd backend
call npm install
cd ..

echo.
echo Starting backend server...
start "AgroGuard Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "AgroGuard Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause
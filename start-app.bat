@echo off
echo Starting Cloud File Storage...
echo.

echo Checking for Node.js installation...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Starting the application...
echo.
echo ========================================
echo  Cloud File Storage is running!
echo  Open your browser and go to:
echo  http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

call npm start

pause

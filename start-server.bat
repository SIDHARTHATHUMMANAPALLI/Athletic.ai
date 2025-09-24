@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    AthleteAI Platform                       ║
echo ║                                                              ║
echo ║  🚀 Starting the AthleteAI server...                        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo.
    echo 💡 Please install Python from https://python.org
    echo    Make sure to check "Add Python to PATH" during installation
    echo.
    echo 🔄 Alternative: Use any web server to serve the files
    echo    - VS Code Live Server extension
    echo    - XAMPP, WAMP, or similar
    echo    - Any HTTP server
    echo.
    pause
    exit /b 1
)

echo ✅ Python found, starting server...
echo.

REM Start the server
python server.py

echo.
echo 🛑 Server stopped
pause

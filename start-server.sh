#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    AthleteAI Platform                       ║"
echo "║                                                              ║"
echo "║  🚀 Starting the AthleteAI server...                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed or not in PATH"
        echo ""
        echo "💡 Please install Python from https://python.org"
        echo "   or use your system package manager:"
        echo "   - Ubuntu/Debian: sudo apt install python3"
        echo "   - macOS: brew install python3"
        echo "   - CentOS/RHEL: sudo yum install python3"
        echo ""
        echo "🔄 Alternative: Use any web server to serve the files"
        echo "   - VS Code Live Server extension"
        echo "   - Apache, Nginx, or similar"
        echo "   - Any HTTP server"
        echo ""
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python found, starting server..."
echo ""

# Start the server
$PYTHON_CMD server.py

echo ""
echo "🛑 Server stopped"

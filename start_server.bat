@echo off
title Studio Song Recognition Server
color 0A

echo Starting Studio Song Recognition Server...
echo.
echo Please wait while we check the environment...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Python found! Starting server...
echo.

REM Run the server
python server.py

REM If we get here, there was an error
color 0C
echo.
echo Server stopped unexpectedly.
pause 
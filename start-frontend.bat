@echo off
cd /d "%~dp0frontend\frontend"
echo Installing frontend dependencies...
call npm install
echo.
echo Starting frontend server...
call npm start
pause

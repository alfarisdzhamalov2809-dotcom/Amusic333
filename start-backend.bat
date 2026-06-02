@echo off
cd /d "%~dp0backend"
echo Installing backend dependencies...
call npm install
echo.
echo Running seed script...
call node seed.js
echo.
echo Starting backend server...
call node server.js
pause

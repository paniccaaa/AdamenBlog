@echo off
set PORT=5173
set DIR=%~dp0

echo Запуск блога на http://localhost:%PORT%
echo Нажми Ctrl+C чтобы остановить.

start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:%PORT%"

where python >nul 2>&1
if %errorlevel%==0 (
  cd /d "%DIR%" && python -m http.server %PORT%
  goto end
)

where npx >nul 2>&1
if %errorlevel%==0 (
  npx serve "%DIR%" -p %PORT%
  goto end
)

echo Ошибка: нужен Python 3 или Node.js
pause
:end

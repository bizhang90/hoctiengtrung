@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === DEPLOY HOCTIENGTRUNG CLOUDFLARE WORKER ===
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Chua co Node.js. Cai Node.js LTS truoc.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 goto :fail
call npx wrangler whoami
if errorlevel 1 (
  echo.
  echo Chua dang nhap Cloudflare. Dang mo trinh duyet de login...
  call npx wrangler login
  if errorlevel 1 goto :fail
)
echo.
call npm run deploy
if errorlevel 1 goto :fail
echo.
echo [OK] Worker da deploy. Copy URL workers.dev va dat vao VITE_API_BASE_URL cua frontend.
pause
exit /b 0
:fail
echo.
echo [ERROR] Deploy that bai. Gui anh man hinh loi cho ChatGPT.
pause
exit /b 1

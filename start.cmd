@echo off
setlocal EnableDelayedExpansion
title PatchPulse
where node >nul 2>nul
if %errorlevel% equ 0 (
  for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set "PATCHPULSE_NODE_MAJOR=%%V"
  if !PATCHPULSE_NODE_MAJOR! geq 22 (
    node "%~dp0dist\cli.js"
    exit /b !errorlevel!
  )
)
set "PATCHPULSE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%PATCHPULSE_NODE%" (
  "%PATCHPULSE_NODE%" "%~dp0dist\cli.js"
  exit /b %errorlevel%
)
echo [erro] Node.js 22+ nao encontrado. Instale em https://nodejs.org/
pause
exit /b 1

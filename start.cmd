@echo off
setlocal EnableDelayedExpansion
title Pathfinding Lab
where node >nul 2>nul
if %errorlevel% equ 0 (
  for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set "PATHLAB_NODE_MAJOR=%%V"
  if !PATHLAB_NODE_MAJOR! geq 22 (
    node "%~dp0dist\cli.js"
    exit /b !errorlevel!
  )
)
set "PATHLAB_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%PATHLAB_NODE%" (
  "%PATHLAB_NODE%" "%~dp0dist\cli.js"
  exit /b %errorlevel%
)
echo [erro] Node.js 22+ nao encontrado. Instale em https://nodejs.org/
pause
exit /b 1

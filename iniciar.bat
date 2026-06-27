@echo off
title Parque Industrial Jicamarca - Iniciando con Cloudflare Tunnels
setlocal EnableDelayedExpansion

:: Obtener ruta actual del proyecto
set "BASE_DIR=%~dp0"

echo [1/5] Iniciando API local...
start "" wscript "%BASE_DIR%ejecutar.vbs" "%BASE_DIR%api"
timeout /t 3 /nobreak >nul

echo [2/5] Solicitando Tunel Publico para la API...
:: Ejecutamos cloudflared en segundo plano y redirigimos la salida a un log
start "" wscript "%BASE_DIR%ejecutar_tunnel.vbs" "cloudflared tunnel --url http://localhost:5001 2> ""%BASE_DIR%api_tunnel.log"""

echo Esperando que Cloudflare asigne la URL (esto puede tardar unos segundos)...
:WAIT_API_URL
timeout /t 2 /nobreak >nul
findstr "trycloudflare.com" "%BASE_DIR%api_tunnel.log" >nul
if %errorlevel% neq 0 goto WAIT_API_URL

:: Usar powershell para extraer exactamente la URL (ej: https://aleatorio.trycloudflare.com)
for /f "delims=" %%A in ('powershell -Command "Select-String -Path '%BASE_DIR%api_tunnel.log' -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | %% { $_.Matches.Value } | Select-Object -First 1"') do (
    set "API_PUBLIC_URL=%%A"
)

echo URL del API obtenida: %API_PUBLIC_URL%

echo [3/5] Configurando el Frontend con la nueva URL...
:: Sobrescribimos el archivo .env del front
echo VITE_API_URL=%API_PUBLIC_URL%/api> "%BASE_DIR%front\.env"

echo [4/5] Iniciando Frontend local...
start "" wscript "%BASE_DIR%ejecutar.vbs" "%BASE_DIR%front"
timeout /t 5 /nobreak >nul

echo [5/5] Solicitando Tunel Publico para el Frontend...
start "" wscript "%BASE_DIR%ejecutar_tunnel.vbs" "cloudflared tunnel --url http://localhost:5173 2> ""%BASE_DIR%front_tunnel.log"""

:WAIT_FRONT_URL
timeout /t 2 /nobreak >nul
findstr "trycloudflare.com" "%BASE_DIR%front_tunnel.log" >nul
if %errorlevel% neq 0 goto WAIT_FRONT_URL

for /f "delims=" %%B in ('powershell -Command "Select-String -Path '%BASE_DIR%front_tunnel.log' -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | %% { $_.Matches.Value } | Select-Object -First 1"') do (
    set "FRONT_PUBLIC_URL=%%B"
)

echo.
echo ========================================================
echo ¡SISTEMA EN LINEA EN INTERNET!
echo.
echo URL API Oculta:  %API_PUBLIC_URL%
echo URL FRONTEND:    %FRONT_PUBLIC_URL%
echo ========================================================
echo.

:: Abrir el frontend publico en tu navegador
start %FRONT_PUBLIC_URL%

exit

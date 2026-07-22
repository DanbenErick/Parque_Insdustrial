@echo off
title Parque Industrial Jicamarca

:: Obtener ruta actual del proyecto
set "BASE_DIR=%~dp0"

:: Verificar si el frontend ya está corriendo
netstat -ano | find ":5173" >nul
if %errorlevel%==0 (
    start http://localhost:5173
    exit
)

:: Iniciar API oculto
start "" wscript "%BASE_DIR%ejecutar.vbs" "%BASE_DIR%api"

:: Esperar un poco
timeout /t 3 /nobreak >nul

:: Iniciar Front oculto
start "" wscript "%BASE_DIR%ejecutar.vbs" "%BASE_DIR%front"

:: Esperar que Vite levante
timeout /t 8 /nobreak >nul

:: Abrir navegador
start http://localhost:5173

exit
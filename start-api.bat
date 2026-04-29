@echo off
chcp 65001 >nul
title PlusCode Academy API Server
cls

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║          PlusCode Academy - API Server Launcher                  ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Configuration
set "API_DIR=api"
set "DEFAULT_PORT=8080"
set "FALLBACK_PORTS=8000 8888 3000 5000"
set "PHP_CMD=php"

REM Check if PHP is installed
where %PHP_CMD% >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP no está instalado o no está en el PATH
    echo.
    echo Por favor instala PHP desde: https://windows.php.net/download
    echo O asegurate de que php.exe esté en el PATH del sistema
    echo.
    pause
    exit /b 1
)

echo [✓] PHP detectado
echo.

REM Get PHP version
for /f "tokens=2" %%a in ('php -v 2^>^&1 ^| findstr "PHP "') do (
    echo [INFO] Version PHP: %%a
    echo.
)

REM Check if MySQL is running (optional check)
echo [INFO] Verificando MySQL...
timeout /t 1 /nobreak >nul
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] MySQL está corriendo
) else (
    echo [!] MySQL no detectado (opcional si usas otro servidor)
)
echo.

REM Try to find an available port
echo [INFO] Buscando puerto disponible...
set "PORT=%DEFAULT_PORT%"

call :check_port %PORT%
if %PORT_AVAILABLE% equ 1 goto :port_found

REM Try fallback ports
for %%p in (%FALLBACK_PORTS%) do (
    call :check_port %%p
    if %PORT_AVAILABLE% equ 1 (
        set "PORT=%%p"
        goto :port_found
    )
)

echo [ERROR] No se encontró ningún puerto disponible
pause
exit /b 1

:port_found
echo [✓] Puerto encontrado: %PORT%
echo.

REM Check if .env file exists and load custom port
if exist "api\.env" (
    for /f "tokens=1,2 delims==" %%a in ('type api\.env ^| findstr /r "^API_PORT="') do (
        if "%%a"=="API_PORT" (
            set "CUSTOM_PORT=%%b"
            call :check_port %CUSTOM_PORT%
            if %PORT_AVAILABLE% equ 1 (
                echo [INFO] Usando puerto personalizado desde .env: %CUSTOM_PORT%
                set "PORT=%CUSTOM_PORT%"
            ) else (
                echo [WARN] Puerto %CUSTOM_PORT% ocupado, usando %PORT%
            )
        )
    )
)

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║   Servidor iniciando...                                          ║
echo ║                                                                  ║
echo ║   URL: http://localhost:%PORT%/api                                 ║
echo ║   Test: http://localhost:%PORT%/api/test-connection.php            ║
echo ║                                                                  ║
echo ║   Presiona Ctrl+C para detener                                   ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Save port to file for frontend detection
echo http://localhost:%PORT%/api> .api-url.tmp

REM Start PHP server
cd /d "%~dp0"
php -S localhost:%PORT% -t %API_DIR% router.php

REM Cleanup
del .api-url.tmp 2>nul

echo.
echo Servidor detenido.
pause
exit /b 0

REM Function to check if port is available
:check_port
set "PORT_AVAILABLE=0"
set "PORT_TO_CHECK=%~1"

REM Try to connect to the port using PowerShell
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient('localhost', %PORT_TO_CHECK%); $c.Close(); exit 1 } catch { exit 0 }" 2>nul

if %errorlevel% equ 0 (
    set "PORT_AVAILABLE=1"
)
goto :eof

@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cls

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║       PlusCode Academy - Full Stack Launcher                     ║
echo ║       (3 Tabs: XAMPP ^| Backend ^| Frontend)                        ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Detect XAMPP installation
set "XAMPP_PATH="
set "XAMPP_FOUND=0"

REM Common XAMPP installation paths
for %%p in ("C:\xampp" "D:\xampp" "E:\xampp" "C:\Program Files\xampp" "C:\XAMPP" "%ProgramFiles%\xampp" "%ProgramFiles(x86)%\xampp") do (
    if exist "%%~p\xampp-control.exe" (
        set "XAMPP_PATH=%%~p"
        set "XAMPP_FOUND=1"
        goto :xampp_found
    )
)

:xampp_found
if %XAMPP_FOUND% equ 1 (
    echo [✓] XAMPP detectado en: %XAMPP_PATH%
) else (
    echo [!] XAMPP no detectado - se usara servidor PHP embebido
)
echo.

REM Check prerequisites
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] PHP no encontrado en PATH
    pause
    exit /b 1
)
echo [✓] PHP disponible

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Node.js/npm no encontrado
    pause
    exit /b 1
)
echo [✓] Node.js/npm disponible
echo.

REM Check Windows Terminal availability
where wt >nul 2>&1
set "HAS_WT=%errorlevel%"

if %HAS_WT% equ 0 (
    echo [✓] Windows Terminal detectado - usando 3 pestanas
    goto :use_wt
) else (
    echo [i] Windows Terminal no detectado - usando ventanas separadas
    goto :use_fallback
)

:use_wt
REM Use Windows Terminal with 3 tabs
set "WT_CMD=wt"

REM Build the command - 3 tabs total
echo [INFO] Iniciando 3 pestanas en Windows Terminal...
echo.

REM Tab 1: XAMPP or MySQL/MariaDB only (quiet background)
if %XAMPP_FOUND% equ 1 (
    REM Start XAMPP Apache and MySQL in background, then keep tab open for logs
    set "TAB1= %WT_CMD% new-tab -d "%CD%" cmd /k "echo [TAB 1/3] XAMPP Server ^&^& echo Iniciando Apache y MySQL... ^&^& start /b ^"%XAMPP_PATH%\apache_start.bat^" ^>nul 2^>^&1 ^&^& start /b ^"%XAMPP_PATH%\mysql_start.bat^" ^>nul 2^>^&1 ^&^& timeout /t 3 ^>nul ^&^& echo [✓] XAMPP iniciado - Apache en puerto 80, MySQL en 3306 ^&^& echo Presiona Ctrl+C y luego cualquier tecla para detener ^&^& pause ^&^& call ^"%XAMPP_PATH%\apache_stop.bat^" ^&^& call ^"%XAMPP_PATH%\mysql_stop.bat^""
) else (
    REM No XAMPP - just info tab
    set "TAB1= %WT_CMD% new-tab -d "%CD%" cmd /k "echo [TAB 1/3] Base de Datos ^&^& echo [INFO] Asegurate de tener MySQL corriendo manualmente ^&^& echo o usa: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD= -e MYSQL_DATABASE=pluscode_academy mysql:8 ^&^& pause"
)

REM Tab 2: Backend API Server
set "TAB2= ; new-tab -d "%CD%" cmd /k "echo [TAB 2/3] Backend API Server ^&^& echo Iniciando servidor PHP... ^&^& call start-api.bat"

REM Tab 3: Frontend Vue Dev Server
set "TAB3= ; new-tab -d "%CD%" cmd /k "echo [TAB 3/3] Frontend Dev Server ^&^& echo Iniciando Vue... ^&^& npm run dev"

REM Execute all tabs
%TAB1%%TAB2%%TAB3%

goto :eof

:use_fallback
REM Fallback: Use separate CMD windows or sequential
cls
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║       PlusCode Academy - Full Stack Launcher (Fallback)          ║
echo ║                                                                  ║
echo ║  Windows Terminal no detectado - abriendo 3 ventanas de CMD      ║
echo ║  O puedes ejecutar manualmente en 3 terminales:                  ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Opciones:
echo.
echo 1. Abrir 3 ventanas de CMD automaticamente (mas facil)
echo 2. Ver comandos para ejecutar manualmente (mas control)
echo.
choice /C 12 /N /M "Elige una opcion (1 o 2): "

if %errorlevel% equ 1 goto :open_windows
if %errorlevel% equ 2 goto :show_commands

:open_windows
echo.
echo [INFO] Abriendo 3 ventanas de CMD...
echo.

REM Window 1: XAMPP
if %XAMPP_FOUND% equ 1 (
    start "XAMPP - Tab 1/3" cmd /k "echo [TAB 1/3] XAMPP Server ^&^& echo Iniciando... ^&^& call ^"%XAMPP_PATH%\apache_start.bat^" ^&^& call ^"%XAMPP_PATH%\mysql_start.bat^" ^&^& echo [✓] XAMPP listo ^&^& echo Presiona una tecla para detener Apache y MySQL... ^&^& pause ^>nul ^&^& call ^"%XAMPP_PATH%\apache_stop.bat^" ^&^& call ^"%XAMPP_PATH%\mysql_stop.bat^""
) else (
    start "BD - Tab 1/3" cmd /k "echo [TAB 1/3] Base de Datos ^&^& echo [INFO] Inicia MySQL manualmente ^&^& pause"
)

REM Window 2: Backend
start "Backend - Tab 2/3" cmd /k "echo [TAB 2/3] Backend API Server ^&^& call start-api.bat"

REM Window 3: Frontend (keep this window)
echo [✓] Ventanas abiertas.
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║   Esta ventana se convertira en el Frontend (Tab 3)            ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
pause
call npm run dev
goto :eof

:show_commands
cls
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║       Comandos para ejecutar manualmente                         ║
echo ║       (Abre 3 terminales y ejecuta uno en cada)                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo ========== TERMINAL 1: XAMPP / Base de Datos ==========
if %XAMPP_FOUND% equ 1 (
    echo cd /d "%CD%"
    echo "%XAMPP_PATH%\apache_start.bat"
    echo "%XAMPP_PATH%\mysql_start.bat"
    echo.
    echo Para detener:
    echo "%XAMPP_PATH%\apache_stop.bat"
    echo "%XAMPP_PATH%\mysql_stop.bat"
) else (
    echo # Inicia MySQL manualmente o usa Docker:
    echo docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=pluscode_academy mysql:8
)
echo.
echo ========== TERMINAL 2: Backend API ==========
echo cd /d "%CD%"
echo start-api.bat
echo.
echo ========== TERMINAL 3: Frontend ==========
echo cd /d "%CD%"
echo npm run dev
echo.
pause
goto :eof

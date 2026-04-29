@echo off
chcp 65001 >nul
title PlusCode Academy - API Setup
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║          PlusCode Academy - Setup de API                         ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Verificando requisitos...
echo.

REM Check PHP
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] PHP no encontrado
    echo.
    echo Por favor instala PHP desde:
    echo https://windows.php.net/download
    echo.
    echo Asegurate de agregar php.exe al PATH del sistema.
    echo.
    pause
    exit /b 1
)
echo [✓] PHP instalado

REM Check MySQL
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] MySQL no encontrado en PATH
    echo Puedes instalar MySQL como parte de XAMPP o WAMP
) else (
    echo [✓] MySQL encontrado
)

REM Check database file
if not exist "database\pluscode_academy.sql" (
    echo [✗] Archivo de base de datos no encontrado
    echo Verifica que exista: database\pluscode_academy.sql
    pause
    exit /b 1
)
echo [✓] Archivo de base de datos encontrado

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║   Configuracion de Base de Datos                                 ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Para configurar la base de datos, necesitas:    
echo.
echo   1. MySQL Server corriendo (XAMPP/WAMP/Laragon)
echo   2. Usuario root o un usuario con permisos CREATE
echo.
echo [INFO] Opciones de configuracion:
echo.
echo   A. Usar XAMPP/WAMP (recomendado para Windows)
echo      - Coloca esta carpeta en htdocs o www
echo      - MySQL ya viene incluido
      - Edita api\config\database.php con tus credenciales
echo.
echo   B. Usar MySQL standalone
echo      - Instala MySQL Server
      - Crea la base de datos: CREATE DATABASE pluscode_academy;
echo      - Importa: mysql -u root -p pluscode_academy ^< database\pluscode_academy.sql
echo.
echo [INFO] Configuracion actual (api\config\database.php):
echo.
type api\config\database.php | findstr "const HOST\|const DB_NAME\|const USERNAME\|const PASSWORD"
echo.

choice /C YN /M "¿Quieres editar la configuracion de la base de datos ahora"
if %errorlevel% equ 1 (
    echo.
    echo [INFO] Abriendo archivo de configuracion...
    echo [INFO] Modifica las constantes HOST, USERNAME y PASSWORD
    echo.
    notepad api\config\database.php
)

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║   Iniciar Servidor                                               ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
choice /C YN /M "¿Quieres iniciar el servidor API ahora"
if %errorlevel% equ 1 (
    echo.
    echo [INFO] Iniciando servidor...
    echo [INFO] El script detectara automaticamente un puerto disponible
    echo.
    call start-api.bat
) else (
    echo.
    echo [INFO] Para iniciar el servidor manualmente, ejecuta:
    echo   start-api.bat
    echo.
    echo [INFO] Para probar la conexion:
    echo   http://localhost:8080/api/test-connection.php
    echo.
    pause
)

#!/bin/bash

# PlusCode Academy - API Server Launcher (Linux/Mac)
# Usage: ./start-api.sh [port]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_DIR="api"
DEFAULT_PORT=8080
FALLBACK_PORTS=(8000 8888 3000 5000)
PHP_CMD="php"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║          PlusCode Academy - API Server Launcher                  ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if PHP is installed
if ! command -v $PHP_CMD &> /dev/null; then
    echo -e "${RED}[ERROR] PHP no está instalado o no está en el PATH${NC}"
    echo ""
    echo "Por favor instala PHP:"
    echo "  Ubuntu/Debian: sudo apt-get install php php-mysql"
    echo "  Mac: brew install php"
    echo "  O descarga desde: https://php.net/downloads"
    echo ""
    exit 1
fi

echo -e "${GREEN}[✓] PHP detectado${NC}"
echo ""

# Get PHP version
PHP_VERSION=$($PHP_CMD -v | head -n 1 | cut -d " " -f 2)
echo -e "${BLUE}[INFO] Versión PHP: $PHP_VERSION${NC}"
echo ""

# Check if MySQL is running (optional)
echo -e "${BLUE}[INFO] Verificando MySQL...${NC}"
if command -v mysql &> /dev/null; then
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}[✓] MySQL está corriendo${NC}"
    else
        echo -e "${YELLOW}[!] MySQL no detectado (opcional)${NC}"
    fi
else
    echo -e "${YELLOW}[!] MySQL no instalado (opcional)${NC}"
fi
echo ""

# Function to check if port is available
check_port() {
    local port=$1
    if command -v nc &> /dev/null; then
        # Use netcat if available
        ! nc -z localhost $port 2>/dev/null
    elif command -v lsof &> /dev/null; then
        # Use lsof if available
        ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    else
        # Fallback: try to connect with bash
        (echo > /dev/tcp/localhost/$port) 2>/dev/null
        if [ $? -eq 0 ]; then
            return 1  # Port is in use
        else
            return 0  # Port is available
        fi
    fi
}

# Determine port to use
if [ -n "$1" ]; then
    # User provided a port
    PORT=$1
    if ! check_port $PORT; then
        echo -e "${RED}[ERROR] El puerto $PORT está ocupado${NC}"
        exit 1
    fi
else
    # Auto-detect available port
    echo -e "${BLUE}[INFO] Buscando puerto disponible...${NC}"
    
    PORT=$DEFAULT_PORT
    if ! check_port $PORT; then
        # Try fallback ports
        PORT_FOUND=false
        for p in "${FALLBACK_PORTS[@]}"; do
            if check_port $p; then
                PORT=$p
                PORT_FOUND=true
                break
            fi
        done
        
        if [ "$PORT_FOUND" = false ]; then
            echo -e "${RED}[ERROR] No se encontró ningún puerto disponible${NC}"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}[✓] Puerto seleccionado: $PORT${NC}"
echo ""

# Check for .env file
if [ -f "api/.env" ]; then
    CUSTOM_PORT=$(grep "^API_PORT=" api/.env | cut -d '=' -f2)
    if [ -n "$CUSTOM_PORT" ] && check_port $CUSTOM_PORT; then
        echo -e "${YELLOW}[INFO] Usando puerto personalizado desde .env: $CUSTOM_PORT${NC}"
        PORT=$CUSTOM_PORT
    fi
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║   Servidor iniciando...                                          ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║   URL: http://localhost:$PORT/api                                 ║${NC}"
echo -e "${BLUE}║   Test: http://localhost:$PORT/api/test-connection.php            ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║   Presiona Ctrl+C para detener                                   ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Save port to temp file for frontend detection
echo "http://localhost:$PORT/api" > .api-url.tmp

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servidor...${NC}"
    rm -f .api-url.tmp
    exit 0
}

# Set trap for cleanup on Ctrl+C
trap cleanup INT TERM

# Start PHP server
cd "$(dirname "$0")"
$PHP_CMD -S localhost:$PORT -t $API_DIR ../router.php

# Cleanup (should not reach here normally due to trap)
cleanup

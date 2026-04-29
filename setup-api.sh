#!/bin/bash

# PlusCode Academy - API Setup Script (Linux/Mac)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║          PlusCode Academy - Setup de API                         ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}[INFO] Verificando requisitos...${NC}"
echo ""

# Check PHP
if ! command -v php &> /dev/null; then
    echo -e "${RED}[✗] PHP no encontrado${NC}"
    echo ""
    echo "Por favor instala PHP:"
    echo "  Ubuntu/Debian: sudo apt-get install php php-mysql"
    echo "  Mac: brew install php"
    echo "  CentOS/RHEL: sudo yum install php php-mysqlnd"
    echo ""
    exit 1
fi
echo -e "${GREEN}[✓] PHP instalado${NC}"

# Check MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}[✓] MySQL encontrado${NC}"
else
    echo -e "${YELLOW}[!] MySQL no encontrado${NC}"
    echo "  Instala con: sudo apt-get install mysql-server (Ubuntu)"
    echo "  O: brew install mysql (Mac)"
fi

# Check database file
if [ ! -f "database/pluscode_academy.sql" ]; then
    echo -e "${RED}[✗] Archivo de base de datos no encontrado${NC}"
    echo "Verifica que exista: database/pluscode_academy.sql"
    exit 1
fi
echo -e "${GREEN}[✓] Archivo de base de datos encontrado${NC}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Configuracion de Base de Datos                                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}[INFO] Para configurar la base de datos:${NC}"
echo ""
echo "  1. Asegurate de tener MySQL corriendo"
echo "  2. Crea la base de datos:"
echo "     mysql -u root -p -e 'CREATE DATABASE pluscode_academy;'"
echo ""
echo "  3. Importa el esquema:"
echo "     mysql -u root -p pluscode_academy < database/pluscode_academy.sql"
echo ""
echo -e "${BLUE}[INFO] Configuracion actual (api/config/database.php):${NC}"
echo ""
grep -E "const (HOST|DB_NAME|USERNAME|PASSWORD)" api/config/database.php
echo ""

read -p "¿Quieres editar la configuracion de la base de datos? (s/n): " edit_config
if [[ $edit_config == "s" || $edit_config == "S" ]]; then
    echo ""
    echo -e "${YELLOW}[INFO] Abriendo archivo de configuracion...${NC}"
    # Try different editors
    if command -v nano &> /dev/null; then
        nano api/config/database.php
    elif command -v vim &> /dev/null; then
        vim api/config/database.php
    elif command -v code &> /dev/null; then
        code api/config/database.php
    else
        echo "Por favor edita manualmente: api/config/database.php"
        echo "Presiona Enter para continuar..."
        read
    fi
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Iniciar Servidor                                               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "¿Quieres iniciar el servidor API ahora? (s/n): " start_server
if [[ $start_server == "s" || $start_server == "S" ]]; then
    echo ""
    echo -e "${GREEN}[INFO] Iniciando servidor...${NC}"
    echo -e "${BLUE}[INFO] El script detectara automaticamente un puerto disponible${NC}"
    echo ""
    ./start-api.sh
else
    echo ""
    echo -e "${BLUE}[INFO] Para iniciar el servidor manualmente, ejecuta:${NC}"
    echo "  ./start-api.sh"
    echo ""
    echo -e "${BLUE}[INFO] Para probar la conexion:${NC}"
    echo "  http://localhost:8080/api/test-connection.php"
    echo ""
fi

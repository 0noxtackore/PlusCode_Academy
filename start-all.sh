#!/bin/bash

# PlusCode Academy - Full Stack Launcher (Linux/Mac)
# Opens exactly 3 tabs: XAMPP | Backend | Frontend

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen
clear

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}║       PlusCode Academy - Full Stack Launcher                     ║${NC}"
echo -e "${BLUE}║       (3 Tabs: Database | Backend | Frontend)                    ║${NC}"
echo -e "${BLUE}║                                                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect XAMPP/LAMPP installation
XAMPP_PATH=""
XAMPP_FOUND=0

# Common XAMPP/LAMPP paths
for path in "/opt/lampp" "/Applications/XAMPP" "/usr/local/xampp" "$HOME/xampp"; do
    if [ -d "$path" ] && [ -f "$path/xampp" ]; then
        XAMPP_PATH="$path"
        XAMPP_FOUND=1
        break
    fi
done

if [ $XAMPP_FOUND -eq 1 ]; then
    echo -e "${GREEN}[✓] XAMPP detectado en: $XAMPP_PATH${NC}"
else
    echo -e "${YELLOW}[!] XAMPP no detectado - se verificara MySQL${NC}"
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}[✓] MySQL corriendo${NC}"
        MYSQL_RUNNING=1
    else
        echo -e "${YELLOW}[!] MySQL instalado pero no corriendo${NC}"
        MYSQL_RUNNING=0
    fi
else
    echo -e "${YELLOW}[!] MySQL no detectado${NC}"
    MYSQL_RUNNING=0
fi

echo ""

# Check prerequisites
echo -e "${BLUE}[INFO] Verificando requisitos...${NC}"

if ! command -v php &> /dev/null; then
    echo -e "${RED}[✗] PHP no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}[✓] PHP disponible${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[✗] Node.js/npm no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}[✓] Node.js/npm disponible${NC}"
echo ""

# Get current directory
CURRENT_DIR=$(pwd)

# Function to detect terminal emulator
detect_terminal() {
    # Check for various terminal emulators with tab support
    if command -v gnome-terminal &> /dev/null; then
        echo "gnome"
    elif command -v konsole &> /dev/null; then
        echo "konsole"
    elif command -v xfce4-terminal &> /dev/null; then
        echo "xfce4"
    elif command -v terminator &> /dev/null; then
        echo "terminator"
    elif command -v alacritty &> /dev/null; then
        echo "alacritty"
    elif command -v iTerm.app &> /dev/null || [ "$TERM_PROGRAM" = "iTerm.app" ]; then
        echo "iterm"
    elif command -v osascript &> /dev/null && [[ "$OSTYPE" == "darwin"* ]]; then
        echo "terminal_mac"
    else
        echo "none"
    fi
}

TERMINAL=$(detect_terminal)
echo -e "${BLUE}[INFO] Terminal detectado: $TERMINAL${NC}"
echo ""

# Build commands for each tab
if [ $XAMPP_FOUND -eq 1 ]; then
    TAB1_TITLE="DB (XAMPP)"
    TAB1_CMD="echo '[TAB 1/3] XAMPP Server' && echo 'Iniciando Apache y MySQL...' && sudo $XAMPP_PATH/xampp startapache && sudo $XAMPP_PATH/xampp startmysql && echo '[✓] XAMPP iniciado' && echo 'Presiona Ctrl+C para detener' && trap 'sudo $XAMPP_PATH/xampp stop; exit' INT && sleep infinity"
else
    TAB1_TITLE="Database"
    if [ $MYSQL_RUNNING -eq 1 ]; then
        TAB1_CMD="echo '[TAB 1/3] Database' && echo '[✓] MySQL ya esta corriendo' && echo 'Puerto: 3306' && echo 'Presiona Ctrl+C para salir' && sleep infinity"
    else
        TAB1_CMD="echo '[TAB 1/3] Database' && echo '[!] Inicia MySQL manualmente:' && echo '  sudo systemctl start mysql' && echo '  o: docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=pluscode_academy mysql:8' && echo '' && echo 'Presiona Ctrl+C para salir' && sleep infinity"
    fi
fi

TAB2_TITLE="Backend API"
TAB2_CMD="echo '[TAB 2/3] Backend API Server' && cd '$CURRENT_DIR' && ./start-api.sh"

TAB3_TITLE="Frontend"
TAB3_CMD="echo '[TAB 3/3] Frontend Dev Server' && cd '$CURRENT_DIR' && npm run dev"

# Function to open terminal with tabs
open_terminal_tabs() {
    case $TERMINAL in
        "gnome")
            gnome-terminal --tab --title="$TAB1_TITLE" -- bash -c "$TAB1_CMD" \
                          --tab --title="$TAB2_TITLE" -- bash -c "$TAB2_CMD" \
                          --tab --title="$TAB3_TITLE" -- bash -c "$TAB3_CMD"
            ;;
        "konsole")
            konsole --new-tab --title "$TAB1_TITLE" -e bash -c "$TAB1_CMD" \
                    --new-tab --title "$TAB2_TITLE" -e bash -c "$TAB2_CMD" \
                    --new-tab --title "$TAB3_TITLE" -e bash -c "$TAB3_CMD"
            ;;
        "xfce4")
            xfce4-terminal --tab --title="$TAB1_TITLE" --command="bash -c '$TAB1_CMD'" \
                           --tab --title="$TAB2_TITLE" --command="bash -c '$TAB2_CMD'" \
                           --tab --title="$TAB3_TITLE" --command="bash -c '$TAB3_CMD'"
            ;;
        "terminator")
            # Terminator uses layouts, create temp layout
            cat > /tmp/pluscode_layout <<EOF
[global_config]
[profiles]
  [[default]]
[keybindings]
[layouts]
  [[pluscode]]
    [[[parent]]]
      type = Notebook
      order = 0
      parent = ""
    [[[child0]]]
      type = Terminal
      order = 0
      parent = parent
      profile = default
      command = bash -c "$TAB1_CMD"
    [[[child1]]]
      type = Terminal
      order = 1
      parent = parent
      profile = default
      command = bash -c "$TAB2_CMD"
    [[[child2]]]
      type = Terminal
      order = 2
      parent = parent
      profile = default
      command = bash -c "$TAB3_CMD"
[plugins]
EOF
            terminator -l pluscode &
            ;;
        "alacritty")
            # Alacritty doesn't support native tabs, use tmux instead
            echo "Alacritty detectado - usando tmux para pestanas"
            use_tmux
            ;;
        "iterm")
            osascript <<EOF
            tell application "iTerm"
                activate
                set newWindow to (create window with default profile)
                tell newWindow
                    tell current session
                        set name to "$TAB1_TITLE"
                        write text "$TAB1_CMD"
                    end tell
                    set t2 to (create tab with default profile)
                    tell t2
                        set name to "$TAB2_TITLE"
                        write text "$TAB2_CMD"
                    end tell
                    set t3 to (create tab with default profile)
                    tell t3
                        set name to "$TAB3_TITLE"
                        write text "$TAB3_CMD"
                    end tell
                end tell
            end tell
EOF
            ;;
        "terminal_mac")
            # macOS Terminal (no tabs via AppleScript easily, use new windows)
            osascript -e "tell application \"Terminal\" to do script \"$TAB1_CMD\""
            osascript -e "tell application \"Terminal\" to do script \"$TAB2_CMD\""
            osascript -e "tell application \"Terminal\" to do script \"$TAB3_CMD\""
            ;;
        *)
            return 1
            ;;
    esac
    return 0
}

# Function to use tmux with 3 panes
use_tmux() {
    echo -e "${CYAN}[INFO] Usando tmux con 3 paneles...${NC}"
    
    # Create new tmux session
    tmux new-session -d -s pluscode
    
    # Split into 3 horizontal panes
    tmux split-window -v -t pluscode
    tmux split-window -v -t pluscode
    
    # Send commands to each pane
    tmux send-keys -t pluscode:0.0 "$TAB1_CMD" C-m
    tmux send-keys -t pluscode:0.1 "$TAB2_CMD" C-m
    tmux send-keys -t pluscode:0.2 "$TAB3_CMD" C-m
    
    # Select layout even-vertical
    tmux select-layout -t pluscode even-vertical
    
    # Rename panes
    tmux rename-window -t pluscode "PlusCode"
    
    # Attach to session
    tmux attach -t pluscode
}

# Function to use background processes
use_background() {
    echo -e "${YELLOW}[INFO] No se detecto terminal con soporte de pestanas${NC}"
    echo -e "${YELLOW}[INFO] Usando procesos en background con logs a archivos${NC}"
    echo ""
    
    # Create logs directory
    mkdir -p logs
    
    # Start each service in background
    echo -e "${BLUE}[1/3] Iniciando Database...${NC}"
    if [ $XAMPP_FOUND -eq 1 ]; then
        sudo $XAMPP_PATH/xampp startapache > logs/xampp.log 2>&1 &
        sudo $XAMPP_PATH/xampp startmysql >> logs/xampp.log 2>&1 &
        echo "XAMPP iniciado (logs: logs/xampp.log)"
    else
        echo "MySQL: Asegurate de tener el servidor corriendo"
    fi
    
    echo -e "${BLUE}[2/3] Iniciando Backend...${NC}"
    ./start-api.sh > logs/api.log 2>&1 &
    API_PID=$!
    echo "Backend iniciado PID: $API_PID (logs: logs/api.log)"
    
    echo -e "${BLUE}[3/3] Iniciando Frontend...${NC}"
    npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend iniciado PID: $FRONTEND_PID (logs: logs/frontend.log)"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   Todos los servicios iniciados en background                    ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║   Ver logs:                                                      ║${NC}"
    echo -e "${GREEN}║     tail -f logs/xampp.log                                       ║${NC}"
    echo -e "${GREEN}║     tail -f logs/api.log                                         ║${NC}"
    echo -e "${GREEN}║     tail -f logs/frontend.log                                    ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║   Detener todo:                                                  ║${NC}"
    echo -e "${GREEN}║     kill $API_PID $FRONTEND_PID                                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Keep script running
    echo "Presiona Ctrl+C para detener todo..."
    trap "echo ''; echo 'Deteniendo servicios...'; kill $API_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Main execution
echo -e "${BLUE}[INFO] Intentando abrir terminal con 3 pestanas...${NC}"
echo ""

if [ "$TERMINAL" != "none" ]; then
    if open_terminal_tabs; then
        echo -e "${GREEN}[✓] 3 pestanas abiertas exitosamente${NC}"
        exit 0
    else
        echo -e "${YELLOW}[!] Fallo al abrir terminal con pestanas${NC}"
    fi
fi

# Check if tmux is available
echo -e "${BLUE}[INFO] Verificando tmux...${NC}"
if command -v tmux &> /dev/null; then
    echo -e "${GREEN}[✓] tmux disponible${NC}"
    use_tmux
else
    echo -e "${YELLOW}[!] tmux no disponible, usando background processes${NC}"
    use_background
fi

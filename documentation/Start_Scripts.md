# PlusCode Academy - Start Scripts Guide

Scripts para iniciar todo el stack de PlusCode Academy (Frontend + Backend + Database) en **exactamente 3 pestañas/consolas**.

## 📁 Archivos de Inicio

| Archivo | Plataforma | Descripción |
|---------|-----------|-------------|
| `start-all.bat` | Windows | Inicia todo en 3 pestañas (Windows Terminal o CMD) |
| `start-all.sh` | Linux/Mac | Inicia todo en 3 pestañas (varios terminales) |
| `start-api.bat` | Windows | Solo backend API (auto-detección de puertos) |
| `start-api.sh` | Linux/Mac | Solo backend API (auto-detección de puertos) |
| `setup-api.bat` | Windows | Setup inicial con configuración de BD |
| `setup-api.sh` | Linux/Mac | Setup inicial con configuración de BD |

## 🚀 Uso Rápido

### Windows
```bash
# Ejecutar todo el stack (3 pestañas)
start-all.bat

# O ejecutar solo el backend
start-api.bat

# Primera vez: configuración
setup-api.bat
```

### Linux / Mac
```bash
# Hacer ejecutables
chmod +x *.sh

# Ejecutar todo el stack (3 pestañas)
./start-all.sh

# O ejecutar solo el backend
./start-api.sh

# Primera vez: configuración
./setup-api.sh
```

## 🖥️ Las 3 Pestañas

Cada script abre exactamente **3 pestañas/consolas**:

| # | Pestaña | Contenido | Propósito |
|---|---------|-----------|-----------|
| 1 | **Database** | XAMPP Apache + MySQL | Servidor de base de datos |
| 2 | **Backend** | PHP API Server (puerto auto-detectado) | API RESTful |
| 3 | **Frontend** | Vue Dev Server (Vite) | Interfaz de usuario |

## 🖼️ Interfaz Visual

### Windows Terminal (Recomendado)
```
┌─────────────────────────────────────────────────────────────┐
│ [Database] [Backend] [Frontend]                             │
├─────────────────────────────────────────────────────────────┤
│ Tab 1: XAMPP                                                │
│   Apache running on port 80                                 │
│   MySQL running on port 3306                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Tab 2: Backend API                                          │
│   Server running on http://localhost:8080/api               │
│   Press Ctrl+C to stop                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Tab 3: Frontend                                             │
│   VITE v4.x ready                                           │
│   ➜  Local:   http://localhost:5173/                        │
│   ➜  Network: http://192.168.1.x:5173/                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Requisitos

### Windows
- ✅ Windows Terminal (opcional, recomendado)
- ✅ PHP 7.4+ en PATH
- ✅ Node.js 16+ en PATH
- ✅ XAMPP instalado (opcional, para MySQL)

### Linux/Mac
- ✅ PHP 7.4+
- ✅ Node.js 16+
- ✅ MySQL/MariaDB o XAMPP
- ✅ Terminal con soporte de pestañas (gnome-terminal, konsole, etc.) o tmux

## 📋 Flujo de Trabajo

### Primera vez
1. Instala dependencias: `npm install`
2. Configura la base de datos: `setup-api.bat` (o `.sh`)
3. Inicia todo: `start-all.bat` (o `.sh`)

### Uso diario
```bash
# Solo ejecuta
start-all.bat
```

Esto abre:
1. XAMPP (Apache + MySQL)
2. Backend API en puerto auto-detectado (8080, 8000, etc.)
3. Frontend en puerto 5173 (Vite default)

## 🔍 Detección Automática

### Puertos para Backend
El script intenta automáticamente:
```
8080 → 8000 → 8888 → 3000 → 5000
```

### XAMPP Auto-detectado
El script busca XAMPP en:
- Windows: `C:\xampp`, `D:\xampp`, etc.
- Linux: `/opt/lampp`
- Mac: `/Applications/XAMPP`

## 🛠️ Configuración Manual

### Si no tienes Windows Terminal
Los scripts usarán ventanas separadas de CMD como fallback.

### Si no tienes terminal con pestañas (Linux/Mac)
El script usará **tmux** automáticamente:
```
┌────────────────────────────────────┐
│ Database       │ Backend           │
│                │                   │
├────────────────┼───────────────────┤
│ Frontend                           │
│                                    │
└────────────────────────────────────┘
```

### Si no tienes tmux
Los scripts usarán procesos en background con logs a archivos:
```bash
# Ver logs en tiempo real
tail -f logs/api.log
tail -f logs/frontend.log
tail -f logs/xampp.log
```

## 📝 Comandos Manuales (Si los scripts fallan)

### Terminal 1: Base de Datos
```bash
# XAMPP (Windows)
C:\xampp\xampp-control.exe

# O directamente:
C:\xampp\apache_start.bat
C:\xampp\mysql_start.bat

# Linux/Mac XAMPP
sudo /opt/lampp/xampp start

# O MySQL nativo
sudo systemctl start mysql
```

### Terminal 2: Backend
```bash
cd api
php -S localhost:8080 router.php
```

### Terminal 3: Frontend
```bash
npm run dev
```

## 🔄 URLs por Defecto

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Vue.js app |
| Backend | http://localhost:8080/api | PHP REST API |
| API Test | http://localhost:8080/api/test-connection.php | Test DB |
| XAMPP | http://localhost/phpmyadmin | PHPMyAdmin |

## ❌ Detener Servicios

### Windows
- Presiona `Ctrl+C` en cada pestaña
- O ejecuta: `C:\xampp\apache_stop.bat` y `mysql_stop.bat`

### Linux/Mac
- Presiona `Ctrl+C` en cada pestaña
- O: `sudo /opt/lampp/xampp stop`
- O para tmux: `Ctrl+B` luego `:kill-session`

## 🐛 Solución de Problemas

### "PHP no encontrado"
Agrega PHP al PATH del sistema o usa la ruta completa.

### "Puerto ocupado"
El script auto-detecta otro puerto disponible automáticamente.

### "XAMPP no detectado"
El script usará tu MySQL existente o te pedirá iniciarlo manualmente.

### Windows Terminal no abre
Los scripts se reversionarán automáticamente a ventanas de CMD.

## 📦 Estructura de Logs (Background Mode)

```
logs/
├── api.log        # Backend API
├── frontend.log   # Vue dev server
└── xampp.log      # XAMPP/Apache/MySQL
```

## 💡 Tips

1. **Windows Terminal** proporciona la mejor experiencia con pestañas
2. **tmux** es la mejor alternativa en Linux si no tienes terminal con pestañas
3. Los scripts **cachean** el último puerto funcional en `.api-url.tmp`
4. El frontend **auto-detecta** la URL del backend usando `api-config.js`

## 🎉 Resumen

Ejecuta **un solo comando** y obtienes todo funcionando:

```bash
start-all.bat        # Windows
./start-all.sh       # Linux/Mac
```

¡3 pestañas, 1 comando, todo listo! 🚀

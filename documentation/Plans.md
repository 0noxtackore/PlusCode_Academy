# Documentación del Proyecto — Sistema de Gestión Académica +code

## 1) Descripción general
Este proyecto es una aplicación web construida con **Vue 3** y **Vite** para la gestión académica (estudiantes, docentes, cursos, matrículas, pagos, etc.).

El objetivo principal del trabajo reciente fue:
- Traducir la interfaz a **español** (textos visibles, labels, placeholders, estados, mensajes de confirmación/toast).
- Mejorar la **adaptación a mobile (responsive)**.
- Ajustar la navegación (Topbar/Downbar) para una mejor experiencia en pantallas pequeñas.

## 2) Requisitos
- **Node.js**: ver campo `engines.node` en `package.json`.
- **npm** (incluido con Node).

## 3) Instalación
En la raíz del proyecto:

```bash
npm install
```

## 4) Ejecución (desarrollo)

```bash
npm run dev
```

Luego abre la URL que imprime Vite en consola.

## 5) Build / Preview (producción)

```bash
npm run build
npm run preview
```

## 6) Estructura del proyecto (alto nivel)
- **`index.html`**
  - Incluye CSS de vendor/plantilla y CSS del proyecto Vue.
  - Se actualizó el `title` y el favicon.
- **`src/main.js`**
  - Monta la app Vue.
  - Importa `./css/style.css`.
  - Inicializa datos mock en `localStorage` mediante `initializeData()`.
- **`src/App.vue`**
  - Layout principal.
  - Renderiza `Topbar` + contenido + `Downbar`.
  - Router simple basado en `window.location.hash`.
- **`src/views/*.vue`**
  - Vistas principales (Dashboard, Students, Teachers, Courses, Enrollments, Payments, etc.).
- **`src/components/*.vue`**
  - Componentes de layout y UI (Topbar, Downbar, Modal, etc.).
- **`src/css/style.css`**
  - Overrides/estilos propios para unificar UI y responsive.

## 7) Navegación (hash routing)
La navegación se realiza mediante hash (`#dashboard`, `#students`, etc.).

Puntos clave:
- La ruta se lee desde `window.location.hash`.
- `App.vue` decide qué vista renderizar según el hash.

## 8) Proceso de traducción a español (UI)
Se tradujeron textos visibles en las vistas, incluyendo:
- Títulos de páginas.
- Descripciones.
- Encabezados de tablas.
- Labels y placeholders de formularios.
- Opciones de select (estados, métodos de pago, etc.).
- Textos de confirmación (`confirm(...)`).
- Mensajes de notificación/toast.

Vistas trabajadas (principales):
- `src/views/StudentsView.vue`
- `src/views/DashboardView.vue`
- `src/views/PaymentsView.vue`
- `src/views/TeachersView.vue`
- `src/views/CoursesView.vue`
- `src/views/EnrollmentsView.vue`

Componentes de layout traducidos:
- `src/components/Downbar.vue`
- `src/components/Topbar.vue`

Notas:
- Se evitó cambiar la lógica del negocio; el foco fue el texto/UI.
- Se buscó consistencia terminológica (Estudiantes, Docentes, Cursos, Matrículas, Pagos, Reportes, Gastos, etc.).

## 9) Proceso de adaptación a mobile (responsive)
Se implementaron ajustes responsive para:
- Rejillas de KPIs (`.stats-grid`) en 1 columna en mobile.
- Tablas con scroll horizontal (`.table-wrapper` + `overflow-x: auto`).
- Botones y targets táctiles (tamaños mínimos).
- Formularios en columna (evitar filas en pantallas pequeñas).
- Modales con ancho relativo y scroll vertical.

Archivo clave:
- `src/css/style.css`

Además, se ajustó el Topbar para mobile:
- Mostrar versión corta del título.
- Truncamiento con `...` cuando el texto no cabe.
- Botón de logout en modo icon-only en mobile.

Archivo clave:
- `src/components/Topbar.vue`

## 10) Cambios de layout (Topbar/Downbar)
- **Downbar**: se tradujo y se ajustó para usarse como navegación en mobile.
- **Topbar**: se optimizó para mobile (compacto, truncamiento, icon-only).

Archivos:
- `src/components/Downbar.vue`
- `src/components/Topbar.vue`

## 11) Estilos y CSS cargados
El proyecto utiliza CSS externo de plantilla (en `assets`) y CSS propio del proyecto (en `src/css`).

En `index.html` se cargan:
- `/assets/css/style.css` (plantilla)
- `/src/css/style.css` (overrides del proyecto Vue)

> Importante: `src/main.js` también importa `./css/style.css`. Esto significa que el CSS propio se aplica tanto por bundling como por link en `index.html`.

## 12) Checklist rápido para cambios futuros
- Si agregas una vista nueva:
  - Asegura traducción completa de textos visibles.
  - Usa los componentes/layout existentes.
  - Verifica responsive: tablas, modales, formularios.
- Si modificas el Topbar/Downbar:
  - Revisa comportamiento en `@media (max-width: 768px)`.
  - Mantén truncamiento y botones en icon-only cuando aplique.

## 13) Troubleshooting
- **Vite error “Invalid end tag”**
  - Usualmente causado por HTML mal cerrado en un `.vue`.
  - Solución: revisar estructura de `<template>` y etiquetas de cierre.

- **Estilos que no aplican**
  - Verificar especificidad y orden de carga de CSS.
  - Considerar `scoped` en componentes: los estilos globales deben ir en `src/css/style.css`.

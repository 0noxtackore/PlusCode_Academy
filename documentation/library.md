## Librerías del proyecto (completo)

Este proyecto combina dependencias **NPM (Vite/Vue)** y recursos **vendor** servidos desde `/public/assets` (y un mirror en `/assets`).

---

# 1) Dependencias NPM (package.json)

## Dependencias

- **Vue 3** (`vue`)
  - Framework principal del frontend.
- **Chart.js** (`chart.js`)
  - Gráficas en reportes/estadísticas.

## Dependencias de desarrollo

- **Vite** (`vite`)
  - Bundler/Dev server.
- **@vitejs/plugin-vue**
  - Soporte Vue SFC (`.vue`) en Vite.
- **vite-plugin-vue-devtools**
  - Herramientas de dev para Vue en modo desarrollo.

---

# 2) Vendor / UI / Plugins (cargados desde index.html)

Fuente: `index.html`.

## Fuentes

- **Google Fonts – Poppins**
  - `https://fonts.googleapis.com/css2?family=Poppins...`

## Iconos / UI

- **Font Awesome**
  - CSS: `/assets/font-awesome/css/all.min.css`
  - (También existe JS en `/public/assets/font-awesome/js/all.min.js`)
- **IcoFont**
  - `/assets/vendor/icofont/icofont.min.css`
- **Boxicons**
  - `/assets/vendor/boxicons/css/boxicons.min.css`
- **Remix Icon**
  - `/assets/vendor/remixicon/remixicon.css`

## Framework CSS

- **Bootstrap**
  - `/assets/vendor/bootstrap/css/bootstrap.min.css`

## Animaciones / Carrusel

- **animate.css**
  - `/assets/vendor/animate.css/animate.min.css`
- **Owl Carousel**
  - `/assets/vendor/owl.carousel/assets/owl.carousel.min.css`
  - JS: `/public/assets/vendor/owl.carousel/owl.carousel.min.js`

## Tablas

- **DataTables**
  - `/assets/DataTables/datatables.min.css`
  - JS: `/public/assets/DataTables/datatables.min.js`

## Datepicker / DateTime Picker

- **bootstrap-datepicker**
  - `/assets/vendor/bootstrap-datepicker/css/bootstrap-datepicker.min.css`
- **jquery.datetimepicker**
  - `/assets/css/jquery.datetimepicker.min.css`
  - JS: `/public/assets/js/jquery.datetimepicker.full.min.js`

## Selects / Editor

- **Select2**
  - `/assets/css/select2.min.css`
  - JS: `/public/assets/js/select2.min.js`
- **jQuery TE (WYSIWYG editor)**
  - `/assets/css/jquery-te-1.4.0.css`
  - JS: `/public/assets/js/jquery-te-1.4.0.min.js`

## jQuery y utilidades

- **jQuery**
  - `/public/assets/vendor/jquery/jquery.min.js`
- **jQuery Easing**
  - `/public/assets/vendor/jquery.easing/jquery.easing.min.js`
- **Waypoints**
  - `/public/assets/vendor/waypoints/jquery.waypoints.min.js`
- **Counter-Up**
  - `/public/assets/vendor/counterup/counterup.min.js`

## Validación (template vendor)

- **php-email-form validate.js**
  - `/public/assets/vendor/php-email-form/validate.js`

---

# 3) Estilos del proyecto

## CSS del template original

- `/assets/css/style.css`

## CSS propio Vue (src)

- `src/css/style.css` (importado en `src/main.js`)
- `src/css/admin-nav-override.css` (link en `index.html`)

---

# 4) Nota sobre duplicados (assets vs public/assets)

Existe contenido vendor tanto en:

- `/assets/...`
- `/public/assets/...`

En runtime, el proyecto referencia principalmente `/assets/...` desde `index.html`, mientras que varios JS vendor están disponibles en `/public/assets/...`.

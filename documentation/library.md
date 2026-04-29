# Project Libraries (Complete)

This project combines **NPM dependencies (Vite/Vue)** and **vendor** resources served from `/public/assets` (and a mirror in `/assets`).

---

# 1) NPM Dependencies (package.json)

## Dependencies

- **Vue 3** (`vue`)
  - Main frontend framework.
- **Chart.js** (`chart.js`)
  - Charts in reports/statistics.

## Dev Dependencies

- **Vite** (`vite`)
  - Bundler/Dev server.
- **@vitejs/plugin-vue**
  - Support for Vue SFC (`.vue`) in Vite.
- **vite-plugin-vue-devtools**
  - Vue devtools for development mode.

---

# 2) Vendor / UI / Plugins (loaded from index.html)

Source: `index.html`.

## Fonts

- **Google Fonts – Poppins**
  - `https://fonts.googleapis.com/css2?family=Poppins...`

## Icons / UI

- **Font Awesome**
  - CSS: `/assets/font-awesome/css/all.min.css`
  - Also exists as JS in `/public/assets/font-awesome/js/all.min.js`
- **IcoFont**
  - `/assets/vendor/icofont/icofont.min.css`
- **Boxicons**
  - `/assets/vendor/boxicons/css/boxicons.min.css`
- **Remix Icon**
  - `/assets/vendor/remixicon/remixicon.css`

## CSS Framework

- **Bootstrap**
  - `/assets/vendor/bootstrap/css/bootstrap.min.css`

## Animations / Carousel

- **animate.css**
  - `/assets/vendor/animate.css/animate.min.css`
- **Owl Carousel**
  - `/assets/vendor/owl.carousel/assets/owl.carousel.min.css`
  - JS: `/public/assets/vendor/owl.carousel/owl.carousel.min.js`

## Tables

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

## jQuery and Utilities

- **jQuery**
  - `/public/assets/vendor/jquery/jquery.min.js`
- **jQuery Easing**
  - `/public/assets/vendor/jquery.easing/jquery.easing.min.js`
- **Waypoints**
  - `/public/assets/vendor/waypoints/jquery.waypoints.min.js`
- **Counter-Up**
  - `/public/assets/vendor/counterup/counterup.min.js`

## Validation (Template Vendor)

- **php-email-form validate.js**
  - `/public/assets/vendor/php-email-form/validate.js`

---

# 3) Project Styles

## Original Template CSS

- `/assets/css/style.css`

## Vue Project CSS (src)

- `src/css/style.css` (imported in `src/main.js`)
- `src/css/admin-nav-override.css` (link in `index.html`)

---

# 4) Note on Duplicates (assets vs public/assets)

Vendor content exists in both:

- `/assets/...`
- `/public/assets/...`

At runtime, the project mainly references `/assets/...` from `index.html`, while several vendor JS files are available in `/public/assets/...`.

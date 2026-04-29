# Project Documentation — +code Academic Management System

## 1) Overview
This project is a web application built with **Vue 3** and **Vite** for academic management (students, teachers, courses, enrollments, payments, etc.).

The main objectives of this project were:
- Build a comprehensive academic management system with multiple modules
- Implement Role-Based Access Control (RBAC) with multiple user roles
- Develop financial reporting capabilities (Balance Sheet, Income Statement, Cash Flow)
- Create PDF receipt generation for payments and teacher payroll
- Implement debt tracking and payment plans
- Build inventory management with automated stock alerts
- Support mobile-responsive design for all views

## 2) Requirements
- **Node.js**: see `engines.node` field in `package.json`.
- **npm** (included with Node).

## 3) Installation
In the project root:

```bash
npm install
```

## 4) Development Execution

```bash
npm run dev
```

Then open the URL printed by Vite in the console.

## 5) Build / Preview (Production)

```bash
npm run build
npm run preview
```

## 6) Project Structure (High Level)
- **`index.html`**
  - Includes vendor/template CSS and Vue project CSS.
  - Updated `title` and favicon.
- **`src/main.js`**
  - Mounts the Vue app.
  - Imports `./css/style.css`.
  - Initializes data via API calls.
- **`src/App.vue`**
  - Main layout.
  - Renders `Topbar` + content + `Downbar`.
  - Simple router based on `window.location.hash`.
- **`src/views/*.vue`**
  - Main views (Dashboard, Students, Teachers, Courses, Enrollments, Payments, Reports, Expenses).
- **`src/components/*.vue`**
  - Layout and UI components (Topbar, Downbar, Modal, Sidebar, Report components).
- **`src/css/style.css`**
  - Custom styles/overrides to unify UI and responsive design.
- **`src/js/*.js`**
  - JavaScript modules for business logic (auth, data, expenses, teachers, inventory, validations, etc.).

## 7) Navigation (Hash Routing)
Navigation is performed via hash (`#dashboard`, `#students`, etc.).

Key points:
- The route is read from `window.location.hash`.
- `App.vue` decides which view to render based on the hash.

## 8) UI Translation Process
The following visible texts were translated to Spanish:
- Page titles
- Descriptions
- Table headers
- Form labels and placeholders
- Select options (statuses, payment methods, etc.)
- Confirmation texts (`confirm(...)`)
- Notification/toast messages

Main views translated:
- `src/views/StudentsView.vue`
- `src/views/DashboardView.vue`
- `src/views/PaymentsView.vue`
- `src/views/TeachersView.vue`
- `src/views/CoursesView.vue`
- `src/views/EnrollmentsView.vue`
- `src/views/ExpensesView.vue`
- `src/views/ReportsView.vue`

Layout components translated:
- `src/components/Downbar.vue`
- `src/components/Topbar.vue`
- `src/components/Sidebar.vue`

Notes:
- Business logic was not changed; the focus was on text/UI.
- Terminology consistency was maintained (Students, Teachers, Courses, Enrollments, Payments, Reports, Expenses, etc.).

## 9) Mobile Responsive Adaptation Process
Responsive adjustments were implemented for:
- KPI grids (`.stats-grid`) in 1 column on mobile.
- Tables with horizontal scroll (`.table-wrapper` + `overflow-x: auto`).
- Buttons and touch targets (minimum sizes).
- Column-based forms (avoiding rows on small screens).
- Modals with relative width and vertical scroll.

Key file:
- `src/css/style.css`

Additionally, the Topbar was adjusted for mobile:
- Shows short version of the title.
- Truncation with `...` when text doesn't fit.
- Logout button in icon-only mode on mobile.

Key file:
- `src/components/Topbar.vue`

## 10) Layout Changes (Topbar/Downbar)
- **Downbar**: Translated and adjusted for use as mobile navigation.
- **Topbar**: Optimized for mobile (compact, truncation, icon-only).

Files:
- `src/components/Downbar.vue`
- `src/components/Topbar.vue`

## 11) Loaded Styles and CSS
The project uses external template CSS (in `assets`) and project-specific CSS (in `src/css`).

In `index.html` the following are loaded:
- `/assets/css/style.css` (template)
- `/src/css/style.css` (Vue project overrides)

> Important: `src/main.js` also imports `./css/style.css`. This means the project CSS is applied both by bundling and by link in `index.html`.

## 12) Quick Checklist for Future Changes
- If adding a new view:
  - Ensure complete translation of visible texts.
  - Use existing components/layout.
  - Verify responsive design: tables, modals, forms.
- If modifying Topbar/Downbar:
  - Check behavior at `@media (max-width: 768px)`.
  - Maintain truncation and icon-only buttons when applicable.

## 13) Troubleshooting
- **Vite error "Invalid end tag"**
  - Usually caused by improperly closed HTML in a `.vue` file.
  - Solution: check `<template>` structure and closing tags.

- **Styles not applying**
  - Check specificity and CSS loading order.
  - Consider `scoped` in components: global styles should go in `src/css/style.css`.

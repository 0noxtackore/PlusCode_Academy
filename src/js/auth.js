/**
 * auth.js — Módulo de autenticación
 * Maneja el login, logout y verificación de sesión.
 * Usa sessionStorage para que la sesión dure mientras el tab está abierto.
 *
 * USUARIO POR DEFECTO (hardcoded para frontend puro sin backend):
 *   Username: admin
 *   Password: admin123
 */

// -----------------------------------------------------------------------
// Usuarios y roles del sistema
// -----------------------------------------------------------------------
const USERS = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    email: 'admin@pluscode.edu',
    role: 'admin',
    permissions: ['students', 'courses', 'enrollments', 'payments', 'reports', 'expenses', 'teachers', 'inventory']
  },
  {
    username: 'recepcion',
    password: 'rec123',
    name: 'María Recepción',
    email: 'maria.recepcion@pluscode.edu',
    role: 'receptionista',
    permissions: ['students', 'courses', 'enrollments', 'payments']
  },
  {
    username: 'caja',
    password: 'caja123',
    name: 'Carlos Caja',
    email: 'carlos.caja@pluscode.edu',
    role: 'cajero',
    permissions: ['payments', 'reports']
  },
  {
    username: 'control',
    password: 'ctrl123',
    name: 'Ana Control',
    email: 'ana.control@pluscode.edu',
    role: 'control_academico',
    permissions: ['students', 'courses', 'enrollments', 'reports']
  }
]

/**
 * Intenta autenticar al usuario con username y contraseña.
 * Compara contra el usuario por defecto hardcoded.
 *
 * @param {string} username - Nombre de usuario ingresado
 * @param {string} password - Contraseña ingresada
 * @returns {boolean} true si las credenciales son correctas, false en caso contrario
 */
export function login(username, password) {
  const identifier = String(username || '').trim().toLowerCase()
  const pass = String(password || '')

  // Buscar usuario en el array de usuarios (por username o email)
  const user = USERS.find(u => {
    const userName = String(u.username || '').trim().toLowerCase()
    const userEmail = String(u.email || '').trim().toLowerCase()
    return (userName === identifier || userEmail === identifier) && u.password === pass
  })
  
  if (user) {
    // Guardar datos de sesión en sessionStorage
    sessionStorage.setItem('loggedIn', 'true')
    sessionStorage.setItem('userName', user.name)
    sessionStorage.setItem('userRole', user.role)
    sessionStorage.setItem('userPermissions', JSON.stringify(user.permissions))
    return true
  }
  // Credenciales incorrectas
  return false
}

/**
 * Cierra la sesión del usuario eliminando los datos de sessionStorage.
 * Luego redirige al hash de login.
 */
export function logout() {
  sessionStorage.removeItem('loggedIn')
  sessionStorage.removeItem('userName')
  sessionStorage.removeItem('userRole')
  sessionStorage.removeItem('userPermissions')
  // Redirigir al login
  window.location.hash = '#login'
}

/**
 * Verifica si hay una sesión activa.
 * @returns {boolean} true si el usuario está logueado
 */
export function isLoggedIn() {
  return sessionStorage.getItem('loggedIn') === 'true'
}

/**
 * Obtiene el nombre del usuario actualmente logueado.
 * @returns {string} Nombre del usuario o cadena vacía si no hay sesión
 */
export function getCurrentUserName() {
  return sessionStorage.getItem('userName') || ''
}

/**
 * Obtiene el tipo de usuario logueado.
 * @returns {string} Rol del usuario (admin, receptionist, cashier, academic_control)
 */
export function getCurrentUserRole() {
  return sessionStorage.getItem('userRole') || ''
}

export function getRoleLabel(role) {
  const r = String(role || '').trim()
  if (r === 'admin') return 'Administrador'
  if (r === 'receptionist') return 'Recepción'
  if (r === 'cashier') return 'Caja / Facturación'
  if (r === 'academic_control') return 'Control de Estudios'
  return 'Usuario'
}

export function getCurrentUserRoleLabel() {
  return getRoleLabel(getCurrentUserRole())
}

/**
 * Obtiene los permisos del usuario logueado.
 * @returns {array} Array de permisos del usuario
 */
export function getCurrentUserPermissions() {
  const permissions = sessionStorage.getItem('userPermissions')
  return permissions ? JSON.parse(permissions) : []
}

/**
 * Verifica si el usuario tiene permiso para un módulo específico.
 * @param {string} module - Nombre del módulo a verificar
 * @returns {boolean} true si tiene permiso, false en caso contrario
 */
export function hasPermission(module) {
  const permissions = getCurrentUserPermissions()
  return permissions.includes(module)
}

export function getSystemUsers() {
  return USERS.map(({ password, ...rest }) => ({ ...rest }))
}

/**
 * auth.js — Módulo de autenticación (MySQL/PHP API)
 * Maneja el login, logout y verificación de sesión.
 */

import { api } from './apiClient.js'

/**
 * Intenta autenticar al usuario con username y contraseña.
 *
 * @param {string} username - Nombre de usuario o email ingresado
 * @param {string} password - Contraseña ingresada
 * @returns {boolean} true si las credenciales son correctas, false en caso contrario
 */
export async function login(username, password) {
    const response = await api.login(username, password)
    
    if (response && response.success && response.user) {
      const user = response.user
      // Guardar datos de sesión en sessionStorage
      sessionStorage.setItem('loggedIn', 'true')
      sessionStorage.setItem('userName', user.name)
      sessionStorage.setItem('userRole', user.role)
      sessionStorage.setItem('userPermissions', JSON.stringify(user.permissions || []))
      return true
    }
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
 * @returns {string} Rol del usuario
 */
export function getCurrentUserRole() {
  return sessionStorage.getItem('userRole') || ''
}

export function getRoleLabel(role) {
  const r = String(role || '').trim()
  if (r === 'admin') return 'Administrador'
  if (r === 'receptionista') return 'Recepción'
  if (r === 'cajero') return 'Caja / Facturación'
  if (r === 'control_academico') return 'Control de Estudios'
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

// Ahora los usuarios se obtienen asíncronamente
export async function getSystemUsers() {
  try {
    const users = await api.get('users') // requires a users endpoint or fallback
    return users
  } catch (e) {
    return []
  }
}

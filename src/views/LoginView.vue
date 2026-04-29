<template>
  <div class="login-view">
    <div class="background-slider" aria-hidden="true">
      <div
        v-for="(img, idx) in bgImages"
        :key="img"
        class="bg-slide"
        :class="{ active: currentBg === idx }"
        :style="{ backgroundImage: `url('${img}')` }"
      ></div>
    </div>
    <div class="overlay"></div>

    <!-- Notificaciones flotantes -->
    <div class="notification-container">
      <div 
        v-if="notification.show" 
        class="notification" 
        :class="notification.type"
        @click="hideNotification"
      >
        <button class="notification-close" @click.stop="hideNotification">×</button>
        <div class="notification-content">
          <div class="notification-icon">
            <img class="notification-favicon" src="/assets/uploads/favicon.png" alt="" />
          </div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
      </div>
    </div>

    <div class="login-wrapper">
      <div class="login-top">
        <img src="/assets/uploads/logo-login.png" alt="Logo +code">
        <h2>BIENVENIDO</h2>
        <p>Accede a tus cursos, notas y recursos <br> académicos en un solo lugar.</p>
      </div>

      <div class="login-bottom">
        <h3>Inicio de Sesión</h3>
        
        <form @submit.prevent="handleLogin">
          
          <div class="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-at-fill" viewBox="0 0 16 16">
              <path d="M2 2A2 2 0 0 0 .05 3.555L8 8.414l7.95-4.859A2 2 0 0 0 14 2zm-2 9.8V4.698l5.803 3.546zm6.761-2.97-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 9.671V4.697l-5.803 3.546.338.208A4.5 4.5 0 0 1 12.5 8c1.414 0 2.675.652 3.5 1.671"/>
              <path d="M15.834 12.244c0 1.168-.577 2.025-1.587 2.025-.503 0-1.002-.228-1.12-.648h-.043c-.118.416-.543.643-1.015.643-.77 0-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4 1.26-1.4.585 0 .87.333.953.63h.03v-.568h.905v2.19c0 .272.18.42.411.42.315 0 .639-.415.639-1.39v-.118c0-1.277-.95-2.326-2.484-2.326h-.04c-1.582 0-2.64 1.067-2.64 2.724v.157c0 1.867 1.237 2.654 2.57 2.654h.045c.507 0 .935-.07 1.18-.18v.731c-.219.1-.643.175-1.237.175h-.044C10.438 16 9 14.82 9 12.646v-.214C9 10.36 10.421 9 12.485 9h.035c2.12 0 3.314 1.43 3.314 3.034zm-4.04.21v.227c0 .586.227.8.581.8.31 0 .564-.17.564-.743v-.367c0-.516-.275-.708-.572-.708-.346 0-.573.245-.573.791"/>
            </svg>
            <input 
              v-model="username" 
              type="text" 
              class="form-control with-icon" 
              placeholder="Correo electrónico" 
              required
            >
          </div>
          
          <div class="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-key" viewBox="0 0 16 16">
              <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
              <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
            <input 
              v-model="password" 
              type="password" 
              class="form-control with-icon" 
              placeholder="Contraseña" 
              required
            >
          </div>
          
          <div class="options">
            <label>
              <input type="checkbox" name="remember"> Recordarme
            </label>
            <a href="#">¿Olvidó su contraseña?</a>
          </div>

          <button type="submit" class="btn-login boton cinco" :disabled="isLoading">
            <div class="icono" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
              </svg>
            </div>
            <span class="btn-login__label">{{ isLoading ? 'Ingresando...' : 'Ingresar' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { login } from '../js/auth.js'

const emit = defineEmits(['login-success'])

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const bgImages = [
  '/assets/uploads/fondologin.jpg',
  '/assets/uploads/fondologin2.jpg',
  '/assets/uploads/fondologin3.jpg',
  '/assets/uploads/fondologin4.jpg'
]

const currentBg = ref(0)
let bgIntervalId = null

// Sistema de notificaciones
const notification = ref({
  show: false,
  type: 'error', // 'success' o 'error'
  message: ''
})

// Agregar clase al body cuando el componente se monta
onMounted(() => {
  document.body.classList.add('login-page')

  bgIntervalId = setInterval(() => {
    currentBg.value = (currentBg.value + 1) % bgImages.length
  }, 6500)
})

// Remover clase cuando el componente se desmonta
onUnmounted(() => {
  document.body.classList.remove('login-page')

  if (bgIntervalId) {
    clearInterval(bgIntervalId)
    bgIntervalId = null
  }
})

// Mostrar notificación
const showNotification = (type, message) => {
  notification.value = {
    show: true,
    type: type,
    message: message
  }
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    hideNotification()
  }, 5000)
}

// Ocultar notificación
const hideNotification = () => {
  notification.value.show = false
}

const handleLogin = async () => {
  if (!username.value || !password.value) return
  
  errorMsg.value = ''
  isLoading.value = true

  try {
    const success = await login(username.value, password.value)
    
    if (success) {
      showNotification('success', '¡Inicio de sesión exitoso! Redirigiendo...')
      // Emitimos el éxito después de un momento para que se vea la notificación
      setTimeout(() => {
        emit('login-success')
      }, 1500)
    } else {
      showNotification('error', 'Campos de Usuario o Contraseña incorrectos')
    }
  } catch (err) {
      showNotification('error', 'Error de conexión con el servidor')
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* Estilos globales para el login - sincronizados con login.php */
body.login-page {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100vh !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  background: #0b1220 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Asegurar que el fondo se vea en el contenedor principal también */
.login-view {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

body.login-page #app {
  width: 100% !important;
  height: 100vh !important;
  min-height: auto !important;
  background: none !important;
}

body.login-page #main-content {
  margin: 0 !important;
  padding: 0 !important;
}

body.login-page * {
  box-sizing: border-box !important;
}
</style>

<style scoped>
:root {
  --code-blue-dark: #003356;
  --code-blue-light: #007bb5;
  --code-yellow: #FFCE00;
  --input-bg: #e2e8f0;
}

/* Asegurar que el fondo se vea en el contenedor principal también */
.login-view {
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
}

.background-slider {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.1s ease;
  will-change: opacity;
}

.bg-slide.active {
  opacity: 1;
}

.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.55) 0%,
    rgba(15, 23, 42, 0.35) 45%,
    rgba(15, 23, 42, 0.58) 100%
  );
  z-index: 1;
  width: 100%;
  height: 100%;
}

.login-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(10px);
}

.login-top {
  background: transparent;
  padding: 40px 20px;
  text-align: center;
  color: #0b1220;
}

.login-top img {
  width: 120px;
  margin-bottom: 15px;
}

.login-top h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-top p {
  margin: 10px 0 0;
  font-size: 13px;
}

.login-bottom {
  padding: 40px 30px;
  background: transparent;
}

.login-bottom h3 {
  text-align: center;
  color: var(--code-blue-dark);
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
}

.form-group {
  position: relative;
  margin-bottom: 20px;
}

.form-group svg {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 16px;
  height: 16px;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid rgba(148, 163, 184, 0.75);
  border-radius: 30px;
  background-color: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: 0.3s;
}

.form-control:focus {
  background-color: #ffffff;
  border-color: rgba(255, 206, 0, 0.75);
  box-shadow: 0 0 0 4px rgba(255, 206, 0, 0.20);
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 25px;
  color: #64748b;
}

.options a {
  color: var(--code-blue-dark);
  text-decoration: none;
}

.btn-login {
  position: relative;
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 30px;
  background: #11263b;
  color: #eab649;
  border: 2px solid #eab649;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: 0.3s ease-in-out all;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  user-select: none;
}

.btn-login__label {
  transition: .4s ease-in-out all;
  position: absolute;
  left: 40%;
}

.btn-login .icono {
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 2;
  left: -40px;
  transition: .3s ease-in-out all;
  opacity: 0;
}

.btn-login svg {
  width: 30px;
  height: 30px;
}

.btn-login:hover {
  background: #273744;
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.22),
    0 0 0 4px rgba(255, 206, 0, 0.22);
  border-color: rgba(255, 206, 0, 0.85);
  transform: translateY(-1px);
}

.btn-login:hover .icono {
  left: calc(100% - 50px);
  opacity: 1;
}

.btn-login:hover .btn-login__label {
  left: 20px;
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login:focus {
  outline: none;
}

.btn-login:focus-visible {
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.22),
    0 0 0 4px rgba(255, 206, 0, 0.26);
  border-color: rgba(255, 206, 0, 0.95);
}

.btn-login:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-login:disabled:hover {
  transform: none;
  box-shadow: none;
}

.alert-danger {
  background-color: #fee2e2;
  color: #ef4444;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #f87171;
}

/* Notificaciones flotantes */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 1;
}

.notification-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-favicon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.18));
}

.notification.success .notification-icon {
  background-color: #dcfce7;
  color: #10b981;
}

.notification.error .notification-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive para notificaciones */
@media (max-width: 480px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-content {
    padding: 12px 16px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>

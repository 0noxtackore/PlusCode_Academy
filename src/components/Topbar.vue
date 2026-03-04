<template>
  <header id="topbar">
    <div class="topbar-title">
      <span class="title-short">SGA +code</span>
      <span class="title-full">Sistema de Gestión Académica +code</span>
    </div>
    
    <div class="topbar-user">
      <div class="user-info">
        <span class="user-name" :title="userName">{{ truncateText(userName, 15) }}</span>
        <span class="user-role">{{ userRoleLabel }}</span>
      </div>
      
      <!-- Iniciales del usuario para el avatar -->
      <div class="avatar">
        {{ initial }}
      </div>

      <button @click="$emit('logout')" class="btn-logout" title="Cerrar Sesión">
        <i class="fa fa-power-off"></i>
        <span class="logout-text">Cerrar Sesión</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { getCurrentUserName, getCurrentUserRoleLabel } from '../js/auth.js'

defineEmits(['logout'])

// Obtener datos del usuario logueado
const userName = computed(() => getCurrentUserName() || 'Invitado')
const userRoleLabel = computed(() => getCurrentUserRoleLabel())

// Letra inicial para el avatar redondo
const initial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// Función para truncar texto largo
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.ml-2 {
  margin-left: 10px;
}

/* Mobile Topbar Styles */
@media (max-width: 768px) {
  .topbar-title {
    flex: 0.8;
    min-width: 0;
    max-width: 150px;
  }
  
  .title-short {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--primary-blue);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .title-full {
    display: none;
  }
  
  .topbar-user {
    flex-direction: row !important;
    align-items: center !important;
    gap: 0.5rem !important;
    flex-shrink: 0 !important;
    flex: 0.2 !important;
  }
  
  .user-info {
    display: none;
  }
  
  .user-name {
    font-size: 0.9rem;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .btn-logout {
    padding: 0.5rem;
    font-size: 0.8rem;
    background: transparent;
    border: none;
    color: #64748b;
    min-width: 44px;
    height: 44px;
    justify-content: center;
  }
  
  .logout-text {
    display: none;
  }
  
  .btn-logout:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--primary-blue);
    border-radius: 6px;
  }
}

/* Desktop Topbar Styles */
@media (min-width: 769px) {
  .title-short {
    display: none;
  }
  
  .title-full {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-blue);
  }
  
  .user-info {
    display: block;
    text-align: right;
  }
  
  .logout-text {
    display: inline;
  }
  
  .btn-logout {
    background: #fff;
    border: 1px solid #e2e8f0;
    color: #64748b;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
  }
  
  .btn-logout:hover {
    background-color: #fee2e2;
    color: #dc2626;
    border-color: #fecaca;
    transform: translateY(-1px);
  }
}
</style>

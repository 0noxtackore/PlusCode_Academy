<template>
  <div class="modal-overlay" :class="{ 'show': modelValue }">
    <div class="modal-box">
      <div class="modal-header">
        <h4>{{ title }}</h4>
        <button type="button" class="modal-close" @click="close">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer" v-if="$slots.footer || showDefaultFooter">
        <slot name="footer">
          <button type="button" class="btn-secondary-modern" @click="close">Cancelar</button>
          <button type="button" class="btn-primary-modern" @click="$emit('confirm')">Guardar</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Default Title'
  },
  showDefaultFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

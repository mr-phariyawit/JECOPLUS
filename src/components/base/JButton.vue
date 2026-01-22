<template>
  <button
    :class="['j-button', `j-button--${variant}`, { 'j-button--disabled': disabled, 'j-button--loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="j-button__loader"></span>
    <span v-else class="j-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'black'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.j-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 52px;
}

/* Primary - Red CTA */
.j-button--primary {
  background: var(--color-red);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.j-button--primary:hover:not(:disabled) {
  background: #C9000D;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.j-button--primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary - Gray */
.j-button--secondary {
  background: var(--color-gray-1);
  color: var(--color-black);
  border: 1px solid var(--color-gray-2);
}

.j-button--secondary:hover:not(:disabled) {
  background: var(--color-gray-2);
}

/* Black - Solid Black */
.j-button--black {
  background: var(--color-black);
  color: var(--color-white);
}

.j-button--black:hover:not(:disabled) {
  background: var(--color-gray-5);
  transform: translateY(-1px);
}

/* Outline - Border Only */
.j-button--outline {
  background: transparent;
  color: var(--color-black);
  border: 2px solid var(--color-gray-2);
}

.j-button--outline:hover:not(:disabled) {
  border-color: var(--color-red);
  color: var(--color-red);
}

/* Ghost - Minimal */
.j-button--ghost {
  background: transparent;
  color: var(--color-gray-4);
}

.j-button--ghost:hover:not(:disabled) {
  background: var(--color-gray-1);
  color: var(--color-black);
}

/* Disabled */
.j-button--disabled {
  background: var(--color-gray-2);
  color: var(--color-gray-3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading */
.j-button--loading {
  cursor: wait;
}

.j-button__loader {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

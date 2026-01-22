<template>
  <span :class="['j-badge', `j-badge--${variant}`]">
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'success', 'warning', 'error', 'info'].includes(v)
  }
})
</script>

<style scoped>
.j-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
}

.j-badge--default {
  background: var(--color-gray-1);
  color: var(--color-gray-4);
}

.j-badge--success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.j-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.j-badge--error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.j-badge--info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}
</style>

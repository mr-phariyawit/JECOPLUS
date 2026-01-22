<template>
  <div
    :class="['j-card', {
      'j-card--selectable': selectable,
      'j-card--selected': selected,
      'j-card--disabled': disabled,
      'j-card--elevated': elevated
    }]"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  selectable: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  elevated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'select'])

const handleClick = (e) => {
  if (props.disabled) return
  emit('click', e)
  if (props.selectable) {
    emit('select', !props.selected)
  }
}
</script>

<style scoped>
.j-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  color: var(--color-black);
}

.j-card--elevated {
  box-shadow: var(--shadow-md);
}

.j-card--selectable {
  cursor: pointer;
}

.j-card--selectable:hover:not(.j-card--disabled) {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.j-card--selected {
  border: 2px solid var(--color-red);
  box-shadow: var(--shadow-md);
}

.j-card--disabled {
  background: var(--color-gray-1);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

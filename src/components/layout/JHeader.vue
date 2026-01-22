<template>
  <header class="j-header">
    <button v-if="showBack" class="j-header__back" @click="handleBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <h1 class="j-header__title">{{ title }}</h1>
    <div class="j-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back'])
const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}
</script>

<style scoped>
.j-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  margin-bottom: var(--space-md);
}

.j-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  color: var(--color-black);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.j-header__back:hover {
  background: var(--color-gray-2);
}

.j-header__title {
  flex: 1;
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.j-header__actions {
  display: flex;
  gap: var(--space-sm);
}
</style>

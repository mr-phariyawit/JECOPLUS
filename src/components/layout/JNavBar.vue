<template>
  <nav class="j-navbar">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="j-navbar__item"
      :class="{ 'j-navbar__item--active': isActive(item.path) }"
    >
      <component :is="item.icon" class="j-navbar__icon" />
      <span class="j-navbar__label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// SVG Icons as components
const IconHome = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M3 10.5L12 3L21 10.5V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V10.5Z', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M9 21V14H15V21', stroke: 'currentColor', 'stroke-width': 2 })
])

const IconLoan = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 2, y: 5, width: 20, height: 14, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 9V15M9 12H15', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
])

const IconPayment = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 2, y: 4, width: 20, height: 16, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M2 10H22', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M6 15H10', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
])

const IconProfile = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
  h('circle', { cx: 12, cy: 8, r: 4, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
])

const IconEcosystem = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
  h('circle', { cx: 12, cy: 12, r: 3, stroke: 'currentColor', 'stroke-width': 2 }),
  h('circle', { cx: 5, cy: 6, r: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('circle', { cx: 19, cy: 6, r: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('circle', { cx: 5, cy: 18, r: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('circle', { cx: 19, cy: 18, r: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M9.5 10L6.5 7.5M14.5 10L17.5 7.5M9.5 14L6.5 16.5M14.5 14L17.5 16.5', stroke: 'currentColor', 'stroke-width': 1.5 })
])

const navItems = [
  { path: '/dashboard', label: 'หน้าหลัก', icon: IconHome },
  { path: '/loans', label: 'สินเชื่อ', icon: IconLoan },
  { path: '/ecosystem', label: 'Ecosystem', icon: IconEcosystem },
  { path: '/payment-settings', label: 'ชำระ', icon: IconPayment },
  { path: '/profile', label: 'โปรไฟล์', icon: IconProfile }
]

const isActive = (path) => {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.j-navbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-sm) 0;
  padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  z-index: var(--z-fixed);

  /* Solid Black NavBar */
  background: var(--color-black);
  border-top: none;
}

.j-navbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-md);
  text-decoration: none;
  color: var(--color-gray-3);
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

.j-navbar__item--active {
  color: var(--color-white);
}

.j-navbar__item:hover {
  color: var(--color-white);
}

.j-navbar__icon {
  width: 24px;
  height: 24px;
}

.j-navbar__label {
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
}
</style>

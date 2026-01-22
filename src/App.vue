<template>
  <div id="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <JNavBar v-if="!hideNavBar" />
    <!-- AI Chat Widget (Universal) -->
    <AIChatWidget />
    <AIChatFAB />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import JNavBar from './components/layout/JNavBar.vue'
import AIChatWidget from './components/chat/AIChatWidget.vue'
import AIChatFAB from './components/chat/AIChatFAB.vue'

const route = useRoute()

const hideNavBar = computed(() => route.meta.hideNavBar === true)
</script>

<style>
#app-container {
  min-height: 100vh;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

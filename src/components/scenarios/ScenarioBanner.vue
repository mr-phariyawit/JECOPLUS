<template>
  <div v-if="isInScenarioMode" class="scenario-banner" :class="`scenario-${currentScenario?.color}`">
    <div class="banner-content">
      <div class="scenario-info">
        <span class="icon">{{ currentScenario?.icon }}</span>
        <div class="text-content">
          <span class="label">Demo Mode:</span>
          <span class="name">{{ currentScenario?.name }}</span>
        </div>
      </div>

      <div class="banner-actions">
        <button class="btn-switch" @click="$emit('switch')">
          <span class="icon">🔄</span>
          <span>Switch</span>
        </button>
        <button class="btn-reset" @click="handleReset">
          <span class="icon">↺</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'

const emit = defineEmits(['switch', 'reset'])

const scenarioStore = useScenarioStore()

const isInScenarioMode = computed(() => scenarioStore.currentScenarioId !== 'DEFAULT')
const currentScenario = computed(() => scenarioStore.availableScenarios.find(s => s.id === scenarioStore.currentScenarioId))

const handleReset = async () => {
  await scenarioStore.resetToDefault()
  emit('reset')
}
</script>

<style scoped>
.scenario-banner {
  position: sticky;
  top: 0;
  z-index: 999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Color variants based on scenario */
.scenario-banner.scenario-green {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.scenario-banner.scenario-blue {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.scenario-banner.scenario-yellow {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.scenario-banner.scenario-orange {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
}

.scenario-banner.scenario-red {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.scenario-banner.scenario-teal {
  background: linear-gradient(135deg, #009688 0%, #00796b 100%);
}

.scenario-banner.scenario-purple {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.scenario-banner.scenario-gray {
  background: linear-gradient(135deg, #9e9e9e 0%, #616161 100%);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.scenario-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scenario-info .icon {
  font-size: 24px;
  line-height: 1;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.text-content .label {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-content .name {
  font-size: 14px;
  font-weight: 600;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

.btn-switch,
.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.btn-switch:hover,
.btn-reset:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.btn-switch:active,
.btn-reset:active {
  transform: translateY(0);
}

.btn-switch .icon,
.btn-reset .icon {
  font-size: 16px;
  line-height: 1;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .scenario-banner {
    padding: 10px 12px;
  }

  .scenario-info .icon {
    font-size: 20px;
  }

  .text-content .label {
    font-size: 10px;
  }

  .text-content .name {
    font-size: 13px;
  }

  .banner-actions {
    gap: 6px;
  }

  .btn-switch,
  .btn-reset {
    padding: 5px 10px;
    font-size: 12px;
  }

  .btn-switch .icon,
  .btn-reset .icon {
    font-size: 14px;
  }

  /* Hide text on very small screens */
  @media (max-width: 400px) {
    .btn-switch span:not(.icon),
    .btn-reset span:not(.icon) {
      display: none;
    }

    .btn-switch,
    .btn-reset {
      padding: 6px;
    }
  }
}
</style>

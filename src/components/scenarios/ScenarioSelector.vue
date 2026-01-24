<template>
  <div class="scenario-selector">
    <!-- Button to open modal -->
    <button class="scenario-trigger-btn" @click="showModal = true">
      <span class="icon">{{ currentIcon }}</span>
      <span class="text">{{ currentName }}</span>
      <span class="chevron">›</span>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>เลือก Demo Scenario</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>

        <div class="modal-body">
          <p class="description">
            เลือกบุคลิกผู้ใช้เพื่อทดลองใช้งานระบบในสถานการณ์ต่าง ๆ
          </p>

          <div class="scenarios-grid">
            <div
              v-for="scenario in scenarios"
              :key="scenario.id"
              class="scenario-card"
              :class="{
                active: scenario.id === currentScenarioId,
                [`color-${scenario.color}`]: true,
              }"
              @click="selectScenario(scenario.id)"
            >
              <div class="scenario-icon">{{ scenario.icon }}</div>
              <div class="scenario-info">
                <h3>{{ scenario.name }}</h3>
                <div v-if="scenario.id === currentScenarioId" class="active-badge">
                  ✓ กำลังใช้งาน
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="resetToDefault">
            รีเซ็ตเป็นค่าเดิม
          </button>
          <button class="btn-primary" @click="showModal = false">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'

const scenarioStore = useScenarioStore()
const showModal = ref(false)

const scenarios = computed(() => scenarioStore.availableScenarios)
const currentScenarioId = computed(() => scenarioStore.currentScenarioId)
const currentIcon = computed(() => scenarioStore.currentIcon)
const currentName = computed(() => scenarioStore.currentName)

const selectScenario = async (scenarioId) => {
  if (scenarioId === currentScenarioId.value) return

  try {
    await scenarioStore.switchScenario(scenarioId)
    showModal.value = false
    // Optionally show a success message
  } catch (error) {
    console.error('Failed to switch scenario:', error)
  }
}

const resetToDefault = async () => {
  try {
    await scenarioStore.resetToDefault()
    showModal.value = false
  } catch (error) {
    console.error('Failed to reset scenario:', error)
  }
}
</script>

<style scoped>
.scenario-selector {
  position: relative;
}

.scenario-trigger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.scenario-trigger-btn:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}

.scenario-trigger-btn .icon {
  font-size: 20px;
}

.scenario-trigger-btn .text {
  font-weight: 500;
  color: #333;
}

.scenario-trigger-btn .chevron {
  font-size: 18px;
  color: #999;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.description {
  margin: 0 0 20px;
  color: #666;
  font-size: 14px;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.scenario-card {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.scenario-card:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.scenario-card.active {
  border-width: 3px;
  background: #e3f2fd;
}

/* Color variants */
.scenario-card.color-green { border-color: #4caf50; }
.scenario-card.color-green.active { background: #e8f5e9; border-color: #4caf50; }

.scenario-card.color-blue { border-color: #2196f3; }
.scenario-card.color-blue.active { background: #e3f2fd; border-color: #2196f3; }

.scenario-card.color-yellow { border-color: #ff9800; }
.scenario-card.color-yellow.active { background: #fff3e0; border-color: #ff9800; }

.scenario-card.color-orange { border-color: #ff5722; }
.scenario-card.color-orange.active { background: #fbe9e7; border-color: #ff5722; }

.scenario-card.color-red { border-color: #f44336; }
.scenario-card.color-red.active { background: #ffebee; border-color: #f44336; }

.scenario-card.color-teal { border-color: #009688; }
.scenario-card.color-teal.active { background: #e0f2f1; border-color: #009688; }

.scenario-card.color-purple { border-color: #9c27b0; }
.scenario-card.color-purple.active { background: #f3e5f5; border-color: #9c27b0; }

.scenario-card.color-gray { border-color: #9e9e9e; }
.scenario-card.color-gray.active { background: #f5f5f5; border-color: #9e9e9e; }

.scenario-icon {
  font-size: 36px;
  margin-bottom: 4px;
}

.scenario-info h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.active-badge {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: #4caf50;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .scenarios-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="stats-card" :class="{ [`stats-card--${variant}`]: variant }">
    <div class="stats-card__icon" v-if="icon" v-html="icon"></div>
    <div class="stats-card__content">
      <div class="stats-card__value">{{ formattedValue }}</div>
      <div class="stats-card__label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stats-card__trend" :class="{ 'stats-card__trend--up': trend > 0, 'stats-card__trend--down': trend < 0 }">
      <svg v-if="trend > 0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18,15 12,9 6,15"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  variant: {
    type: String,
    default: 'default', // default, success, warning, error, info
  },
  trend: {
    type: Number,
    default: null,
  },
});

const formattedValue = computed(() => {
  const val = Number(props.value);
  if (isNaN(val)) return props.value;

  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'K';
  }
  return val.toLocaleString();
});
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.stats-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-gray-1);
  color: var(--color-gray-4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card--success .stats-card__icon {
  background: #f0fdf4;
  color: var(--color-success);
}

.stats-card--warning .stats-card__icon {
  background: #fefce8;
  color: var(--color-warning);
}

.stats-card--error .stats-card__icon {
  background: #fef2f2;
  color: var(--color-error);
}

.stats-card--info .stats-card__icon {
  background: #eff6ff;
  color: var(--color-info);
}

.stats-card__content {
  flex: 1;
}

.stats-card__value {
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.stats-card__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  margin-top: var(--space-xs);
}

.stats-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-4);
}

.stats-card__trend--up {
  color: var(--color-success);
}

.stats-card__trend--down {
  color: var(--color-error);
}
</style>

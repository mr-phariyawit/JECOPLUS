<template>
  <div class="data-table">
    <div class="data-table__wrapper">
      <table class="data-table__table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'data-table__th--sortable': column.sortable }"
              :style="{ width: column.width }"
              @click="column.sortable && handleSort(column.key)"
            >
              <span>{{ column.label }}</span>
              <span v-if="column.sortable" class="data-table__sort">
                <svg
                  v-if="sortKey === column.key"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :style="{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }"
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="data-table__loading">
              <div class="data-table__spinner"></div>
              <span>Loading...</span>
            </td>
          </tr>
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="columns.length" class="data-table__empty">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, index) in data"
            :key="row.id || index"
            class="data-table__row"
            :class="{ 'data-table__row--clickable': rowClickable }"
            @click="rowClickable && $emit('row-click', row)"
          >
            <td v-for="column in columns" :key="column.key">
              <slot :name="column.key" :row="row" :value="getNestedValue(row, column.key)">
                {{ getNestedValue(row, column.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // [{ key: string, label: string, sortable?: boolean, width?: string }]
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: 'No data available',
  },
  rowClickable: {
    type: Boolean,
    default: false,
  },
  defaultSort: {
    type: String,
    default: null,
  },
  defaultOrder: {
    type: String,
    default: 'desc',
  },
});

const emit = defineEmits(['row-click', 'sort']);

const sortKey = ref(props.defaultSort);
const sortOrder = ref(props.defaultOrder);

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }

  emit('sort', { key: sortKey.value, order: sortOrder.value });
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.data-table__wrapper {
  overflow-x: auto;
}

.data-table__table {
  width: 100%;
  border-collapse: collapse;
}

.data-table__table th,
.data-table__table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-2);
}

.data-table__table th {
  background: var(--color-gray-1);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-5);
  white-space: nowrap;
}

.data-table__th--sortable {
  cursor: pointer;
  user-select: none;
}

.data-table__th--sortable:hover {
  background: var(--color-gray-2);
}

.data-table__sort {
  margin-left: var(--space-xs);
  display: inline-flex;
  align-items: center;
}

.data-table__table td {
  font-size: var(--font-size-small);
}

.data-table__row--clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.data-table__row--clickable:hover {
  background: var(--color-gray-1);
}

.data-table__loading,
.data-table__empty {
  text-align: center;
  padding: var(--space-2xl) !important;
  color: var(--color-gray-4);
}

.data-table__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.data-table__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

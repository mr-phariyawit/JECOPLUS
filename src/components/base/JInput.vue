<template>
  <div :class="['j-input', { 'j-input--error': error, 'j-input--disabled': disabled }]">
    <label v-if="label" class="j-input__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="j-input__required">*</span>
    </label>

    <div class="j-input__wrapper">
      <slot name="prefix" />
      <input
        :id="inputId"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore="true"
        class="j-input__field"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      <slot name="suffix" />
    </div>

    <p v-if="error" class="j-input__error">{{ error }}</p>
    <p v-else-if="helper" class="j-input__helper">{{ helper }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  error: String,
  helper: String,
  disabled: Boolean,
  required: Boolean,
  maxlength: [String, Number],
  inputmode: String,
  autocomplete: {
    type: String,
    default: 'off'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.j-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.j-input__label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-5);
}

.j-input__required {
  color: var(--color-red);
  margin-left: 2px;
}

.j-input__wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  transition: all var(--transition-fast);
  background: var(--color-white);
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
}

.j-input__wrapper:focus-within {
  border-color: var(--color-red);
  box-shadow: 0 0 0 4px rgba(228, 0, 15, 0.1);
}

.j-input--error .j-input__wrapper {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.j-input__field {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-black);
  padding: var(--space-md) 0;
  outline: none;
}

.j-input__field::placeholder {
  color: var(--color-gray-3);
}

.j-input--disabled .j-input__wrapper {
  background: var(--color-gray-1);
  opacity: 0.6;
  cursor: not-allowed;
}

.j-input--disabled .j-input__field {
  cursor: not-allowed;
}

.j-input__error {
  font-size: var(--font-size-mini);
  color: var(--color-error);
}

.j-input__helper {
  font-size: var(--font-size-mini);
  color: var(--color-gray-3);
}
</style>

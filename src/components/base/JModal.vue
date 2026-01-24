<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="jmodal-overlay"
        @click.self="handleBackdropClick"
      >
        <div :class="['jmodal', `jmodal--${size}`]">
          <!-- Header -->
          <div v-if="title || $slots.header" class="jmodal__header">
            <slot name="header">
              <h3 class="jmodal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              class="jmodal__close"
              @click="close"
              aria-label="ปิด"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="jmodal__body">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer || showFooter || confirmText || cancelText"
            class="jmodal__footer"
          >
            <slot name="footer">
              <JButton v-if="cancelText" variant="ghost" @click="close">
                {{ cancelText }}
              </JButton>
              <JButton
                v-if="confirmText"
                :variant="confirmVariant"
                :loading="loading"
                @click="$emit('confirm')"
              >
                {{ confirmText }}
              </JButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from "vue";
import JButton from "./JButton.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "medium", // small, medium, large, full
    validator: (v) => ["small", "medium", "large", "full"].includes(v),
  },
  closable: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    default: "",
  },
  confirmText: {
    type: String,
    default: "",
  },
  confirmVariant: {
    type: String,
    default: "primary",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "close", "confirm"]);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
/* Overlay */
.jmodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Modal Container - Glass Style */
.jmodal {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-xl, 20px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Size Variants */
.jmodal--small {
  max-width: 320px;
}

.jmodal--medium {
  max-width: 480px;
}

.jmodal--large {
  max-width: 640px;
}

.jmodal--full {
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  height: 100%;
}

/* Header */
.jmodal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.jmodal__title {
  margin: 0;
  font-size: var(--font-size-subheader, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-black, #1a1a1a);
}

.jmodal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: var(--radius-full, 50%);
  color: var(--color-gray-4, #888);
  cursor: pointer;
  transition: all 0.2s ease;
}

.jmodal__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-black, #1a1a1a);
}

/* Body */
.jmodal__body {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

/* Footer */
.jmodal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .jmodal,
.modal-leave-to .jmodal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-enter-to .jmodal,
.modal-leave-from .jmodal {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .jmodal {
    background: rgba(30, 30, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .jmodal__title {
    color: #fff;
  }

  .jmodal__close {
    background: rgba(255, 255, 255, 0.1);
    color: #aaa;
  }

  .jmodal__close:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .jmodal__header,
  .jmodal__footer {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>

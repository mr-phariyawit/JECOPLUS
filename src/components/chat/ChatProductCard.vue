<template>
  <div class="chat-product-card" @click="handleClick">
    <div class="chat-product-card__image" v-if="product.image">
      <img :src="product.image" :alt="product.name" />
    </div>
    <div class="chat-product-card__content">
      <h4 class="chat-product-card__name">{{ product.name }}</h4>
      <p v-if="product.description" class="chat-product-card__description">
        {{ product.description }}
      </p>
      <div class="chat-product-card__details">
        <span v-if="product.price" class="chat-product-card__price">
          {{ formatPrice(product.price) }}
        </span>
        <span v-if="product.badge" class="chat-product-card__badge">
          {{ product.badge }}
        </span>
      </div>
    </div>
    <div class="chat-product-card__arrow">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (product) => {
      return product.name && (product.id || product.url)
    },
  },
})

const emit = defineEmits(['click'])

const router = useRouter()

const formatPrice = (price) => {
  if (typeof price === 'number') {
    return `฿${price.toLocaleString('th-TH')}`
  }
  return price
}

const handleClick = () => {
  emit('click', props.product)

  // Navigate to product if URL or ID provided
  if (props.product.url) {
    window.location.href = props.product.url
  } else if (props.product.id) {
    // Example: navigate to loan detail
    if (props.product.type === 'loan') {
      router.push(`/loan/${props.product.id}`)
    } else if (props.product.type === 'product') {
      router.push(`/products/${props.product.id}`)
    }
  }
}
</script>

<style scoped>
.chat-product-card {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-xs);
}

.chat-product-card:hover {
  border-color: var(--color-red);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.chat-product-card__image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-gray-1);
}

.chat-product-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-product-card__content {
  flex: 1;
  min-width: 0;
}

.chat-product-card__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-xs) 0;
  color: var(--color-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-product-card__description {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  margin: 0 0 var(--space-xs) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-product-card__details {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.chat-product-card__price {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.chat-product-card__badge {
  padding: 2px var(--space-xs);
  background: var(--color-red);
  color: var(--color-white);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.chat-product-card__arrow {
  display: flex;
  align-items: center;
  color: var(--color-gray-3);
  flex-shrink: 0;
}

.chat-product-card:hover .chat-product-card__arrow {
  color: var(--color-red);
}
</style>

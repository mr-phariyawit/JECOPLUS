<template>
  <div class="settings screen">
    <JHeader title="วิธีชำระเงินของฉัน" :showBack="false" />

    <!-- J Wallet Section -->
    <section class="settings__section section">
      <h2 class="section-title">J Wallet</h2>
      <JCard>
        <div class="wallet-status">
          <div class="wallet-status__info">
            <div class="wallet-status__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M2 10H22" stroke="currentColor" stroke-width="2" />
                <circle cx="17" cy="15" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p class="wallet-status__title">J Wallet</p>
              <p class="wallet-status__desc text-mini">พร้อมใช้งาน</p>
            </div>
          </div>
          <JBadge label="เชื่อมต่อแล้ว" variant="success" />
        </div>
      </JCard>
    </section>

    <!-- Credit Cards Section -->
    <section class="settings__section section">
      <div class="flex-between">
        <h2 class="section-title">บัตรเครดิต / เดบิต</h2>
        <button class="add-btn" @click="showAddCardModal = true">
          + เพิ่ม
        </button>
      </div>

      <div v-if="paymentStore.cards.length > 0" class="cards-list">
        <JCard v-for="card in paymentStore.cards" :key="card.cardId">
          <div class="card-item">
            <div class="card-item__brand">
              <img :src="getCardBrandLogo(card.brand)" :alt="card.brand" />
            </div>
            <div class="card-item__info">
              <span class="card-item__number">•••• {{ card.last4 }}</span>
              <span class="card-item__expiry text-mini"
                >หมดอายุ {{ card.expiry }}</span
              >
            </div>
            <button class="remove-btn" @click="removeCard(card.cardId)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </JCard>
      </div>

      <div v-else class="empty-state">
        <p class="text-mini">ยังไม่มีบัตรที่ผูกไว้</p>
      </div>
    </section>

    <!-- Bank Accounts Section -->
    <section class="settings__section section">
      <div class="flex-between">
        <h2 class="section-title">บัญชีธนาคาร</h2>
        <button class="add-btn" @click="showAddBankModal = true">
          + เพิ่ม
        </button>
      </div>

      <div v-if="paymentStore.banks.length > 0" class="banks-list">
        <JCard v-for="bank in paymentStore.banks" :key="bank.bankId">
          <div class="bank-item">
            <div
              class="bank-item__logo"
              :style="{ background: getBankColor(bank.bankCode) }"
            >
              {{ bank.bankCode.slice(0, 1) }}
            </div>
            <div class="bank-item__info">
              <span class="bank-item__name">{{ bank.bankName }}</span>
              <span class="bank-item__account text-mini">{{
                bank.accountNo
              }}</span>
            </div>
            <button class="remove-btn" @click="removeBank(bank.bankId)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </JCard>
      </div>

      <div v-else class="empty-state">
        <p class="text-mini">ยังไม่มีบัญชีที่ผูกไว้</p>
      </div>
    </section>

    <!-- Add Card Modal -->
    <div
      v-if="showAddCardModal"
      class="modal-overlay"
      @click.self="showAddCardModal = false"
    >
      <div class="modal">
        <div class="modal__header">
          <h3>ผูกบัตรใบใหม่</h3>
          <button class="modal__close" @click="showAddCardModal = false">
            ×
          </button>
        </div>
        <div class="modal__body">
          <JInput
            v-model="newCard.number"
            label="หมายเลขบัตร"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
          />
          <div class="modal__row">
            <JInput
              v-model="newCard.expiry"
              label="วันหมดอายุ"
              placeholder="MM/YY"
              maxlength="5"
            />
            <JInput
              v-model="newCard.cvv"
              label="CVV"
              placeholder="123"
              maxlength="3"
              type="password"
            />
          </div>
          <JInput
            v-model="newCard.name"
            label="ชื่อบนบัตร"
            placeholder="SOMCHAI T"
          />
        </div>
        <div class="modal__footer">
          <JButton variant="primary" @click="addNewCard">ผูกบัตร</JButton>
        </div>
      </div>
    </div>

    <!-- Add Bank Modal -->
    <div
      v-if="showAddBankModal"
      class="modal-overlay"
      @click.self="showAddBankModal = false"
    >
      <div class="modal">
        <div class="modal__header">
          <h3>ผูกบัญชีธนาคาร</h3>
          <button class="modal__close" @click="showAddBankModal = false">
            ×
          </button>
        </div>
        <div class="modal__body">
          <p class="modal__desc text-small">เลือกธนาคาร</p>
          <div class="banks-grid">
            <button
              v-for="bank in banksList"
              :key="bank.code"
              :class="[
                'bank-option',
                { 'bank-option--selected': selectedBankCode === bank.code },
              ]"
              @click="selectedBankCode = bank.code"
            >
              <div
                class="bank-option__logo"
                :style="{ background: bank.color }"
              >
                {{ bank.code.slice(0, 1) }}
              </div>
              <span class="bank-option__name">{{ bank.name }}</span>
            </button>
          </div>
        </div>
        <div class="modal__footer">
          <JButton
            variant="primary"
            :disabled="!selectedBankCode"
            @click="addNewBank"
            >ดำเนินการต่อ</JButton
          >
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <JModal
      v-model="showDeleteModal"
      title="ยืนยันการลบ"
      size="small"
      confirmText="ลบ"
      cancelText="ยกเลิก"
      confirmVariant="danger"
      @confirm="confirmDelete"
    >
      <div class="delete-modal__content">
        <svg
          class="delete-modal__icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <p>{{ deleteMessage }}</p>
      </div>
    </JModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePaymentStore } from "../stores/payment";
import { banksList } from "../services/mockData";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";
import JBadge from "../components/base/JBadge.vue";
import JButton from "../components/base/JButton.vue";
import JInput from "../components/base/JInput.vue";
import JModal from "../components/base/JModal.vue";

const paymentStore = usePaymentStore();

const showAddCardModal = ref(false);
const showAddBankModal = ref(false);
const showDeleteModal = ref(false);
const deleteType = ref(""); // 'card' or 'bank'
const deleteId = ref(null);
const deleteMessage = ref("");
const selectedBankCode = ref("");
const newCard = ref({ number: "", expiry: "", cvv: "", name: "" });

const getCardBrandLogo = (brand) => {
  const logos = {
    VISA: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
    MASTERCARD:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  };
  return logos[brand] || logos.VISA;
};

const getBankColor = (code) => {
  const bank = banksList.find((b) => b.code === code);
  return bank?.color || "#666";
};

const addNewCard = async () => {
  const last4 = newCard.value.number.slice(-4);
  await paymentStore.addCard({
    brand: "VISA",
    last4,
    expiry: newCard.value.expiry,
    holderName: newCard.value.name,
  });
  showAddCardModal.value = false;
  newCard.value = { number: "", expiry: "", cvv: "", name: "" };
};

const addNewBank = async () => {
  const bankInfo = banksList.find((b) => b.code === selectedBankCode.value);
  if (!bankInfo) return;

  await paymentStore.addBank({
    bankCode: selectedBankCode.value,
    bankName: bankInfo.name,
    accountNo:
      "xxx-x-xx" +
      Math.floor(Math.random() * 900 + 100) +
      "-" +
      Math.floor(Math.random() * 9),
    holderName: "Demo User",
  });

  showAddBankModal.value = false;
  selectedBankCode.value = "";
};

const removeCard = (cardId) => {
  deleteType.value = "card";
  deleteId.value = cardId;
  deleteMessage.value = "ต้องการลบบัตรเครดิตนี้?";
  showDeleteModal.value = true;
};

const removeBank = (bankId) => {
  deleteType.value = "bank";
  deleteId.value = bankId;
  deleteMessage.value = "ต้องการลบบัญชีธนาคารนี้?";
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (deleteType.value === "card") {
    paymentStore.removeCard(deleteId.value);
  } else if (deleteType.value === "bank") {
    paymentStore.removeBank(deleteId.value);
  }
  showDeleteModal.value = false;
  deleteId.value = null;
};

onMounted(() => {
  paymentStore.fetchPaymentMethods();
});
</script>

<style scoped>
.settings__section {
  margin-bottom: var(--space-lg);
}

.add-btn {
  background: none;
  border: none;
  color: var(--color-red);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.cards-list,
.banks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card-item,
.bank-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.card-item__brand {
  width: 48px;
  height: 32px;
}

.card-item__brand img {
  max-width: 100%;
  max-height: 100%;
}

.card-item__info,
.bank-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-item__number,
.bank-item__name {
  font-weight: var(--font-weight-medium);
}

.bank-item__logo {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
  font-weight: var(--font-weight-bold);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-gray-3);
  cursor: pointer;
  padding: var(--space-sm);
}

.remove-btn:hover {
  color: var(--color-error);
}

.wallet-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wallet-status__info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.wallet-status__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-red), #ff4444);
  border-radius: var(--radius-md);
  color: white;
}

.wallet-status__title {
  font-weight: var(--font-weight-medium);
}

.empty-state {
  padding: var(--space-lg);
  text-align: center;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  color: var(--color-gray-4);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal {
  width: 100%;
  max-width: 430px;
  background: var(--color-white);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  font-size: 24px;
  cursor: pointer;
}

.modal__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.modal__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.modal__desc {
  color: var(--color-gray-4);
}

.modal__footer {
  padding: var(--space-md);
}

.banks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.bank-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
}

.bank-option--selected {
  border-color: var(--color-red);
  background: #fff5f5;
}

.bank-option__logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: var(--font-weight-bold);
}

.bank-option__name {
  font-size: var(--font-size-mini);
  text-align: center;
}

/* Delete Modal */
.delete-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-md) 0;
}

.delete-modal__icon {
  color: var(--color-red);
  margin-bottom: var(--space-md);
}

.delete-modal__content p {
  color: var(--color-gray-4);
  font-size: var(--font-size-body);
}
</style>

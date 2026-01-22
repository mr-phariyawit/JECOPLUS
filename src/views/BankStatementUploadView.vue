<template>
  <div class="upload-view">
    <header class="header">
      <button @click="$router.push('/wallet')" class="back-btn">←</button>
      <h1>อัปโหลด Statement</h1>
    </header>

    <div class="content">
      <div
        class="upload-area"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="application/pdf"
          hidden
          @change="handleFileSelect"
        />
        <div v-if="!file" class="placeholder">
          <span class="icon">📄</span>
          <p>คลิกเพื่อเลือกไฟล์ PDF</p>
          <p class="sub">หรือลากไฟล์มาวางที่นี่</p>
        </div>
        <div v-else class="file-info">
          <span class="icon">📑</span>
          <p>{{ file.name }}</p>
          <button @click.stop="removeFile" class="remove-btn">ลบ</button>
        </div>
      </div>

      <div v-if="uploadStatus" :class="['status-msg', uploadStatus.type]">
        {{ uploadStatus.message }}
      </div>

      <div v-if="parsedData" class="result-card">
        <h3>ผลการวิเคราะห์</h3>
        <ul>
          <li>รายการ: {{ parsedData.transactions }} รายการ</li>
          <li>รายรับรวม: {{ parsedData.income.toLocaleString() }} บาท</li>
          <li>รายจ่ายรวม: {{ parsedData.expenses.toLocaleString() }} บาท</li>
        </ul>
        <button @click="$router.push('/loan/score')" class="jeco-btn primary">
          ดูคะแนนเครดิต
        </button>
      </div>

      <button
        v-if="file && !parsedData"
        @click="handleUpload"
        :disabled="uploading"
        class="jeco-btn primary upload-btn"
      >
        {{ uploading ? "กำลังอัปโหลดและวิเคราะห์..." : "เริ่มวิเคราะห์" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useWalletStore } from "@/stores/wallet";

const walletStore = useWalletStore();
const file = ref(null);
const uploading = ref(false);
const uploadStatus = ref(null);
const parsedData = ref(null);

const handleFileSelect = (e) => {
  const selected = e.target.files[0];
  validateAndSetFile(selected);
};

const handleDrop = (e) => {
  const selected = e.dataTransfer.files[0];
  validateAndSetFile(selected);
};

const validateAndSetFile = (selected) => {
  if (selected && selected.type === "application/pdf") {
    file.value = selected;
    uploadStatus.value = null;
    parsedData.value = null;
  } else {
    uploadStatus.value = {
      type: "error",
      message: "กรุณาอัปโหลดไฟล์ PDF เท่านั้น",
    };
  }
};

const removeFile = () => {
  file.value = null;
  parsedData.value = null;
  uploadStatus.value = null;
};

const handleUpload = async () => {
  if (!file.value) return;

  uploading.value = true;
  uploadStatus.value = null;

  try {
    const result = await walletStore.uploadStatement(file.value);
    parsedData.value = result.extractedData;
    uploadStatus.value = { type: "success", message: "วิเคราะห์เอกสารสำเร็จ" };
  } catch (err) {
    uploadStatus.value = {
      type: "error",
      message: "เกิดข้อผิดพลาด: " + err.message,
    };
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.upload-view {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  margin-right: 15px;
  cursor: pointer;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  background: #f9f9f9;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #007bff;
  background: #f0f7ff;
}

.icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
}

.sub {
  font-size: 12px;
  color: #888;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.remove-btn {
  margin-top: 10px;
  color: red;
  background: none;
  border: 1px solid red;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.status-msg {
  padding: 10px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
}

.status-msg.error {
  background: #f8d7da;
  color: #721c24;
}

.status-msg.success {
  background: #d4edda;
  color: #155724;
}

.jeco-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.upload-btn {
  margin-top: 20px;
}

.jeco-btn.primary {
  background: #007bff;
  color: white;
}

.result-card {
  background: #fff;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-card h3 {
  margin-top: 0;
}
</style>

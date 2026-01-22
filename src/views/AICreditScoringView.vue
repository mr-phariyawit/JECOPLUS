<template>
  <div class="ai-scoring screen">
    <JHeader title="AI Credit Scoring" backTo="/apply" />

    <!-- AI Analysis Header -->
    <section class="ai-header">
      <div class="ai-header__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 class="ai-header__title">วิเคราะห์ข้อมูลด้วย AI</h2>
      <p class="ai-header__desc">ระบบ AI กำลังประมวลผลข้อมูลของคุณเพื่อประเมินความสามารถในการชำระหนี้</p>
    </section>

    <!-- Analysis Progress -->
    <section v-if="analyzing" class="analysis-progress">
      <div class="analysis-step" v-for="(step, index) in analysisSteps" :key="index"
           :class="{ 'active': currentStep === index, 'completed': currentStep > index }">
        <div class="analysis-step__icon">
          <svg v-if="currentStep > index" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div v-else-if="currentStep === index" class="spinner"></div>
          <div v-else class="dot"></div>
        </div>
        <div class="analysis-step__content">
          <span class="analysis-step__title">{{ step.title }}</span>
          <span class="analysis-step__desc">{{ step.description }}</span>
        </div>
      </div>
    </section>

    <!-- AI Results -->
    <section v-if="!analyzing && scoreResult" class="ai-results">
      <!-- Credit Score Circle -->
      <div class="score-card">
        <div class="score-circle" :class="scoreClass">
          <svg viewBox="0 0 100 100" class="score-ring">
            <circle cx="50" cy="50" r="45" stroke-width="8" fill="none" stroke="var(--color-gray-2)"/>
            <circle cx="50" cy="50" r="45" stroke-width="8" fill="none"
                    :stroke="scoreColor"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset"
                    stroke-linecap="round"
                    class="score-ring__progress"/>
          </svg>
          <div class="score-value">
            <span class="score-number">{{ animatedScore }}</span>
            <span class="score-label">คะแนน</span>
          </div>
        </div>
        <div class="score-rating">
          <JBadge :label="scoreResult.rating" :variant="scoreVariant" size="lg" />
          <p class="score-message">{{ scoreResult.message }}</p>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="insights-section">
        <h3 class="section-title">AI Insights</h3>

        <div class="insight-cards">
          <JCard v-for="(insight, index) in scoreResult.insights" :key="index">
            <div class="insight-item">
              <div class="insight-item__icon" :class="'insight-item__icon--' + insight.type">
                <component :is="getInsightIcon(insight.type)" />
              </div>
              <div class="insight-item__content">
                <span class="insight-item__label">{{ insight.label }}</span>
                <span class="insight-item__value">{{ insight.value }}</span>
              </div>
              <div class="insight-item__impact" :class="'impact--' + insight.impact">
                {{ insight.impactLabel }}
              </div>
            </div>
          </JCard>
        </div>
      </div>

      <!-- Data Sources Used -->
      <div class="data-sources">
        <h3 class="section-title">แหล่งข้อมูลที่ AI ใช้วิเคราะห์</h3>
        <div class="source-tags">
          <span class="source-tag" v-for="source in dataSources" :key="source">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ source }}
          </span>
        </div>
      </div>

      <!-- Recommendation -->
      <div class="recommendation">
        <JCard elevated>
          <div class="recommendation__content">
            <div class="recommendation__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="var(--color-warning)" stroke-width="2" fill="var(--color-warning)" fill-opacity="0.2"/>
              </svg>
            </div>
            <div class="recommendation__text">
              <h4>ผลิตภัณฑ์ที่ AI แนะนำ</h4>
              <p class="recommendation__product">{{ scoreResult.recommendedProduct }}</p>
              <p class="recommendation__reason">{{ scoreResult.recommendReason }}</p>
            </div>
          </div>
          <JButton variant="primary" block @click="applyRecommended">
            สมัครสินเชื่อที่แนะนำ
          </JButton>
        </JCard>
      </div>

      <!-- Technical Explainer -->
      <details class="tech-explainer">
        <summary class="tech-explainer__header">
          <span>วิธีการทำงานของ AI Model</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </summary>
        <div class="tech-explainer__content">
          <p><strong>Machine Learning Model:</strong> Gradient Boosting + Neural Network Ensemble</p>
          <p><strong>Features Used:</strong> 42 variables จากข้อมูลการเงิน, พฤติกรรม, และ demographic</p>
          <p><strong>Model Accuracy:</strong> 94.2% (validated on 500K+ historical records)</p>
          <p><strong>Processing Time:</strong> {{ processingTime }}ms</p>
        </div>
      </details>
    </section>

    <!-- Action Button -->
    <div v-if="!analyzing" class="action-buttons">
      <JButton variant="outline" block @click="$router.push('/apply')">
        เลือกผลิตภัณฑ์อื่น
      </JButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import JHeader from '../components/layout/JHeader.vue'
import JCard from '../components/base/JCard.vue'
import JBadge from '../components/base/JBadge.vue'
import JButton from '../components/base/JButton.vue'

const router = useRouter()

// Analysis state
const analyzing = ref(true)
const currentStep = ref(0)
const animatedScore = ref(0)
const processingTime = ref(0)

// Analysis steps
const analysisSteps = [
  { title: 'รวบรวมข้อมูล', description: 'กำลังดึงข้อมูลจากแหล่งต่างๆ' },
  { title: 'ประมวลผล AI Model', description: 'Gradient Boosting + Neural Network' },
  { title: 'วิเคราะห์ความเสี่ยง', description: 'ประเมิน Risk Score และ Probability of Default' },
  { title: 'สร้างคำแนะนำ', description: 'AI กำลังเลือกผลิตภัณฑ์ที่เหมาะสม' }
]

// Score result (mock data - would come from AI API)
const scoreResult = ref(null)

const circumference = 2 * Math.PI * 45

const dashOffset = computed(() => {
  if (!scoreResult.value) return circumference
  const progress = scoreResult.value.score / 900 // Max score 900
  return circumference - (progress * circumference)
})

const scoreColor = computed(() => {
  if (!scoreResult.value) return 'var(--color-gray-3)'
  const score = scoreResult.value.score
  if (score >= 750) return 'var(--color-success)'
  if (score >= 650) return 'var(--color-info)'
  if (score >= 550) return 'var(--color-warning)'
  return 'var(--color-error)'
})

const scoreClass = computed(() => {
  if (!scoreResult.value) return ''
  const score = scoreResult.value.score
  if (score >= 750) return 'score--excellent'
  if (score >= 650) return 'score--good'
  if (score >= 550) return 'score--fair'
  return 'score--poor'
})

const scoreVariant = computed(() => {
  if (!scoreResult.value) return 'default'
  const score = scoreResult.value.score
  if (score >= 750) return 'success'
  if (score >= 650) return 'info'
  if (score >= 550) return 'warning'
  return 'error'
})

const dataSources = [
  'ข้อมูลส่วนตัว',
  'ประวัติการเงิน',
  'พฤติกรรมการใช้จ่าย',
  'ข้อมูล NCB',
  'Social Behavior',
  'Device Fingerprint'
]

// Icon components
const getInsightIcon = (type) => {
  const icons = {
    income: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { d: 'M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    history: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M12 6v6l4 2', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    behavior: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    stability: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { d: 'M3 3v18h18', stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M18 9l-5 5-4-4-3 3', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
  return icons[type] || icons.income
}

// Simulate AI analysis
const runAnalysis = async () => {
  const startTime = Date.now()

  for (let i = 0; i < analysisSteps.length; i++) {
    currentStep.value = i
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
  }

  processingTime.value = Date.now() - startTime

  // Simulate score result
  scoreResult.value = {
    score: 742,
    rating: 'ดีมาก',
    message: 'คุณมีคะแนนเครดิตที่ดีมาก มีโอกาสสูงที่จะได้รับอนุมัติสินเชื่อ',
    insights: [
      { type: 'income', label: 'รายได้', value: 'สูงกว่าค่าเฉลี่ย 23%', impact: 'positive', impactLabel: '+45 pts' },
      { type: 'history', label: 'ประวัติชำระหนี้', value: 'ไม่เคยผิดนัดชำระ', impact: 'positive', impactLabel: '+80 pts' },
      { type: 'behavior', label: 'พฤติกรรมการเงิน', value: 'มีการออมเงินสม่ำเสมอ', impact: 'positive', impactLabel: '+35 pts' },
      { type: 'stability', label: 'ความมั่นคง', value: 'ทำงานที่เดิม 3+ ปี', impact: 'neutral', impactLabel: '+20 pts' }
    ],
    recommendedProduct: 'KB Personal Loan',
    recommendReason: 'เหมาะกับคะแนนเครดิตและรายได้ของคุณ ดอกเบี้ยต่ำสุด 15% ต่อปี'
  }

  analyzing.value = false

  // Animate score
  const targetScore = scoreResult.value.score
  const duration = 1500
  const steps = 60
  const increment = targetScore / steps

  for (let i = 0; i <= steps; i++) {
    setTimeout(() => {
      animatedScore.value = Math.min(Math.round(increment * i), targetScore)
    }, (duration / steps) * i)
  }
}

const applyRecommended = () => {
  router.push('/apply/kb-personal')
}

onMounted(() => {
  runAnalysis()
})
</script>

<style scoped>
.ai-header {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-lg);
}

.ai-header__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.ai-header__title {
  font-size: var(--font-size-title);
  margin-bottom: var(--space-xs);
}

.ai-header__desc {
  font-size: var(--font-size-small);
  opacity: 0.8;
}

/* Analysis Progress */
.analysis-progress {
  padding: var(--space-md) 0;
}

.analysis-step {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  opacity: 0.4;
  transition: all var(--transition-normal);
}

.analysis-step.active,
.analysis-step.completed {
  opacity: 1;
}

.analysis-step__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
}

.analysis-step.completed .analysis-step__icon {
  background: var(--color-success);
  background-opacity: 0.1;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--color-gray-3);
  border-radius: var(--radius-full);
}

.analysis-step__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.analysis-step__title {
  font-weight: var(--font-weight-medium);
}

.analysis-step__desc {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

/* Score Card */
.score-card {
  text-align: center;
  padding: var(--space-lg) 0;
}

.score-circle {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto var(--space-lg);
}

.score-ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.score-ring__progress {
  transition: stroke-dashoffset 1.5s ease-out;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  display: block;
}

.score-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.score-message {
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
  margin-top: var(--space-sm);
}

/* Insights */
.insights-section {
  margin: var(--space-lg) 0;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.insight-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.insight-item__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-white);
}

.insight-item__icon--income { background: var(--color-success); }
.insight-item__icon--history { background: var(--color-info); }
.insight-item__icon--behavior { background: var(--color-warning); }
.insight-item__icon--stability { background: var(--color-gray-5); }

.insight-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.insight-item__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.insight-item__value {
  font-weight: var(--font-weight-medium);
}

.insight-item__impact {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.impact--positive {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.impact--neutral {
  background: var(--color-gray-1);
  color: var(--color-gray-4);
}

.impact--negative {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

/* Data Sources */
.data-sources {
  margin: var(--space-lg) 0;
}

.source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.source-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  font-size: var(--font-size-mini);
  color: var(--color-gray-5);
}

.source-tag svg {
  color: var(--color-success);
}

/* Recommendation */
.recommendation {
  margin: var(--space-lg) 0;
}

.recommendation__content {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.recommendation__icon {
  flex-shrink: 0;
}

.recommendation__text h4 {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.recommendation__product {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.recommendation__reason {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  margin-top: var(--space-xs);
}

/* Tech Explainer */
.tech-explainer {
  margin: var(--space-lg) 0;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.tech-explainer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.tech-explainer[open] .tech-explainer__header svg {
  transform: rotate(180deg);
}

.tech-explainer__content {
  padding: 0 var(--space-md) var(--space-md);
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  line-height: var(--line-height-relaxed);
}

.tech-explainer__content p {
  margin-bottom: var(--space-sm);
}

.action-buttons {
  padding: var(--space-md) 0 var(--space-xl);
}
</style>
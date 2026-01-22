<template>
  <div class="impact screen">
    <JHeader title="Business Impact" backTo="/dashboard" />

    <!-- Hero Stats -->
    <section class="impact-hero">
      <div class="impact-hero__bg"></div>
      <div class="impact-hero__content">
        <h2 class="impact-hero__title">JECO+ Business Impact</h2>
        <p class="impact-hero__subtitle">Real-time Analytics & Projections</p>

        <div class="hero-metrics">
          <div class="hero-metric">
            <span class="hero-metric__value">฿{{ animatedRevenue }}M</span>
            <span class="hero-metric__label">Projected Revenue/Year</span>
          </div>
          <div class="hero-metric">
            <span class="hero-metric__value">{{ animatedUsers }}K</span>
            <span class="hero-metric__label">Target Users Y1</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Business Value Propositions -->
    <section class="section">
      <h3 class="section-title">Business Value Proposition</h3>

      <div class="value-cards">
        <JCard v-for="(value, index) in businessValues" :key="index">
          <div class="value-card">
            <div class="value-card__icon" :style="{ background: value.color }">
              <component :is="value.icon" />
            </div>
            <div class="value-card__content">
              <span class="value-card__title">{{ value.title }}</span>
              <span class="value-card__metric">{{ value.metric }}</span>
              <span class="value-card__desc">{{ value.description }}</span>
            </div>
          </div>
        </JCard>
      </div>
    </section>

    <!-- ROI Analysis -->
    <section class="section">
      <h3 class="section-title">ROI Analysis</h3>

      <JCard elevated>
        <div class="roi-header">
          <span class="roi-header__title">Return on Investment</span>
          <JBadge label="3 Years Projection" variant="info" />
        </div>

        <div class="roi-chart">
          <div class="roi-bars">
            <div
              v-for="(item, index) in roiData"
              :key="index"
              class="roi-bar-group"
            >
              <div class="roi-bar-wrapper">
                <div
                  class="roi-bar roi-bar--cost"
                  :style="{ height: `${item.costHeight}%` }"
                >
                  <span class="roi-bar__value">฿{{ item.cost }}M</span>
                </div>
                <div
                  class="roi-bar roi-bar--revenue"
                  :style="{ height: `${item.revenueHeight}%` }"
                >
                  <span class="roi-bar__value">฿{{ item.revenue }}M</span>
                </div>
              </div>
              <span class="roi-bar__label">{{ item.year }}</span>
            </div>
          </div>

          <div class="roi-legend">
            <span class="roi-legend__item"
              ><span class="dot dot--cost"></span> Investment</span
            >
            <span class="roi-legend__item"
              ><span class="dot dot--revenue"></span> Revenue</span
            >
          </div>
        </div>

        <div class="roi-summary">
          <div class="roi-summary__item">
            <span class="roi-summary__label">Break-even Point</span>
            <span class="roi-summary__value highlight">Month 8</span>
          </div>
          <div class="roi-summary__item">
            <span class="roi-summary__label">3-Year ROI</span>
            <span class="roi-summary__value highlight">340%</span>
          </div>
          <div class="roi-summary__item">
            <span class="roi-summary__label">NPV</span>
            <span class="roi-summary__value">฿156M</span>
          </div>
        </div>
      </JCard>
    </section>

    <!-- Ecosystem Synergy -->
    <section class="section">
      <h3 class="section-title">Jaymart Ecosystem Synergy</h3>

      <JCard>
        <div class="synergy-diagram">
          <div class="synergy-center">
            <div class="synergy-logo">JECO+</div>
          </div>

          <div class="synergy-connections">
            <div
              v-for="(conn, index) in ecosystemConnections"
              :key="index"
              class="synergy-node"
              :class="'synergy-node--' + index"
            >
              <div
                class="synergy-node__icon"
                :style="{ background: conn.color }"
              >
                {{ conn.icon }}
              </div>
              <span class="synergy-node__label">{{ conn.name }}</span>
              <span class="synergy-node__value">{{ conn.value }}</span>
            </div>
          </div>
        </div>

        <div class="synergy-benefits">
          <div
            class="synergy-benefit"
            v-for="(benefit, index) in synergyBenefits"
            :key="index"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="var(--color-success)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ benefit }}</span>
          </div>
        </div>
      </JCard>
    </section>

    <!-- AI Impact Metrics -->
    <section class="section">
      <h3 class="section-title">AI Technology Impact</h3>

      <div class="ai-metrics">
        <JCard v-for="(metric, index) in aiMetrics" :key="index">
          <div class="ai-metric">
            <div class="ai-metric__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="ai-metric__content">
              <span
                class="ai-metric__value"
                :class="metric.highlight ? 'highlight' : ''"
                >{{ metric.value }}</span
              >
              <span class="ai-metric__label">{{ metric.label }}</span>
            </div>
            <div
              v-if="metric.trend"
              class="ai-metric__trend"
              :class="'trend--' + metric.trend"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              {{ metric.trendValue }}
            </div>
          </div>
        </JCard>
      </div>
    </section>

    <!-- Adoption Roadmap -->
    <section class="section">
      <h3 class="section-title">Adoption Roadmap</h3>

      <div class="roadmap">
        <div
          v-for="(phase, index) in roadmapPhases"
          :key="index"
          class="roadmap-item"
          :class="{ 'roadmap-item--active': index === 0 }"
        >
          <div class="roadmap-item__marker">
            <div class="marker-dot"></div>
            <div
              v-if="index < roadmapPhases.length - 1"
              class="marker-line"
            ></div>
          </div>
          <div class="roadmap-item__content">
            <div class="roadmap-item__header">
              <span class="roadmap-item__title">{{ phase.title }}</span>
              <JBadge
                :label="phase.status"
                :variant="phase.statusVariant"
                size="sm"
              />
            </div>
            <span class="roadmap-item__timeline">{{ phase.timeline }}</span>
            <ul class="roadmap-item__tasks">
              <li v-for="task in phase.tasks" :key="task">{{ task }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Success Metrics -->
    <section class="section">
      <h3 class="section-title">Key Success Metrics (KPIs)</h3>

      <JCard>
        <div class="kpi-table">
          <div class="kpi-row kpi-row--header">
            <span>Metric</span>
            <span>Target Y1</span>
            <span>Target Y3</span>
          </div>
          <div v-for="(kpi, index) in kpiMetrics" :key="index" class="kpi-row">
            <span>{{ kpi.name }}</span>
            <span class="kpi-value">{{ kpi.y1 }}</span>
            <span class="kpi-value">{{ kpi.y3 }}</span>
          </div>
        </div>
      </JCard>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from "vue";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";
import JBadge from "../components/base/JBadge.vue";

// Animated values
const animatedRevenue = ref(0);
const animatedUsers = ref(0);

// Business Values
const businessValues = [
  {
    title: "New Revenue Stream",
    metric: "฿85M/Year",
    description: "จากดอกเบี้ยสินเชื่อและค่าธรรมเนียม",
    color: "var(--color-success)",
    icon: h(
      "svg",
      { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" },
      [
        h("path", {
          d: "M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
          stroke: "white",
          "stroke-width": 2,
          "stroke-linecap": "round",
        }),
      ],
    ),
  },
  {
    title: "Customer Acquisition Cost",
    metric: "-45%",
    description: "ลดต้นทุนการหาลูกค้าใหม่ผ่าน Ecosystem",
    color: "var(--color-info)",
    icon: h(
      "svg",
      { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" },
      [
        h("path", {
          d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
          stroke: "white",
          "stroke-width": 2,
        }),
        h("circle", { cx: 9, cy: 7, r: 4, stroke: "white", "stroke-width": 2 }),
      ],
    ),
  },
  {
    title: "Cross-sell Opportunity",
    metric: "3.2x",
    description: "เพิ่ม product holding ต่อลูกค้า",
    color: "var(--color-warning)",
    icon: h(
      "svg",
      { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" },
      [
        h("path", {
          d: "M22 12h-4l-3 9L9 3l-3 9H2",
          stroke: "white",
          "stroke-width": 2,
          "stroke-linecap": "round",
        }),
      ],
    ),
  },
  {
    title: "Default Rate Reduction",
    metric: "-28%",
    description: "ด้วย AI Credit Scoring",
    color: "var(--color-red)",
    icon: h(
      "svg",
      { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" },
      [
        h("path", {
          d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
          stroke: "white",
          "stroke-width": 2,
        }),
      ],
    ),
  },
];

// ROI Data
const roiData = [
  { year: "Y1", cost: 12, revenue: 25, costHeight: 30, revenueHeight: 45 },
  { year: "Y2", cost: 8, revenue: 65, costHeight: 20, revenueHeight: 75 },
  { year: "Y3", cost: 5, revenue: 95, costHeight: 12, revenueHeight: 95 },
];

// Ecosystem Connections
const ecosystemConnections = [
  { name: "Singer", value: "+฿12M", icon: "🏪", color: "#E4000F" },
  { name: "J Mart", value: "+฿8M", icon: "📱", color: "#1E1C1C" },
  { name: "KB Capital", value: "+฿25M", icon: "🏦", color: "#2563EB" },
  { name: "Casa Lapin", value: "+฿3M", icon: "☕", color: "#854D0E" },
  { name: "JAS Insurance", value: "+฿15M", icon: "🛡️", color: "#059669" },
  { name: "J Wallet", value: "+฿5M", icon: "💳", color: "#7C3AED" },
];

const synergyBenefits = [
  "Cross-sell สินเชื่อให้ลูกค้า Singer ผ่อนสินค้า",
  "Upsell ประกันให้ผู้กู้ผ่าน JAS Insurance",
  "ใช้ J Wallet เป็น payment rails หลัก",
  "ข้อมูล transaction จาก ecosystem ช่วย AI scoring",
];

// AI Metrics
const aiMetrics = [
  {
    value: "94.2%",
    label: "Model Accuracy",
    highlight: true,
    trend: "up",
    trendValue: "+5%",
  },
  { value: "< 3s", label: "Scoring Time", highlight: false },
  { value: "42+", label: "Features Used", highlight: false },
  { value: "500K", label: "Training Records", highlight: false },
];

// Roadmap
const roadmapPhases = [
  {
    title: "Phase 1: MVP Launch",
    timeline: "Q1 2025",
    status: "Current",
    statusVariant: "success",
    tasks: [
      "Personal Loan & Pah Pay",
      "AI Credit Scoring v1",
      "Basic Payment Integration",
    ],
  },
  {
    title: "Phase 2: Ecosystem Integration",
    timeline: "Q2-Q3 2025",
    status: "Planned",
    statusVariant: "info",
    tasks: [
      "Singer Hire Purchase",
      "J Wallet Deep Integration",
      "KB Capital Products",
    ],
  },
  {
    title: "Phase 3: AI Enhancement",
    timeline: "Q4 2025",
    status: "Planned",
    statusVariant: "info",
    tasks: ["AI Chatbot", "Predictive Analytics", "Fraud Detection AI"],
  },
  {
    title: "Phase 4: Scale",
    timeline: "2026",
    status: "Vision",
    statusVariant: "default",
    tasks: ["1M+ Users", "Regional Expansion", "Open Banking APIs"],
  },
];

// KPI Metrics
const kpiMetrics = [
  { name: "Active Users", y1: "50K", y3: "500K" },
  { name: "Loan Disbursement", y1: "฿500M", y3: "฿5B" },
  { name: "NPL Rate", y1: "< 5%", y3: "< 3%" },
  { name: "NPS Score", y1: "> 40", y3: "> 60" },
  { name: "Ecosystem Penetration", y1: "15%", y3: "45%" },
];

// Animate on mount
onMounted(() => {
  // Animate revenue
  const targetRevenue = 85;
  const revSteps = 50;
  for (let i = 0; i <= revSteps; i++) {
    setTimeout(() => {
      animatedRevenue.value = Math.round((targetRevenue / revSteps) * i);
    }, 20 * i);
  }

  // Animate users
  const targetUsers = 500;
  const userSteps = 50;
  for (let i = 0; i <= userSteps; i++) {
    setTimeout(() => {
      animatedUsers.value = Math.round((targetUsers / userSteps) * i);
    }, 20 * i);
  }
});
</script>

<style scoped>
.impact-hero {
  position: relative;
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-lg);
  padding: var(--space-xl) var(--space-md);
  color: var(--color-white);
  overflow: hidden;
}

.impact-hero__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-black) 0%,
    #2d2b2b 50%,
    var(--color-red) 100%
  );
}

.impact-hero__content {
  position: relative;
  text-align: center;
}

.impact-hero__title {
  font-size: var(--font-size-title);
  margin-bottom: var(--space-xs);
}

.impact-hero__subtitle {
  font-size: var(--font-size-small);
  opacity: 0.8;
  margin-bottom: var(--space-lg);
}

.hero-metrics {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
}

.hero-metric {
  display: flex;
  flex-direction: column;
}

.hero-metric__value {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
}

.hero-metric__label {
  font-size: var(--font-size-mini);
  opacity: 0.8;
}

/* Value Cards */
.value-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.value-card {
  display: flex;
  gap: var(--space-md);
}

.value-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.value-card__content {
  display: flex;
  flex-direction: column;
}

.value-card__title {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.value-card__metric {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.value-card__desc {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

/* ROI Chart */
.roi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.roi-header__title {
  font-weight: var(--font-weight-bold);
}

.roi-chart {
  margin-bottom: var(--space-md);
}

.roi-bars {
  display: flex;
  justify-content: space-around;
  height: 150px;
  align-items: flex-end;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-gray-2);
}

.roi-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.roi-bar-wrapper {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 120px;
}

.roi-bar {
  width: 28px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: height 0.5s ease;
}

.roi-bar--cost {
  background: var(--color-gray-3);
}

.roi-bar--revenue {
  background: var(--color-red);
}

.roi-bar__value {
  font-size: 10px;
  color: white;
  font-weight: var(--font-weight-bold);
}

.roi-bar__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.roi-legend {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.roi-legend__item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-small);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
}

.dot--cost {
  background: var(--color-gray-3);
}
.dot--revenue {
  background: var(--color-red);
}

.roi-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
}

.roi-summary__item {
  text-align: center;
}

.roi-summary__label {
  display: block;
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.roi-summary__value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
}

.roi-summary__value.highlight {
  color: var(--color-red);
}

/* Synergy Diagram */
.synergy-diagram {
  position: relative;
  height: 200px;
  margin-bottom: var(--space-md);
}

.synergy-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: var(--color-red);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.synergy-logo {
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-small);
}

.synergy-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.synergy-node--0 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
.synergy-node--1 {
  top: 20%;
  right: 5%;
}
.synergy-node--2 {
  bottom: 20%;
  right: 5%;
}
.synergy-node--3 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
.synergy-node--4 {
  bottom: 20%;
  left: 5%;
}
.synergy-node--5 {
  top: 20%;
  left: 5%;
}

.synergy-node__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.synergy-node__label {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
}

.synergy-node__value {
  font-size: 10px;
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

.synergy-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.synergy-benefit {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-small);
}

/* AI Metrics */
.ai-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.ai-metric {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.ai-metric__icon {
  width: 40px;
  height: 40px;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black);
}

.ai-metric__content {
  flex: 1;
}

.ai-metric__value {
  display: block;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
}

.ai-metric__value.highlight {
  color: var(--color-red);
}

.ai-metric__label {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.ai-metric__trend {
  display: flex;
  align-items: center;
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
}

.trend--up {
  color: var(--color-success);
}

/* Roadmap */
.roadmap {
  display: flex;
  flex-direction: column;
}

.roadmap-item {
  display: flex;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
}

.roadmap-item__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-gray-3);
  flex-shrink: 0;
}

.roadmap-item--active .marker-dot {
  background: var(--color-red);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: var(--color-gray-2);
  margin-top: 4px;
}

.roadmap-item__content {
  flex: 1;
  padding-bottom: var(--space-md);
}

.roadmap-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.roadmap-item__title {
  font-weight: var(--font-weight-medium);
}

.roadmap-item__timeline {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.roadmap-item__tasks {
  margin-top: var(--space-sm);
  padding-left: var(--space-md);
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.roadmap-item__tasks li {
  margin-bottom: 2px;
}

/* KPI Table */
.kpi-table {
  display: flex;
  flex-direction: column;
}

.kpi-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-gray-1);
  font-size: var(--font-size-small);
}

.kpi-row--header {
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-4);
}

.kpi-value {
  text-align: center;
  font-weight: var(--font-weight-medium);
}
</style>

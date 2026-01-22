<template>
  <div class="architecture screen">
    <JHeader title="System Architecture" backTo="/dashboard" />

    <!-- Overview -->
    <section class="arch-overview">
      <div class="arch-overview__content">
        <h2 class="arch-overview__title">JECO+ System Design</h2>
        <p class="arch-overview__desc">
          Scalable, Secure, AI-Powered Fintech Platform
        </p>

        <div class="arch-badges">
          <span class="arch-badge">Microservices</span>
          <span class="arch-badge">Event-Driven</span>
          <span class="arch-badge">AI/ML Ready</span>
        </div>
      </div>
    </section>

    <!-- Architecture Layers -->
    <section class="section">
      <h3 class="section-title">System Layers</h3>

      <div class="layers">
        <!-- Presentation Layer -->
        <div class="layer layer--presentation">
          <div class="layer__header">
            <span class="layer__icon">📱</span>
            <span class="layer__title">Presentation Layer</span>
          </div>
          <div class="layer__content">
            <div class="layer__items">
              <span class="layer__item">Vue 3 SPA</span>
              <span class="layer__item">Mobile-First UI</span>
              <span class="layer__item">PWA Ready</span>
            </div>
          </div>
        </div>

        <div class="layer-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <!-- API Gateway -->
        <div class="layer layer--gateway">
          <div class="layer__header">
            <span class="layer__icon">🔐</span>
            <span class="layer__title">API Gateway</span>
          </div>
          <div class="layer__content">
            <div class="layer__items">
              <span class="layer__item">Kong/AWS API GW</span>
              <span class="layer__item">Rate Limiting</span>
              <span class="layer__item">JWT Auth</span>
            </div>
          </div>
        </div>

        <div class="layer-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <!-- Business Logic -->
        <div class="layer layer--business">
          <div class="layer__header">
            <span class="layer__icon">⚙️</span>
            <span class="layer__title">Business Services</span>
          </div>
          <div class="layer__content">
            <div class="service-grid">
              <div class="service">
                <span class="service__name">Loan Service</span>
                <span class="service__tech">Node.js</span>
              </div>
              <div class="service">
                <span class="service__name">Payment Service</span>
                <span class="service__tech">Go</span>
              </div>
              <div class="service">
                <span class="service__name">User Service</span>
                <span class="service__tech">Node.js</span>
              </div>
              <div class="service service--ai">
                <span class="service__name">AI Scoring</span>
                <span class="service__tech">Python/ML</span>
              </div>
            </div>
          </div>
        </div>

        <div class="layer-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <!-- Data Layer -->
        <div class="layer layer--data">
          <div class="layer__header">
            <span class="layer__icon">🗄️</span>
            <span class="layer__title">Data Layer</span>
          </div>
          <div class="layer__content">
            <div class="layer__items">
              <span class="layer__item">PostgreSQL</span>
              <span class="layer__item">Redis Cache</span>
              <span class="layer__item">MongoDB (ML)</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Pipeline -->
    <section class="section">
      <h3 class="section-title">AI/ML Pipeline</h3>

      <JCard elevated>
        <div class="ai-pipeline">
          <div class="pipeline-step">
            <div class="pipeline-step__icon">📊</div>
            <div class="pipeline-step__content">
              <span class="pipeline-step__title">Data Collection</span>
              <span class="pipeline-step__desc"
                >42+ features จาก multiple sources</span
              >
            </div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-step__icon">🔄</div>
            <div class="pipeline-step__content">
              <span class="pipeline-step__title">Feature Engineering</span>
              <span class="pipeline-step__desc"
                >Normalization, Encoding, Selection</span
              >
            </div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-step__icon">🧠</div>
            <div class="pipeline-step__content">
              <span class="pipeline-step__title">Model Inference</span>
              <span class="pipeline-step__desc"
                >XGBoost + Neural Network Ensemble</span
              >
            </div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-step__icon">✅</div>
            <div class="pipeline-step__content">
              <span class="pipeline-step__title">Decision Output</span>
              <span class="pipeline-step__desc"
                >Credit Score + Risk Assessment</span
              >
            </div>
          </div>
        </div>

        <div class="ai-features">
          <h4 class="ai-features__title">AI Features (42 Variables)</h4>
          <div class="feature-categories">
            <div class="feature-category">
              <span class="feature-category__title">Demographics</span>
              <ul class="feature-category__list">
                <li>Age, Gender, Location</li>
                <li>Employment Type</li>
                <li>Income Level</li>
              </ul>
            </div>
            <div class="feature-category">
              <span class="feature-category__title">Financial</span>
              <ul class="feature-category__list">
                <li>Credit History (NCB)</li>
                <li>Bank Statement Analysis</li>
                <li>Debt-to-Income Ratio</li>
              </ul>
            </div>
            <div class="feature-category">
              <span class="feature-category__title">Behavioral</span>
              <ul class="feature-category__list">
                <li>App Usage Patterns</li>
                <li>Transaction History</li>
                <li>Social Indicators</li>
              </ul>
            </div>
          </div>
        </div>
      </JCard>
    </section>

    <!-- Integration Points -->
    <section class="section">
      <h3 class="section-title">Integration Architecture</h3>

      <div class="integrations">
        <JCard v-for="(integration, index) in integrations" :key="index">
          <div class="integration">
            <div
              class="integration__icon"
              :style="{ background: integration.color }"
            >
              {{ integration.icon }}
            </div>
            <div class="integration__content">
              <span class="integration__name">{{ integration.name }}</span>
              <span class="integration__type">{{ integration.type }}</span>
              <span class="integration__desc">{{
                integration.description
              }}</span>
            </div>
            <div
              class="integration__status"
              :class="'status--' + integration.status"
            >
              {{ integration.statusLabel }}
            </div>
          </div>
        </JCard>
      </div>
    </section>

    <!-- Security Architecture -->
    <section class="section">
      <h3 class="section-title">Security Architecture</h3>

      <JCard>
        <div class="security-layers">
          <div
            v-for="(layer, index) in securityLayers"
            :key="index"
            class="security-layer"
          >
            <div class="security-layer__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="security-layer__content">
              <span class="security-layer__title">{{ layer.title }}</span>
              <span class="security-layer__items">{{
                layer.items.join(" • ")
              }}</span>
            </div>
          </div>
        </div>
      </JCard>
    </section>

    <!-- Tech Stack -->
    <section class="section">
      <h3 class="section-title">Technology Stack</h3>

      <div class="tech-stack">
        <div
          v-for="(category, index) in techStack"
          :key="index"
          class="tech-category"
        >
          <span class="tech-category__title">{{ category.name }}</span>
          <div class="tech-category__items">
            <span
              v-for="tech in category.items"
              :key="tech"
              class="tech-item"
              >{{ tech }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Scalability -->
    <section class="section">
      <h3 class="section-title">Scalability Design</h3>

      <JCard elevated>
        <div class="scale-metrics">
          <div class="scale-metric">
            <span class="scale-metric__value">10K+</span>
            <span class="scale-metric__label">Concurrent Users</span>
          </div>
          <div class="scale-metric">
            <span class="scale-metric__value">< 200ms</span>
            <span class="scale-metric__label">API Response Time</span>
          </div>
          <div class="scale-metric">
            <span class="scale-metric__value">99.9%</span>
            <span class="scale-metric__label">Target Uptime</span>
          </div>
        </div>

        <div class="scale-features">
          <div class="scale-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="var(--color-success)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>Horizontal Auto-scaling (K8s HPA)</span>
          </div>
          <div class="scale-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="var(--color-success)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>Database Read Replicas</span>
          </div>
          <div class="scale-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="var(--color-success)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>CDN for Static Assets</span>
          </div>
          <div class="scale-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="var(--color-success)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>Message Queue (RabbitMQ/Kafka)</span>
          </div>
        </div>
      </JCard>
    </section>
  </div>
</template>

<script setup>
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";

const integrations = [
  {
    name: "NCB Credit Bureau",
    type: "External API",
    description: "ดึงข้อมูลประวัติเครดิต",
    icon: "🏦",
    color: "#1E40AF",
    status: "active",
    statusLabel: "Active",
  },
  {
    name: "J Wallet",
    type: "Internal API",
    description: "Payment gateway หลัก",
    icon: "💳",
    color: "#7C3AED",
    status: "active",
    statusLabel: "Active",
  },
  {
    name: "KB Kookmin Bank",
    type: "Partner API",
    description: "KB Personal Loan products",
    icon: "🇰🇷",
    color: "#DC2626",
    status: "active",
    statusLabel: "Active",
  },
  {
    name: "Singer ERP",
    type: "Internal API",
    description: "Hire purchase integration",
    icon: "🏪",
    color: "#059669",
    status: "planned",
    statusLabel: "Q2 2025",
  },
];

const securityLayers = [
  {
    title: "Application Security",
    items: ["JWT/OAuth 2.0", "RBAC", "Input Validation", "XSS/CSRF Protection"],
  },
  {
    title: "Data Security",
    items: ["AES-256 Encryption", "Data Masking", "PDPA Compliance"],
  },
  {
    title: "Infrastructure Security",
    items: ["WAF", "DDoS Protection", "VPN/Private Network"],
  },
];

const techStack = [
  {
    name: "Frontend",
    items: ["Vue 3", "Pinia", "Vue Router", "Vite"],
  },
  {
    name: "Backend",
    items: ["Node.js", "Go", "Python", "GraphQL"],
  },
  {
    name: "AI/ML",
    items: ["TensorFlow", "XGBoost", "scikit-learn", "MLflow"],
  },
  {
    name: "Infrastructure",
    items: ["AWS/GCP", "Kubernetes", "Docker", "Terraform"],
  },
  {
    name: "Database",
    items: ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch"],
  },
  {
    name: "Monitoring",
    items: ["Prometheus", "Grafana", "ELK Stack", "Sentry"],
  },
];
</script>

<style scoped>
.arch-overview {
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-lg);
  padding: var(--space-xl) var(--space-md);
  text-align: center;
}

.arch-overview__title {
  font-size: var(--font-size-title);
  margin-bottom: var(--space-xs);
}

.arch-overview__desc {
  font-size: var(--font-size-small);
  opacity: 0.8;
  margin-bottom: var(--space-md);
}

.arch-badges {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.arch-badge {
  padding: var(--space-xs) var(--space-sm);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-mini);
}

/* Layers */
.layers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layer {
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.layer__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: white;
}

.layer--presentation .layer__header {
  background: #3b82f6;
}
.layer--gateway .layer__header {
  background: #8b5cf6;
}
.layer--business .layer__header {
  background: #10b981;
}
.layer--data .layer__header {
  background: #f59e0b;
}

.layer__icon {
  font-size: 20px;
}

.layer__title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.layer__content {
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-top: none;
  padding: var(--space-md);
}

.layer__items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.layer__item {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-gray-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-mini);
}

.layer-connector {
  color: var(--color-gray-3);
  padding: var(--space-xs) 0;
}

/* Services */
.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.service {
  padding: var(--space-sm);
  background: var(--color-gray-1);
  border-radius: var(--radius-sm);
  text-align: center;
}

.service--ai {
  background: linear-gradient(135deg, var(--color-red) 0%, #ff6b6b 100%);
  color: white;
}

.service__name {
  display: block;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.service__tech {
  font-size: var(--font-size-mini);
  opacity: 0.7;
}

/* AI Pipeline */
.ai-pipeline {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
  margin-bottom: var(--space-md);
}

.pipeline-step {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.pipeline-step__icon {
  font-size: 24px;
}

.pipeline-step__content {
  display: flex;
  flex-direction: column;
}

.pipeline-step__title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.pipeline-step__desc {
  font-size: 10px;
  color: var(--color-gray-4);
}

.pipeline-arrow {
  color: var(--color-gray-3);
  font-size: 20px;
}

.ai-features__title {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.feature-categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.feature-category__title {
  display: block;
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
  color: var(--color-red);
  margin-bottom: var(--space-xs);
}

.feature-category__list {
  font-size: 10px;
  color: var(--color-gray-4);
  padding-left: var(--space-sm);
  margin: 0;
}

.feature-category__list li {
  margin-bottom: 2px;
}

/* Integrations */
.integrations {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.integration {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.integration__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.integration__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.integration__name {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.integration__type {
  font-size: 10px;
  color: var(--color-red);
}

.integration__desc {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.integration__status {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
}

.status--active {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status--planned {
  background: var(--color-gray-1);
  color: var(--color-gray-4);
}

/* Security */
.security-layers {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.security-layer {
  display: flex;
  gap: var(--space-md);
}

.security-layer__icon {
  width: 40px;
  height: 40px;
  background: var(--color-red);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.security-layer__content {
  display: flex;
  flex-direction: column;
}

.security-layer__title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.security-layer__items {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

/* Tech Stack */
.tech-stack {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.tech-category__title {
  display: block;
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.tech-category__items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tech-item {
  padding: 2px var(--space-sm);
  background: var(--color-gray-1);
  border-radius: var(--radius-sm);
  font-size: 10px;
}

/* Scale */
.scale-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
  margin-bottom: var(--space-md);
}

.scale-metric {
  text-align: center;
}

.scale-metric__value {
  display: block;
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.scale-metric__label {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.scale-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.scale-feature {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-small);
}
</style>

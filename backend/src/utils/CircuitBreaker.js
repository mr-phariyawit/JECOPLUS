import logger from './logger.js';

/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily disabling failing providers
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Provider is failing, requests are blocked
 * - HALF_OPEN: Testing if provider has recovered
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failures = new Map(); // provider -> failure count
    this.lastFailure = new Map(); // provider -> timestamp
    this.lastSuccess = new Map(); // provider -> timestamp

    // Configuration
    this.threshold = options.threshold || 3; // Open circuit after N failures
    this.timeout = options.timeout || 60000; // 1 minute cooldown
    this.halfOpenAttempts = options.halfOpenAttempts || 1; // Allow 1 retry in HALF_OPEN
  }

  /**
   * Record a successful request
   * @param {string} provider - Provider name
   */
  recordSuccess(provider) {
    const previousFailures = this.failures.get(provider) || 0;

    // Reset failure count
    this.failures.delete(provider);
    this.lastFailure.delete(provider);
    this.lastSuccess.set(provider, Date.now());

    if (previousFailures > 0) {
      logger.info(`Circuit breaker CLOSED for ${provider} (recovered after ${previousFailures} failures)`);
    }
  }

  /**
   * Record a failed request
   * @param {string} provider - Provider name
   */
  recordFailure(provider) {
    const count = (this.failures.get(provider) || 0) + 1;
    this.failures.set(provider, count);
    this.lastFailure.set(provider, Date.now());

    if (count >= this.threshold) {
      logger.warn(`⚠️  Circuit breaker OPEN for ${provider} (${count} consecutive failures)`);
      logger.warn(`    Provider will be skipped for ${this.timeout / 1000} seconds`);
    } else {
      logger.debug(`Circuit breaker: ${provider} failed (${count}/${this.threshold})`);
    }
  }

  /**
   * Check if circuit breaker is open for a provider
   * @param {string} provider - Provider name
   * @returns {boolean} True if circuit is open (provider should be skipped)
   */
  isOpen(provider) {
    const failures = this.failures.get(provider) || 0;
    const lastFail = this.lastFailure.get(provider);

    // Circuit is CLOSED (normal operation)
    if (failures < this.threshold) {
      return false;
    }

    // Circuit is OPEN, check if timeout has passed
    if (lastFail && Date.now() - lastFail > this.timeout) {
      // Move to HALF_OPEN state (allow limited retries)
      logger.info(`Circuit breaker HALF-OPEN for ${provider}, allowing retry`);
      this.failures.set(provider, this.threshold - this.halfOpenAttempts);
      return false;
    }

    // Circuit is still OPEN
    return true;
  }

  /**
   * Get circuit state for a provider
   * @param {string} provider - Provider name
   * @returns {string} 'CLOSED', 'OPEN', or 'HALF_OPEN'
   */
  getState(provider) {
    const failures = this.failures.get(provider) || 0;
    const lastFail = this.lastFailure.get(provider);

    if (failures < this.threshold) {
      return 'CLOSED';
    }

    if (lastFail && Date.now() - lastFail > this.timeout) {
      return 'HALF_OPEN';
    }

    return 'OPEN';
  }

  /**
   * Get status for all providers
   * @returns {object} Status map
   */
  getStatus() {
    const status = {};
    const allProviders = new Set([
      ...this.failures.keys(),
      ...this.lastFailure.keys(),
      ...this.lastSuccess.keys()
    ]);

    for (const provider of allProviders) {
      status[provider] = {
        state: this.getState(provider),
        failures: this.failures.get(provider) || 0,
        lastFailure: this.lastFailure.get(provider),
        lastSuccess: this.lastSuccess.get(provider),
      };
    }

    return status;
  }

  /**
   * Reset circuit breaker for a specific provider
   * @param {string} provider - Provider name
   */
  reset(provider) {
    this.failures.delete(provider);
    this.lastFailure.delete(provider);
    logger.info(`Circuit breaker RESET for ${provider}`);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    this.failures.clear();
    this.lastFailure.clear();
    logger.info('All circuit breakers RESET');
  }
}

export default CircuitBreaker;

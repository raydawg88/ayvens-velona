import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  // ============================================
  // STATE
  // ============================================
  state: () => ({
    // Map of request key → request state object
    // Example: { 'tasks:load': { status: 'loading', startTime: 123, error: null } }
    requests: {},

    // Global flags for UI convenience
    hasAnyLoading: false,
    hasAnyErrors: false,
  }),

  // ============================================
  // GETTERS
  // ============================================
  getters: {
    // Get all currently loading requests
    loadingRequests: (state) => {
      return Object.entries(state.requests)
        .filter(([_, req]) => req.status === 'loading')
        .map(([key, req]) => ({ key, ...req }))
    },

    // Get all failed requests
    errorRequests: (state) => {
      return Object.entries(state.requests)
        .filter(([_, req]) => req.status === 'error')
        .map(([key, req]) => ({ key, ...req }))
    },

    // Get all successful requests
    successRequests: (state) => {
      return Object.entries(state.requests)
        .filter(([_, req]) => req.status === 'success')
        .map(([key, req]) => ({ key, ...req }))
    },

    // Check if specific request is loading
    isRequestLoading: (state) => (key) => {
      return state.requests[key]?.status === 'loading'
    },

    // Check if specific request has error
    hasRequestError: (state) => (key) => {
      return state.requests[key]?.status === 'error'
    },

    // Get specific request state
    getRequestState: (state) => (key) => {
      return state.requests[key] || null
    },

    // Get error for specific request
    getRequestError: (state) => (key) => {
      return state.requests[key]?.error || null
    },

    // Get all store names currently loading
    loadingStores: (state) => {
      return [
        ...new Set(
          Object.keys(state.requests)
            .filter((key) => state.requests[key].status === 'loading')
            .map((key) => key.split(':')[0]),
        ),
      ]
    },

    // Count of active requests
    activeRequestCount: (state) => {
      return Object.values(state.requests).filter((req) => req.status === 'loading').length
    },

    // Count of failed requests
    errorRequestCount: (state) => {
      return Object.values(state.requests).filter((req) => req.status === 'error').length
    },
  },

  // ============================================
  // ACTIONS
  // ============================================
  actions: {
    /**
     * Start tracking a new request
     * @param {string} key - Unique identifier (e.g., 'tasks:load', 'auth:checkStatus')
     * @param {Object} meta - Optional metadata about the request
     */
    startRequest(key, meta = {}) {
      this.requests[key] = {
        status: 'loading',
        startTime: Date.now(),
        endTime: null,
        duration: null,
        error: null,
        meta,
      }
      this._updateGlobalFlags()
    },

    /**
     * Mark request as successful
     * @param {string} key - Request identifier
     * @param {Object} result - Optional result data
     */
    successRequest(key, result = null) {
      if (!this.requests[key]) {
        console.warn(`[LoadingStore] Attempted to mark unknown request as success: ${key}`)
        return
      }

      const endTime = Date.now()
      this.requests[key] = {
        ...this.requests[key],
        status: 'success',
        endTime,
        duration: endTime - this.requests[key].startTime,
        result,
      }
      this._updateGlobalFlags()
    },

    /**
     * Mark request as failed
     * @param {string} key - Request identifier
     * @param {Error|string} error - Error object or message
     */
    errorRequest(key, error) {
      if (!this.requests[key]) {
        console.warn(`[LoadingStore] Attempted to mark unknown request as error: ${key}`)
        return
      }

      const endTime = Date.now()
      const errorMessage = error instanceof Error ? error.message : error

      this.requests[key] = {
        ...this.requests[key],
        status: 'error',
        endTime,
        duration: endTime - this.requests[key].startTime,
        error: errorMessage,
        errorObj: error instanceof Error ? error : null,
      }
      this._updateGlobalFlags()
    },

    /**
     * Clear a specific request from tracking
     * @param {string} key - Request identifier
     */
    clearRequest(key) {
      delete this.requests[key]
      this._updateGlobalFlags()
    },

    /**
     * Clear all requests for a specific store
     * @param {string} storeName - Store name (e.g., 'tasks')
     */
    clearStoreRequests(storeName) {
      Object.keys(this.requests).forEach((key) => {
        if (key.startsWith(`${storeName}:`)) {
          delete this.requests[key]
        }
      })
      this._updateGlobalFlags()
    },

    /**
     * Clear all error requests (useful after showing error notifications)
     */
    clearAllErrors() {
      Object.keys(this.requests).forEach((key) => {
        if (this.requests[key].status === 'error') {
          delete this.requests[key]
        }
      })
      this._updateGlobalFlags()
    },

    /**
     * Clear all successful requests (cleanup after route navigation)
     */
    clearAllSuccess() {
      Object.keys(this.requests).forEach((key) => {
        if (this.requests[key].status === 'success') {
          delete this.requests[key]
        }
      })
      this._updateGlobalFlags()
    },

    /**
     * Clear all requests
     */
    clearAllRequests() {
      this.requests = {}
      this._updateGlobalFlags()
    },

    /**
     * Clear old completed requests (success/error older than X ms)
     * @param {number} olderThan - Milliseconds (default: 5 minutes)
     */
    clearOldRequests(olderThan = 5 * 60 * 1000) {
      const now = Date.now()
      Object.keys(this.requests).forEach((key) => {
        const req = this.requests[key]
        if (req.status !== 'loading' && req.endTime && now - req.endTime > olderThan) {
          delete this.requests[key]
        }
      })
      this._updateGlobalFlags()
    },

    /**
     * Internal: Update global convenience flags
     */
    _updateGlobalFlags() {
      this.hasAnyLoading = Object.values(this.requests).some((req) => req.status === 'loading')
      this.hasAnyErrors = Object.values(this.requests).some((req) => req.status === 'error')
    },

    /**
     * Get performance metrics for debugging
     */
    getPerformanceMetrics() {
      const allRequests = Object.entries(this.requests)
      const completed = allRequests.filter(([_, req]) => req.status !== 'loading')

      if (completed.length === 0) return null

      const durations = completed.map(([_, req]) => req.duration).filter((d) => d !== null)

      return {
        totalRequests: allRequests.length,
        completedRequests: completed.length,
        loadingRequests: allRequests.length - completed.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
      }
    },
  },
})

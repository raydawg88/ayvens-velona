import { defineStore } from 'pinia'

// Demo priorities for Element Fleet AI showcase
const DEMO_AVAILABLE_PRIORITIES = [
  { slug: 'safety', name: 'Safety & Compliance' },
  { slug: 'fuel_efficiency', name: 'Fuel Efficiency' },
  { slug: 'maintenance', name: 'Maintenance' },
  { slug: 'driver_behavior', name: 'Driver Behavior' },
  { slug: 'compliance', name: 'Regulatory Compliance' },
  { slug: 'telematics', name: 'Telematics & Technology' },
]

const DEMO_USER_PRIORITIES = [
  { priority_id: 'safety', order: 1 },
  { priority_id: 'fuel_efficiency', order: 2 },
  { priority_id: 'maintenance', order: 3 },
  { priority_id: 'driver_behavior', order: 4 },
  { priority_id: 'compliance', order: 5 },
  { priority_id: 'telematics', order: 6 },
]

export const usePrioritiesStore = defineStore('priorities', {
  state: () => ({
    availablePriorities: [],
    userPriorities: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    orderedPriorities: (state) => {
      if (!state.userPriorities.length || !state.availablePriorities.length) return []

      return state.userPriorities
        .sort((a, b) => a.order - b.order)
        .map(up => {
          const available = state.availablePriorities.find(ap => ap.slug === up.priority_id)
          return available ? { ...available, order: up.order } : null
        })
        .filter(Boolean)
    },
  },

  actions: {
    async fetchAvailablePriorities() {
      this.isLoading = true
      this.error = null
      try {
        // Use demo data
        this.availablePriorities = DEMO_AVAILABLE_PRIORITIES
      } catch (error) {
        console.error('[Priorities] Fetch available error:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserPriorities(userId) {
      this.isLoading = true
      this.error = null
      try {
        // Use demo data
        this.userPriorities = DEMO_USER_PRIORITIES
      } catch (error) {
        console.error('[Priorities] Fetch user priorities error:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateUserPriorities(userId, orderedSlugs) {
      this.isLoading = true
      this.error = null
      try {
        // For demo, update local state
        this.userPriorities = orderedSlugs.map((slug, index) => ({
          priority_id: slug,
          order: index + 1
        }))
        return { success: true }
      } catch (error) {
        console.error('[Priorities] Update error:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async loadAll(userId) {
      await Promise.all([
        this.fetchAvailablePriorities(),
        this.fetchUserPriorities(userId)
      ])
    },

    clearAllState() {
      this.availablePriorities = []
      this.userPriorities = []
      this.isLoading = false
      this.error = null
    },
  },
})

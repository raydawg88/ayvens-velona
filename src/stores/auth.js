import { defineStore } from 'pinia'

// Demo user for Element Fleet AI showcase
const DEMO_USER = {
  id: 'demo-001',
  first_name: 'Sarah',
  last_name: 'Chen',
  email: 'sarah.chen@element.com',
  role: 'Fleet Manager',
  company: 'Element Fleet Services',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: DEMO_USER,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: () => true,
    token: () => 'demo_token',

    userDisplayName: (state) => {
      if (!state.user) return 'User'
      if (state.user.first_name && state.user.last_name) {
        return `${state.user.first_name} ${state.user.last_name}`
      }
      if (state.user.first_name) return state.user.first_name
      if (state.user.email) return state.user.email
      return 'User'
    },
  },

  actions: {
    async load() {
      return true
    },

    async login() {
      return { success: true }
    },

    async logout() {
      // In demo mode, just reload the page
      window.location.href = '/'
    },

    async getCurrentUser() {
      return this.user
    },

    clearAllState() {
      this.user = DEMO_USER
      this.isLoading = false
    },
  },
})

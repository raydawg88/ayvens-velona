<template>
  <div class="flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-lg">
      <!-- Logo/Branding -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center mb-6">
          <img :src="elementLogo" alt="Element Logo" class="h-20" />
        </div>
        <p class="text-[17px] text-muted leading-relaxed">Sign in to your fleet dashboard</p>
      </div>

      <!-- Login Form Card -->
      <div class="login-card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="login-label">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="login-input"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="login-label">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="login-input"
              placeholder="Enter your password"
            />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <p>{{ errorMessage }}</p>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="login-btn"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
          >
            <div v-if="authStore.isLoading" class="flex items-center justify-center">
              <div
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              Signing in...
            </div>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Demo Mode Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-[#E3E3E3]"></div>
          </div>
          <div class="relative flex justify-center text-[14px]">
            <span class="px-4 bg-white text-muted">or</span>
          </div>
        </div>

        <!-- Demo Button -->
        <button
          @click="enterDemoMode"
          class="demo-btn"
        >
          View Demo
        </button>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-[14px] text-muted">
            Secure fleet management powered by
            <span class="gradient-text font-semibold">Element</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import elementLogo from '@/assets/element_logo.png'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error || 'Login failed. Please try again.'
  }
}

const enterDemoMode = () => {
  // Set demo user in auth store
  authStore.user = {
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@element.com'
  }
  // Set a fake token for demo mode using correct TokenManager keys
  localStorage.setItem('auth_token', 'demo_token')
  localStorage.setItem('auth_token_expiry', String(Date.now() + 86400000)) // 24 hours
  localStorage.setItem('token_type', 'Bearer')
  router.push('/')
}
</script>

<style scoped>
/* Element Brand Colors */
.text-muted { color: #A0A0A0; }

/* Premium Login Card */
.login-card {
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
  padding: 40px;
}

/* Form Labels */
.login-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #3C3C3C;
  margin-bottom: 10px;
}

/* Form Inputs */
.login-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  color: #3C3C3C;
  background: white;
  border: 1px solid #E3E3E3;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.login-input:focus {
  outline: none;
  border-color: #00D7D2;
  box-shadow: 0 0 0 3px rgba(0, 215, 210, 0.12);
}

.login-input::placeholder {
  color: #A0A0A0;
}

/* Primary Button (Blue for CTAs per Element brand) */
.login-btn {
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #05AFDC;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(5, 175, 220, 0.3);
}

.login-btn:hover:not(:disabled) {
  background: #00D7D2;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 175, 220, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Demo Button */
.demo-btn {
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #05AFDC;
  background: white;
  border: 2px solid #00D7D2;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-btn:hover {
  background: rgba(0, 215, 210, 0.08);
  transform: translateY(-2px);
}

.demo-btn:active {
  transform: translateY(0);
}

/* Error Message */
.error-message {
  padding: 14px 18px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-size: 14px;
  color: #dc2626;
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 50%, #00D7D2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

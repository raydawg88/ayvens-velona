<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-6">
      <h1 class="text-[48px] md:text-[56px] font-semibold text-charcoal mb-3 leading-tight tracking-tight">
        Fleet Settings
      </h1>
      <p class="text-[17px] text-muted font-normal leading-relaxed">
        Configure your fleet management preferences and priority categories.
      </p>
    </div>

    <!-- Modern Priorities Section -->
    <div class="section-spacing-sm relative max-w-4xl mx-auto">
      <div
        class="absolute bottom-0 left-1/3 w-24.5 h-24.5 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl"
      />

      <div class="mb-8">
        <h2 class="settings-section-title">Priority Categories</h2>
        <p class="text-[17px] text-muted leading-relaxed">
          Drag and drop categories to set your priority order. Categories at the top will receive
          more focus in analysis and recommendations.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-12 h-12 border-4 border-[#E3E3E3] border-t-[#00D7D2] rounded-full animate-spin"></div>
          <p class="text-[16px] text-muted">Loading priorities...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="settings-card p-8 border border-red-200 bg-red-50">
        <p class="text-[16px] text-red-600">{{ error }}</p>
      </div>

      <!-- Priorities List -->
      <div v-else class="space-y-3">
        <div
          v-for="(category, index) in priorities"
          :key="category.slug"
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
          :class="[
            'priority-card',
            draggedItem === index
              ? 'priority-card-dragging'
              : dragOverItem === index
                ? 'priority-card-over'
                : '',
          ]"
        >
          <div class="flex items-center space-x-4 flex-1 relative z-10">
            <div class="flex items-center space-x-3 text-muted">
              <Bars3Icon class="w-5 h-5" />
              <div class="priority-number">
                {{ index + 1 }}
              </div>
            </div>

            <div>
              <h3 class="text-[16px] font-semibold text-charcoal mb-0.5">{{ category.name }}</h3>
              <p class="text-[14px] text-muted">
                {{
                  index === 0
                    ? 'Highest Priority'
                    : index === priorities.length - 1
                      ? 'Lowest Priority'
                      : `Priority ${index + 1}`
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-4 relative z-10">
            <div
              v-if="index < 3"
              class="priority-badge"
              :class="index === 0 ? 'priority-critical' : index === 1 ? 'priority-medium' : 'priority-low'"
            >
              {{ index === 0 ? 'Critical' : index === 1 ? 'Medium' : 'Low' }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Auto-save Status Messages -->
    <div class="flex flex-col items-center pt-6 space-y-3">
      <!-- Success Message -->
      <div
        v-if="saveSuccess"
        class="status-message status-success"
      >
        Priority order saved automatically!
      </div>

      <!-- Error Message -->
      <div
        v-if="saveError"
        class="status-message status-error"
      >
        {{ saveError }}
      </div>
    </div>

    <!-- User Profile Section -->
    <div class="section-spacing-sm relative max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="settings-section-title">User Profile</h2>
        <p class="text-[17px] text-muted leading-relaxed">
          Update your personal information and contact details.
        </p>
      </div>

      <div class="settings-card p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="first_name" class="settings-label">
              First Name
            </label>
            <input
              id="first_name"
              v-model="profileForm.first_name"
              type="text"
              class="settings-input"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label for="last_name" class="settings-label">
              Last Name
            </label>
            <input
              id="last_name"
              v-model="profileForm.last_name"
              type="text"
              class="settings-input"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div class="mt-6">
          <label for="email" class="settings-label">
            Email
          </label>
          <input
            id="email"
            v-model="profileForm.email"
            type="email"
            class="settings-input"
            placeholder="Enter email address"
          />
        </div>

        <!-- Profile Update Status -->
        <div v-if="profileSuccess" class="status-message status-success mt-6">
          Profile updated successfully!
        </div>

        <div v-if="profileError" class="status-message status-error mt-6">
          {{ profileError }}
        </div>

        <button
          @click="handleProfileUpdate"
          :disabled="isUpdatingProfile"
          class="settings-btn mt-6"
          :class="{ 'opacity-50 cursor-not-allowed': isUpdatingProfile }"
        >
          {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
        </button>
      </div>
    </div>

    <!-- Change Password Section -->
    <div class="section-spacing-sm relative max-w-4xl mx-auto pb-8">
      <div class="mb-8">
        <h2 class="settings-section-title">Change Password</h2>
        <p class="text-[17px] text-muted leading-relaxed">
          Update your password. Must be 12-128 characters.
        </p>
      </div>

      <div class="settings-card p-8">
        <div>
          <label for="current_password" class="settings-label">
            Current Password
          </label>
          <input
            id="current_password"
            v-model="passwordForm.current_password"
            type="password"
            class="settings-input"
            placeholder="Enter current password"
          />
        </div>

        <div class="mt-6">
          <label for="new_password" class="settings-label">
            New Password
          </label>
          <input
            id="new_password"
            v-model="passwordForm.new_password"
            type="password"
            class="settings-input"
            placeholder="Enter new password (12-128 characters)"
          />
          <p class="mt-2 text-[14px] text-muted">
            We recommend great pass phrases. <a href="https://xkcd.com/936/" target="_blank" rel="noopener noreferrer" class="text-[#05AFDC] hover:text-[#00D7D2] underline transition-colors">Learn why</a>
          </p>
        </div>

        <div class="mt-6">
          <label for="confirm_password" class="settings-label">
            Confirm New Password
          </label>
          <input
            id="confirm_password"
            v-model="passwordForm.confirm_password"
            type="password"
            class="settings-input"
            placeholder="Confirm new password"
          />
        </div>

        <!-- Password Update Status -->
        <div v-if="passwordSuccess" class="status-message status-success mt-6">
          Password updated successfully!
        </div>

        <div v-if="passwordError" class="status-message status-error mt-6">
          {{ passwordError }}
        </div>

        <button
          @click="handlePasswordChange"
          :disabled="isUpdatingPassword"
          class="settings-btn mt-6"
          :class="{ 'opacity-50 cursor-not-allowed': isUpdatingPassword }"
        >
          {{ isUpdatingPassword ? 'Updating...' : 'Change Password' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { usePrioritiesStore } from '@/stores/priorities'
import { useAuthStore } from '@/stores/auth'

const prioritiesStore = usePrioritiesStore()
const authStore = useAuthStore()

const profileForm = ref({
  first_name: '',
  last_name: '',
  email: ''
})
const profileSuccess = ref(false)
const profileError = ref(null)
const isUpdatingProfile = ref(false)

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})
const passwordSuccess = ref(false)
const passwordError = ref(null)
const isUpdatingPassword = ref(false)

const priorities = ref([])
const draggedItem = ref(null)
const dragOverItem = ref(null)
const saveSuccess = ref(false)
const saveError = ref(null)

const isLoading = computed(() => prioritiesStore.isLoading)
const error = computed(() => prioritiesStore.error)

onMounted(async () => {
  // Load profile from auth store
  profileForm.value.first_name = authStore.user?.first_name || ''
  profileForm.value.last_name = authStore.user?.last_name || ''
  profileForm.value.email = authStore.user?.email || ''

  // Load priorities
  await prioritiesStore.loadAll('demo-user')
  priorities.value = prioritiesStore.orderedPriorities.map(p => ({
    slug: p.slug,
    name: p.name
  }))
})

const handleProfileUpdate = async () => {
  profileSuccess.value = false
  profileError.value = null
  isUpdatingProfile.value = true

  // Simulate update delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Update local state (demo mode)
  authStore.user = {
    ...authStore.user,
    first_name: profileForm.value.first_name,
    last_name: profileForm.value.last_name,
    email: profileForm.value.email
  }

  profileSuccess.value = true
  isUpdatingProfile.value = false
  setTimeout(() => { profileSuccess.value = false }, 3000)
}

const handlePasswordChange = async () => {
  passwordSuccess.value = false
  passwordError.value = null

  if (passwordForm.value.new_password.length < 12 || passwordForm.value.new_password.length > 128) {
    passwordError.value = 'Password must be between 12 and 128 characters'
    return
  }

  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordError.value = 'New passwords do not match'
    return
  }

  if (!passwordForm.value.current_password) {
    passwordError.value = 'Current password is required'
    return
  }

  isUpdatingPassword.value = true

  // Simulate update delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Clear form (demo mode - always succeeds)
  passwordForm.value.current_password = ''
  passwordForm.value.new_password = ''
  passwordForm.value.confirm_password = ''

  passwordSuccess.value = true
  isUpdatingPassword.value = false
  setTimeout(() => { passwordSuccess.value = false }, 3000)
}

const handleDragStart = (index, event) => {
  draggedItem.value = index
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  dragOverItem.value = index
  event.dataTransfer.dropEffect = 'move'
}

const handleDragLeave = () => {
  dragOverItem.value = null
}

const handleDrop = async (event, dropIndex) => {
  event.preventDefault()

  if (draggedItem.value === null) return

  const newPriorities = [...priorities.value]
  const draggedCategory = newPriorities[draggedItem.value]

  newPriorities.splice(draggedItem.value, 1)
  newPriorities.splice(dropIndex, 0, draggedCategory)

  priorities.value = newPriorities
  draggedItem.value = null
  dragOverItem.value = null

  saveSuccess.value = false
  saveError.value = null

  if (!authStore.user?.id) {
    saveError.value = 'User not authenticated'
    return
  }

  const orderedSlugs = priorities.value.map(p => p.slug)
  const result = await prioritiesStore.updateUserPriorities(authStore.user.id, orderedSlugs)

  if (result.success) {
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 2000)
  } else {
    saveError.value = result.error || 'Failed to save priorities'
  }
}
</script>

<style scoped>
/* Element Brand Colors */
.text-charcoal { color: #3C3C3C; }
.text-muted { color: #A0A0A0; }

/* Section Title */
.settings-section-title {
  font-size: 28px;
  font-weight: 600;
  color: #3C3C3C;
  margin-bottom: 1rem;
}

/* Premium Card */
.settings-card {
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
  max-width: 42rem;
}

/* Priority Cards */
.priority-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: move;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.priority-card:hover {
  border-color: #00D7D2;
  box-shadow:
    0 4px 12px rgba(0, 215, 210, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.priority-card-dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.priority-card-over {
  border-color: #00D7D2;
  background: rgba(0, 215, 210, 0.04);
  transform: scale(1.01);
}

.priority-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
}

.priority-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.priority-critical {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.priority-medium {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.priority-low {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

/* Form Elements */
.settings-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #3C3C3C;
  margin-bottom: 8px;
}

.settings-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  color: #3C3C3C;
  background: white;
  border: 1px solid #E3E3E3;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.settings-input:focus {
  outline: none;
  border-color: #00D7D2;
  box-shadow: 0 0 0 3px rgba(0, 215, 210, 0.12);
}

.settings-input::placeholder {
  color: #A0A0A0;
}

/* Button */
.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 100%);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 215, 210, 0.3);
}

.settings-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 215, 210, 0.4);
}

.settings-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Status Messages */
.status-message {
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.status-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
}
</style>

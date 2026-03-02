<template>
  <nav
    class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[1480px] px-6 will-change-auto"
  >
    <!-- Single Container with Width Animation -->
    <div
      class="navbar-container"
      :style="{
        width: isCollapsed ? '80px' : '100%',
        transition: 'width 200ms ease-out',
      }"
    >
      <!-- Always Present Logo (Anchored Left) -->
      <div class="navbar-logo" @click="toggleCollapsed">
        <div class="logo-icon">
          <img :src="logoIcon" alt="Element Logo" class="h-16 w-auto" />
        </div>
      </div>

      <!-- Navigation Links -->
      <div
        class="navbar-links"
        :style="{
          opacity: isCollapsed ? '0' : '1',
          width: isCollapsed ? '0px' : 'auto',
          overflow: 'hidden',
          transition: isCollapsed
            ? 'opacity 40ms ease-out, width 200ms ease-out 40ms'
            : 'width 200ms ease-out, opacity 40ms ease-out 160ms',
        }"
      >
        <button
          v-for="item in navigationItems"
          :key="item.id"
          @click="navigateTo(item.id)"
          class="uppercase tracking-widest"
          :class="['navbar-link', isActive(item.id) ? 'navbar-link-active' : '']"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- Logout Button -->
      <div
        class="navbar-spacer"
        :style="{
          opacity: isCollapsed ? '0' : '1',
          width: isCollapsed ? '0px' : 'auto',
          overflow: 'hidden',
          transition: isCollapsed
            ? 'opacity 40ms ease-out, width 200ms ease-out 40ms'
            : 'width 200ms ease-out, opacity 40ms ease-out 160ms',
        }"
      >
        <button
          @click="handleLogout"
          class="navbar-logout-btn flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-200 uppercase tracking-widest cursor-pointer"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import logoIcon from '@/assets/element_logo_white_contrast.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
let lastScrollY = 0

const navigationItems = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'insights', label: 'Insights', path: '/insights' },
  { id: 'tasks', label: 'Tasks', path: '/tasks' },
  { id: 'settings', label: 'Settings', path: '/settings' },
]

const isActive = (itemId) => {
  if (itemId === 'home') {
    return route.path === '/'
  }
  return route.path.startsWith(`/${itemId}`)
}

const navigateTo = (itemId) => {
  const item = navigationItems.find((nav) => nav.id === itemId)
  if (item) {
    router.push(item.path)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  // Hard page refresh to clear all cached data and prevent back-button access
  window.location.href = '/login'
}

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleScroll = () => {
  const currentScrollY = window.scrollY

  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    // Scrolling down
    isCollapsed.value = true
  } else if (currentScrollY < lastScrollY) {
    // Scrolling up
    isCollapsed.value = false
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar-container {
  height: 62px;
  border-radius: 34px;
  background: #00D7D2;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translate3d(0, 0, 0);
  will-change: width;
  overflow: hidden;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  cursor: pointer;
}

.logo-icon {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logo-icon img {
  height: 64px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-size: 26px;
  font-weight: 400;
  color: white;
  margin: 0;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

@media (min-width: 1024px) {
  .navbar-links {
    gap: 16px;
  }
}

@media (min-width: 1280px) {
  .navbar-links {
    gap: 20px;
  }
}

.navbar-link {
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-size: 16px;
  font-weight: normal;
  color: #ffffff;
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 1024px) {
  .navbar-link {
    padding: 8px 28px;
  }
}

@media (min-width: 1280px) {
  .navbar-link {
    padding: 8px 32px;
  }
}

.navbar-link:hover {
  color: #000000;
}

.navbar-link-active {
  color: #000000 !important;
  font-weight: 600;
}

.navbar-spacer {
  width: 140px;
  flex-shrink: 0;
}

.navbar-logout-btn {
  color: #ffffff;
}

.navbar-logout-btn:hover {
  color: #000000;
}

@media (max-width: 768px) {
  .navbar-pill {
    padding: 0 16px;
  }

  .navbar-spacer {
    width: 80px;
  }

  .navbar-links {
    gap: 4px;
  }

  .navbar-link {
    padding: 6px 12px;
    font-size: 14px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FloatingNavigation from '@/components/FloatingNavigation.vue'
import FloatingFooter from '@/components/FloatingFooter.vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

// Scroll button visibility
const showScrollButton = ref(true)

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  })
}

const handleScrollButton = () => {
  const scrollTop = window.scrollY
  const documentHeight = document.documentElement.scrollHeight
  const windowHeight = window.innerHeight

  // Hide button when user is within 100px of the bottom
  const isAtBottom = scrollTop + windowHeight >= documentHeight - 100
  showScrollButton.value = !isAtBottom
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollButton, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollButton)
})
</script>

<template>
  <div class="gradient-bg">
    <!-- Modern Floating Navigation -->
    <FloatingNavigation />

    <!-- Main Content -->
    <main class="pt-[100px] px-6 pb-8 relative z-10">
      <div class="modern-container">
        <slot />
      </div>
    </main>

    <!-- Floating Scroll to Bottom Button -->
    <Transition name="scroll-button">
      <button
        v-if="showScrollButton"
        @click="scrollToBottom"
        class="fixed bottom-6 w-12 h-12 rounded-full z-50 flex items-center justify-center cursor-pointer scroll-to-bottom-btn"
        style="left: calc(50% - 24px); background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(20px)"
      >
        <ChevronDownIcon class="w-5 h-5 text-white" style="stroke-width: 2.5" />
      </button>
    </Transition>

    <!-- Footer -->
    <FloatingFooter />
  </div>
</template>

<style scoped>
.scroll-button-enter-active,
.scroll-button-leave-active {
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}

.scroll-button-enter-from,
.scroll-button-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

.scroll-to-bottom-btn {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  will-change: box-shadow, transform;
  transition:
    box-shadow 0.3s ease-out,
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}

.scroll-to-bottom-btn:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 50px rgba(0, 215, 210, 0.6),
    0 0 100px rgba(0, 215, 210, 0.3);
}

.scroll-to-bottom-btn svg {
  transition: color 0.3s ease-out;
}

.scroll-to-bottom-btn:hover svg {
  color: #00D7D2;
}
</style>

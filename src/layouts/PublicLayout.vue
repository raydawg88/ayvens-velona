<script setup>
import FloatingFooter from '@/components/FloatingFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-white overflow-hidden relative">
    <!-- Clean white background with subtle gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-white to-[#BEFFFA]/10 z-0"></div>

    <!-- Main Content (centered for login) -->
    <main class="pt-[160px] px-6 pb-12 relative z-10">
      <div class="modern-container">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <FloatingFooter />
  </div>
</template>

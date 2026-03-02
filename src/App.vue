<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const route = useRoute()

const currentLayout = computed(() => {
  return route.meta.layout === 'public' ? PublicLayout : AuthenticatedLayout
})
</script>

<template>
  <component :is="currentLayout">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </component>
</template>

<style>
/* Page transitions (internal navigation) */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

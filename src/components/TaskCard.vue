<template>
  <div
    class="task-card relative bg-white rounded-2xl flex flex-col box-border overflow-hidden cursor-pointer"
    :style="{ '--accent-color': task.dotColor }"
  >
    <!-- Left accent border -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
      :style="{ backgroundColor: task.dotColor }"
    ></div>

    <div class="p-5 pl-6">
      <!-- Header with priority badge -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span
            class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
            :style="{
              color: task.dotColor,
              backgroundColor: task.dotColor + '15'
            }"
          >
            {{ task.priority }}
          </span>
        </div>

        <!-- Bookmark Button -->
        <button
          @click.stop="$emit('toggle-star', task.id)"
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg cursor-pointer transition-all"
          :class="task.starred
            ? 'text-teal bg-teal/10'
            : 'text-muted hover:text-charcoal hover:bg-surface'"
        >
          <BookmarkIcon
            class="w-3.5 h-3.5"
            :class="task.starred ? 'fill-current' : ''"
          />
          {{ task.starred ? 'Saved' : 'Save' }}
        </button>
      </div>

      <!-- Task title -->
      <h3 class="text-[15px] font-semibold text-charcoal mb-2 leading-snug pr-4">
        {{ task.title }}
      </h3>

      <!-- Task description -->
      <p class="text-[13px] font-normal text-muted mb-4 leading-relaxed line-clamp-2">
        {{ task.description }}
      </p>

      <!-- Task tags -->
      <div class="flex flex-wrap gap-1.5 mt-auto">
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="text-[10px] font-medium text-charcoal/60 bg-charcoal/[0.04] px-2.5 py-1 rounded-md capitalize"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookmarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle-star'])
</script>

<style scoped>
.task-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.task-card:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* Element brand colors */
.text-charcoal {
  color: #3C3C3C;
}

.text-muted {
  color: #A0A0A0;
}

.text-teal {
  color: #00D7D2;
}

.bg-surface {
  background-color: #F5F5F5;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="text-center py-6">
      <h1 class="text-[48px] md:text-[56px] font-semibold text-charcoal mb-3 leading-tight tracking-tight">
        Let's knock these Tasks out!
      </h1>
      <p class="text-[17px] text-muted font-normal leading-relaxed">
        Review and complete the tasks Element has identified for your fleet.
      </p>
    </div>

    <!-- Two Column Layout -->
    <div class="max-w-7xl mx-auto px-6 pb-16 relative">
      <div class="grid grid-cols-5 gap-8 h-[calc(100vh-280px)]">
        <!-- Left Column - Task Cards (2/5 width) -->
        <div
          ref="taskListContainer"
          class="col-span-2 h-full overflow-y-auto scrollbar-hide scroll-snap-container"
        >
          <!-- Loading State -->
          <div v-if="taskStore.isLoading" class="flex items-center justify-center h-32">
            <p class="text-slate-500">Loading tasks...</p>
          </div>

          <!-- Task Cards -->
          <div v-else class="space-y-4 px-2 pr-4 pt-6 pb-6">
            <TaskCard
              v-for="task in sortedTasks"
              :key="task.id"
              :task="task"
              :show-drawer="false"
              :data-task-id="task.id"
              :class="[
                'task-card-item',
                selectedTask?.id === task.id
                  ? 'task-card-selected'
                  : 'task-card-unselected',
              ]"
              @click="selectTask(task)"
              @toggle-star="toggleTaskStar"
            />
          </div>
        </div>

        <!-- Right Column - Task Details (3/5 width) -->
        <div v-if="selectedTask" class="col-span-3 flex flex-col">
          <!-- Content Container - Premium Card -->
          <div class="task-detail-card flex flex-col max-h-[875px]">
            <!-- Task Header -->
            <div class="px-8 py-6 border-b border-border">
              <h2 class="text-[22px] font-semibold text-charcoal leading-tight">
                {{ selectedTask.detailContent?.header || selectedTask.title }}
              </h2>
            </div>

            <!-- Task Content -->
            <div
              ref="taskContentContainer"
              class="flex-1 px-8 py-6 overflow-y-auto task-content-scrollbar"
            >
              <!-- Summary Section -->
              <div v-if="selectedTask.summary" class="mb-10">
                <h3 class="task-section-header">Summary</h3>
                <MarkdownRenderer :content="selectedTask.summary" />
              </div>

              <!-- Description Section -->
              <div v-if="selectedTask.description" class="mb-10">
                <h3 class="task-section-header">Description</h3>
                <MarkdownRenderer :content="selectedTask.description" />
              </div>

              <!-- Problem Section -->
              <div v-if="selectedTask.problem" class="mb-10">
                <h3 class="task-section-header">Problem</h3>
                <MarkdownRenderer :content="selectedTask.problem" />
              </div>

              <!-- Business Impact Section -->
              <div v-if="selectedTask.business_impact" class="mb-10">
                <h3 class="task-section-header">Business Impact</h3>
                <MarkdownRenderer :content="selectedTask.business_impact" />
              </div>

              <!-- Action Plan Section -->
              <div v-if="selectedTask.action_plan" class="mb-10">
                <h3 class="task-section-header task-section-header--action">
                  <span class="action-icon">✓</span>
                  Action Plan
                </h3>
                <MarkdownRenderer :content="selectedTask.action_plan" />
              </div>

              <!-- Success Metrics Section -->
              <div v-if="selectedTask.success_metrics" class="mb-10">
                <h3 class="task-section-header">Success Metrics</h3>
                <MarkdownRenderer :content="selectedTask.success_metrics" />
              </div>

              <!-- Affected Units Section -->
              <div
                v-if="selectedTask.affected_units && selectedTask.affected_units.length > 0"
                class="mb-4"
              >
                <h3 class="task-section-header">
                  Affected Units ({{ selectedTask.affected_units.length }})
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="unit in selectedTask.affected_units"
                    :key="unit"
                    class="text-[13px] font-medium text-charcoal/70 bg-surface px-3 py-1.5 rounded-lg"
                  >
                    {{ unit }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Mark Complete Button -->
            <div class="px-8 py-6 border-t border-border">
              <button
                @click="handleMarkComplete"
                class="mark-complete-btn"
              >
                <span class="mark-complete-icon">✓</span>
                Mark Complete
              </button>
            </div>
          </div>
        </div>

        <!-- No Tasks Completion State -->
        <div
          v-else-if="!taskStore.isLoading && sortedTasks.length === 0"
          class="col-span-5 h-full flex items-start justify-center text-center p-12"
        >
          <div class="max-w-lg">
            <h2 class="text-[40px] md:text-[48px] font-semibold text-charcoal mb-4 leading-tight">
              Outstanding work!
            </h2>
            <p class="text-[17px] text-muted font-normal leading-relaxed">
              You've completed all your tasks. Element will notify you when new tasks are discovered
              for your fleet.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// Props from router
const props = defineProps({
  selectedTaskId: String,
})

// Router and store setup
const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

// State
const selectedTask = ref(null)
const taskListContainer = ref(null)
const taskContentContainer = ref(null)

// Get tasks from store
const tasks = computed(() => taskStore.incompleteTasks)

const sortedTasks = computed(() => {
  const priorityOrder = { High: 0, Medium: 1, Low: 2 }
  return [...tasks.value].sort((a, b) => {
    // First sort by starred status (starred tasks first)
    if (a.starred !== b.starred) {
      return b.starred - a.starred // starred (true/1) comes before unstarred (false/0)
    }
    // Then sort by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

// Scroll selected task to top of container (not viewport)
const scrollToSelectedTask = () => {
  if (!selectedTask.value || !taskListContainer.value) return

  // Find the selected task element
  const taskElements = taskListContainer.value.querySelectorAll('[data-task-id]')
  const selectedTaskElement = Array.from(taskElements).find(
    (el) => el.getAttribute('data-task-id') === selectedTask.value.id,
  )

  if (selectedTaskElement) {
    // Get the position of the task relative to the container
    const taskTop = selectedTaskElement.offsetTop

    // Custom fast scroll animation
    const currentScrollTop = taskListContainer.value.scrollTop
    const distance = taskTop - currentScrollTop
    const duration = 200 // 200ms - much faster than default smooth scroll
    const startTime = performance.now()

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      taskListContainer.value.scrollTop = currentScrollTop + distance * easeOutQuart

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }
}

// Task selection with query string support
const selectTask = (task) => {
  selectedTask.value = task
  // Update query string
  router.push({
    name: 'Tasks',
    query: { selected_task: task.id },
  })

  // Scroll to selected task after DOM update
  nextTick(() => {
    scrollToSelectedTask()
  })
}

// Handle task selection from props/query string
watch(
  () => props.selectedTaskId,
  (newTaskId) => {
    if (newTaskId && tasks.value.length > 0) {
      const task = taskStore.getTaskById(newTaskId)
      if (task) {
        selectedTask.value = task
      }
    }
  },
)

// Scroll task content to top
const scrollTaskContentToTop = () => {
  if (taskContentContainer.value) {
    taskContentContainer.value.scrollTop = 0
  }
}

// Watch for selectedTask changes and scroll task content to top
watch(
  () => selectedTask.value,
  () => {
    nextTick(() => {
      scrollTaskContentToTop()
    })
  },
)

// Initialize selected task
const initializeSelectedTask = () => {
  // Get selectedTaskId from route query or props
  const selectedTaskId = route.query.selected_task || props.selectedTaskId

  // First check if we have a selectedTaskId from route
  if (selectedTaskId) {
    const task = taskStore.getTaskById(selectedTaskId)
    if (task) {
      selectedTask.value = task
      nextTick(() => {
        scrollToSelectedTask()
      })
      return
    }
  }

  // Always auto-select first task if available (even if no route param)
  if (sortedTasks.value.length > 0) {
    selectedTask.value = sortedTasks.value[0]
    router.replace({
      name: 'Tasks',
      query: { selected_task: sortedTasks.value[0].id },
    })
    nextTick(() => {
      scrollToSelectedTask()
    })
  }
}

// Load tasks and initialize selection on mount
onMounted(async () => {
  await taskStore.load()
  initializeSelectedTask()
})

// Watch for task data changes and reinitialize if needed
watch(
  () => tasks.value.length,
  (newLength) => {
    if (newLength > 0 && !selectedTask.value) {
      initializeSelectedTask()
    }
  },
)

// Use the task store toggle method
const toggleTaskStar = async (taskId) => {
  await taskStore.toggleTaskStar(taskId)
}

const handleMarkComplete = async () => {
  if (!selectedTask.value) return

  const currentTaskIndex = sortedTasks.value.findIndex((task) => task.id === selectedTask.value.id)

  try {
    const success = await taskStore.toggleTaskCompletion(selectedTask.value.id)
    if (success) {
      await nextTick()

      if (sortedTasks.value.length > 0) {
        const nextTaskIndex = currentTaskIndex >= sortedTasks.value.length ? 0 : currentTaskIndex
        const nextTask = sortedTasks.value[nextTaskIndex]
        selectedTask.value = nextTask

        router.replace({
          name: 'Tasks',
          query: { selected_task: nextTask.id },
        })

        nextTick(() => {
          scrollToSelectedTask()
        })
      } else {
        selectedTask.value = null
        router.replace({ name: 'Tasks', query: {} })
      }
    }
  } catch (error) {
    // Silently handle - task completion failed
  }
}
</script>

<style scoped>
/* Element Brand Colors */
.text-charcoal { color: #3C3C3C; }
.text-muted { color: #A0A0A0; }
.bg-surface { background-color: #F5F5F5; }
.border-border { border-color: #E3E3E3; }

/* Task Detail Card - Premium */
.task-detail-card {
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

/* Task Section Headers */
.task-section-header {
  font-size: 13px;
  font-weight: 600;
  color: #A0A0A0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 14px;
}

.task-section-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #00D7D2 0%, #05AFDC 100%);
  border-radius: 2px;
}

.task-section-header--action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 100%);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

/* Mark Complete Button - Premium Teal */
.mark-complete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 100%);
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 215, 210, 0.3);
}

.mark-complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 215, 210, 0.4);
}

.mark-complete-btn:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.mark-complete-icon {
  font-size: 18px;
  font-weight: bold;
}

/* Task Card Items */
.task-card-item {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.task-card-unselected {
  cursor: pointer;
  opacity: 0.85;
}

.task-card-unselected:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.task-card-selected {
  cursor: default;
  pointer-events: none;
  opacity: 1;
  box-shadow:
    0 0 0 2px #00D7D2,
    0 4px 12px rgba(0, 215, 210, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.08) !important;
  transform: scale(1.02);
}

/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Scroll snap container */
.scroll-snap-container {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scroll-padding-top: 4px;
  scroll-timeline: auto;
  --scroll-duration: 0.1s;
}

/* Scroll snap items */
.scroll-snap-item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* Task content scrollbar styling */
.task-content-scrollbar {
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #E3E3E3 transparent;
}

.task-content-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 0px;
}

.task-content-scrollbar::-webkit-scrollbar:horizontal {
  display: none;
}

.task-content-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 4px;
}

.task-content-scrollbar::-webkit-scrollbar-thumb {
  background-color: #E3E3E3;
  border-radius: 3px;
}

.task-content-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #A0A0A0;
}
</style>

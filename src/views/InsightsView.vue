<template>
  <div class="min-h-screen">
    <!-- Header Section -->
    <div class="text-center relative px-6 pt-6 pb-6">
      <div class="relative max-w-5xl mx-auto">
        <h1 class="text-[48px] md:text-[56px] font-semibold text-charcoal mb-4 leading-tight tracking-tight">
          Full Fleet Analysis Report
        </h1>
        <p class="text-[17px] text-muted font-normal max-w-4xl mx-auto leading-relaxed">
          These reports are dense, and full of golden nugget insights. Each report is based on historical and that day's new data.
        </p>
      </div>
    </div>

    <!-- Content Container - Premium Card -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="insights-card">
        <div class="px-10 py-8 overflow-y-auto prose">
          <MarkdownRenderer :content="executiveSummary" />

          <!-- Render daily overview (not in priority list) -->
          <div v-if="insight?.sections?.categories?.daily_overview" class="mt-8">
            <div v-for="(jobResult, index) in insight.sections.categories.daily_overview" :key="jobResult.execution_id || index">
              <hr v-if="index > 0" class="my-6" />
              <MarkdownRenderer :content="jobResult.content" />
            </div>
          </div>

          <!-- Render category sections in priority order -->
          <div v-for="section in orderedCategorySections" :key="section.categoryKey" class="mt-8">
            <!-- Render each job result in this category -->
            <div v-for="(jobResult, index) in section.jobResults" :key="jobResult.execution_id || index">
              <hr class="my-6" />
              <MarkdownRenderer :content="jobResult.content" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useInsightsStore } from '@/stores/insights'
import { usePrioritiesStore } from '@/stores/priorities'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// Get insights content from store
const store = useInsightsStore()
const insight = computed(() => store.get())
const executiveSummary = computed(() => insight.value?.sections?.executive_summary || '')

const pStore = usePrioritiesStore()

// Get ordered priorities from the store
const orderedPriorities = computed(() => pStore.orderedPriorities)

// Get category sections ordered by user priorities
const orderedCategorySections = computed(() => {
  if (!insight.value?.sections?.categories || !orderedPriorities.value.length) {
    return []
  }

  const categories = insight.value.sections.categories
  const ordered = []

  // Iterate through user's ordered priorities
  for (const priority of orderedPriorities.value) {
    const categoryKey = priority.slug
    if (categories[categoryKey]) {
      // Each category contains an array of job results
      const jobResults = categories[categoryKey]
      ordered.push({
        categoryKey,
        categoryName: priority.name,
        jobResults
      })
    }
  }

  return ordered
})

// Load data and scroll to top when page loads
onMounted(async () => {
  await store.load()
  await pStore.loadAll('demo-user')

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  })
})
</script>

<style lang="css" scoped>
/* Element Brand Colors */
.text-charcoal { color: #3C3C3C; }
.text-muted { color: #A0A0A0; }

/* Insights Card - Premium */
.insights-card {
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.prose {
  max-width: 100%;
}
</style>

<style lang="css">
/* Global markdown styles for insights */
.insights-card .markdown-content h1 {
  font-size: 1.75em;
  font-weight: 600;
  color: #3C3C3C;
  margin-bottom: 0.75em;
}

.insights-card .markdown-content h2 {
  font-size: 1.375em;
  font-weight: 600;
  color: #3C3C3C;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid #E3E3E3;
}

.insights-card .markdown-content h3 {
  font-size: 1.125em;
  font-weight: 600;
  color: #3C3C3C;
  margin-top: 1.25em;
}

.insights-card .markdown-content p {
  font-size: 16px;
  line-height: 1.7;
  color: #3C3C3C;
}

.insights-card .markdown-content ul,
.insights-card .markdown-content ol {
  font-size: 16px;
  line-height: 1.7;
}

.insights-card .markdown-content hr {
  border: none;
  border-top: 1px solid #E3E3E3;
  margin: 2em 0;
}
</style>
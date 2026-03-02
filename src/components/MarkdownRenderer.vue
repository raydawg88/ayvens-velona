<template>
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  }
})

// Configure marked options - USE DEFAULT RENDERER
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  sanitize: false
})

const renderedMarkdown = computed(() => {
  if (!props.content) return ''

  // Ensure content is a string
  let content = props.content
  if (typeof content !== 'string') {
    console.warn('MarkdownRenderer received non-string content:', typeof content, content)
    content = String(content)
  }

  try {
    return marked.parse(content)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return `<p class="text-red-600 font-mono text-sm">Error parsing markdown: ${error.message}</p>`
  }
})
</script>

<style scoped>
.markdown-content {
  /* Base typography matching TasksView */
  font-family: 'Euclid Circular B', Arial, sans-serif;
  color: #000;
  line-height: 1.5;
}

/* Additional styles for markdown elements not covered by Tailwind */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

/* Ensure nested lists have proper spacing */
.markdown-content :deep(ul ul),
.markdown-content :deep(ol ol),
.markdown-content :deep(ul ol),
.markdown-content :deep(ol ul) {
  margin-top: 0.25rem;
  margin-bottom: 0;
  padding-left: 1.5rem;
}

/* Task list styling (GitHub-style checkboxes) */
.markdown-content :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
  accent-color: #000;
}

/* Preserve whitespace for code blocks */
.markdown-content :deep(pre) {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
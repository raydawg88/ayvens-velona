<template>
<div>
  <div>
    <!-- Welcome Hero -->
    <div class="text-center relative mb-8">
      <div class="relative max-w-4xl mx-auto">
        <h1 class="text-[32px] md:text-[40px] font-semibold text-charcoal mb-3 leading-tight tracking-tight">
          Welcome back {{ authStore.user?.first_name || 'there' }}, lets get to work.
        </h1>
        <p class="text-[15px] text-muted font-normal max-w-3xl mx-auto leading-relaxed">
          I ran my analysis last night at 12:01am across the entire fleet.
          Your insight report and top 3 tasks are ready for you.
        </p>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="home-container mb-12">
      <div
        class="flex"
        :style="{
          gap: isChatExpanded ? '0' : '24px',
          transition: isChatExpanded ? 'gap 200ms ease-out 200ms' : 'gap 200ms ease-out',
        }"
      >
        <!-- Left Column - Top Tasks -->
        <div
          :style="{
            width: isChatExpanded ? '0px' : hasVisualization ? 'calc(30% - 12px)' : 'calc(38% - 12px)',
            opacity: isChatExpanded ? '0' : '1',
            overflow: 'hidden',
            flexShrink: 0,
            transition: isChatExpanded
              ? 'opacity 200ms ease-out, width 200ms ease-out 200ms'
              : 'width 200ms ease-out, opacity 200ms ease-out 200ms',
          }"
        >
          <h2 class="section-header">Top Tasks</h2>

          <!-- Task Cards -->
          <div class="space-y-3">
            <TaskCard
              v-for="task in topTasks"
              :key="task.id"
              :task="task"
              class="cursor-pointer"
              @click="navigateToTask(task.id)"
              @toggle-star="toggleStar"
            />
          </div>

          <!-- View All Tasks Link -->
          <div class="mt-4 pt-4 border-t border-border">
            <router-link
              to="/tasks"
              class="view-all-link"
            >
              <span>View all tasks</span>
              <span class="arrow">→</span>
            </router-link>
          </div>
        </div>

        <!-- Right Column - AI Fleet Assistant -->
        <div
          class="will-change-auto flex-1"
          :style="{
            minWidth: 0,
            transition: 'width 300ms ease-out',
          }"
        >
          <h2 class="section-header">Your AI Fleet Assistant</h2>

          <!-- Chat Interface - Large Textarea -->
          <div
            class="home-card relative cursor-text will-change-auto"
            :class="{ expanded: isChatExpanded }"
            :style="{
              height: isChatExpanded ? '320px' : '320px',
              width: '100%',
              transition: isChatExpanded ? 'all 400ms ease-out' : 'opacity 300ms ease-out, border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isChatExpanded ? { visibility: 'hidden' } : {}),
            }"
            @click="handleChatClick"
          >
            <!-- Messages Display Area (always show if messages exist) -->
            <div
              v-if="messages.length > 0 && !isChatExpanded"
              class="messages-outer-container will-change-auto"
              :style="{
                height: 'calc(100% - 100px)',
                padding: '20px',
                paddingBottom: '10px',
                position: 'relative',
              }"
            >
              <!-- Chat Minimap (collapsed view) -->
              <div ref="minimapContainer" class="minimap-container will-change-auto">
                <div
                  v-for="message in messages"
                  :key="`mini-${message.id}`"
                  class="minimap-bubble"
                  :class="{
                    'minimap-bubble-user': message.type === 'user',
                    'minimap-bubble-ai': message.type === 'ai' && !message.isError,
                    'minimap-bubble-system': message.type === 'system' && !message.isError,
                    'minimap-bubble-error': message.isError,
                  }"
                  :style="{
                    width: getMinimapDimensions(message).width + 'px',
                    height: getMinimapDimensions(message).height + 'px',
                  }"
                ></div>

                <!-- Typing Indicator in Minimap -->
                <div v-if="chatStore.isTyping" class="minimap-bubble minimap-bubble-ai" style="width: 80px; height: 40px;"></div>
              </div>
            </div>

            <!-- Connection Status -->
            <div
              v-if="chatStore.isConnecting && !isChatExpanded"
              class="absolute w-full flex items-center justify-center top-4"
            >
              <p class="text-slate-500 font-mono text-xs">Connecting to Element...</p>
            </div>

            <!-- Instruction Text (only when no messages and collapsed) -->
            <div
              v-if="messages.length === 0 && !isChatExpanded"
              class="absolute w-full flex items-center justify-center"
              :style="{
                top: '20px',
                bottom: '130px',
                left: '0',
                right: '0',
                padding: '20px',
              }"
            >
              <p
                class="text-center"
                :style="{
                  fontFamily: `'Euclid Circular B', Arial, sans-serif`,
                  fontSize: '16px',
                  fontWeight: 'normal',
                  lineHeight: '1.5',
                  color: '#9ca3af',
                }"
              >
                If you have questions about any analysis, tasks, or your fleet...
              </p>
            </div>

            <!-- Divider Line -->
            <div
              v-if="!isChatExpanded"
              class="absolute border-t border-gray-200 mx-5 will-change-auto"
              :style="{
                bottom: '104px',
                left: '0',
                right: '0',
              }"
            ></div>

            <!-- Send/Stop Button -->
            <button
              v-if="!isChatExpanded && !chatStore.isTyping"
              @click="handleSendMessage"
              class="absolute bottom-5 right-5 send-btn"
            >
              <ArrowUpIcon class="w-4 h-4 text-white" />
            </button>

            <!-- Stop Streaming Button -->
            <button
              v-if="!isChatExpanded && chatStore.isTyping"
              @click="chatStore.stopStreaming()"
              class="absolute bottom-5 right-5 stop-btn"
              title="Stop streaming"
            >
              <StopIcon class="w-4 h-4 text-white" />
            </button>

            <!-- Large Textarea -->
            <textarea
              v-if="!isChatExpanded"
              ref="chatTextarea"
              v-model="chatMessage"
              @keydown.enter="handleKeyDown"
              @focus="handleTextareaFocus"
              placeholder="Type your message here."
              class="absolute w-full resize-none border-0 bg-transparent focus:outline-none px-8 will-change-auto"
              :style="{
                bottom: '50px',
                height: '50px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontFamily: `'Euclid Circular B', Arial, sans-serif`,
                fontSize: '16px',
                fontWeight: 'normal',
                lineHeight: '1.5',
                color: '#374151',
              }"
            ></textarea>
          </div>

          <!-- Examples Text -->
          <div
            class="mt-5 mb-3 will-change-auto text-[12px] font-medium text-muted uppercase tracking-wide"
            :style="{
              opacity: isChatExpanded ? '0' : '1',
              transform: isChatExpanded ? 'translateY(10px)' : 'translateY(0)',
              pointerEvents: isChatExpanded ? 'none' : 'auto',
              transition: isChatExpanded
                ? 'opacity 200ms ease-out, transform 200ms ease-out'
                : 'opacity 200ms ease-out 400ms, transform 200ms ease-out 400ms',
            }"
          >
            Try asking Element
          </div>

          <!-- Suggestion Pills - Outside the card -->
          <div
            class="flex flex-wrap gap-2 will-change-auto"
            :style="{
              opacity: isChatExpanded ? '0' : '1',
              transform: isChatExpanded ? 'translateY(10px)' : 'translateY(0)',
              pointerEvents: isChatExpanded ? 'none' : 'auto',
              transition: isChatExpanded
                ? 'opacity 200ms ease-out, transform 200ms ease-out'
                : 'opacity 200ms ease-out 400ms, transform 200ms ease-out 400ms',
            }"
          >
            <button
              @click="handlePillClick('Create a Fuel Usage Report')"
              class="suggestion-pill"
            >
              Create a Fuel Usage Report
            </button>
            <button
              @click="handlePillClick('Find suggested upcoming maintenance for my fleet')"
              class="suggestion-pill"
            >
              Suggested maintenance
            </button>
            <button
              @click="handlePillClick('What is the current state of my fleet?')"
              class="suggestion-pill"
            >
              Fleet health
            </button>
            <button
              @click="handlePillClick('What is my riskiest vehicle?')"
              class="suggestion-pill"
            >
              Riskiest Vehicle
            </button>
            <button
              @click="handlePillClick('Show my most recent 500 trips on a map')"
              class="suggestion-pill"
            >
              Dots on a map
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Fleet Insights Report Section -->
    <div class="home-container">
      <div class="insights-banner">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[18px] font-semibold mb-1 text-white">Full Fleet Insights Report</h2>
            <p class="text-[13px] text-white/85">
              Deep analysis of your fleet, drivers, vehicles, and opportunities.
            </p>
          </div>
          <button @click="navigateToInsights" class="insights-btn">
            View Report
            <span class="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen Chat Overlay -->
  <Teleport to="body">
    <Transition name="chat-expand" @enter="onChatExpand" @leave="onChatCollapse">
      <div
        v-if="isChatExpanded"
        ref="fullscreenOverlay"
        class="fullscreen-chat-overlay"
        :style="{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '100000',
          padding: '2rem',
        }"
      >
        <!-- Chat Card Content -->
        <div class="home-card home-card-expanded h-[calc(100vh-4rem)] relative">
          <!-- Messages Display Area -->
          <div
            v-if="messages.length > 0"
            class="messages-outer-container will-change-auto"
            :style="{
              height: 'calc(100% - 100px)',
              padding: '20px',
              paddingBottom: '10px',
              position: 'relative',
            }"
          >
            <div ref="messagesContainer" class="messages-container will-change-auto">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-wrapper"
                :class="{
                  'message-user message-slide-in-right': message.type === 'user',
                  'message-ai message-slide-in-left': message.type === 'ai',
                }"
              >
                <!-- AI Message -->
                <div
                  v-if="message.type === 'ai'"
                  class="ai-message"
                  :class="{
                    'has-viz-message': message.metadata?.visualizationType || message.metadata?.type === 'map'
                  }"
                >
                  <div class="ai-label">Element</div>
                  <div
                    class="ai-bubble"
                    :class="{
                      'error-message': message.isError,
                      'has-visualization': message.metadata?.visualizationType || message.metadata?.type === 'map'
                    }"
                  >
                    <!-- Visualization Renderer for LLM tool results (get_map_polylines, get_map_plots) -->
                    <VisualizationRenderer
                      v-if="message.metadata?.visualizationType"
                      :visualizationData="message.metadata"
                      :text="message.text"
                    />

                    <!-- Map Renderer for simple map type messages -->
                    <MapRenderer
                      v-else-if="message.metadata?.type === 'map'"
                      :mapData="message.metadata.mapData"
                      :text="message.text"
                    />

                    <!-- Regular markdown for normal messages -->
                    <div v-else class="markdown-content prose table-auto  prose-th:font-bold" v-html="renderMarkdown(message.text)"></div>

                    <div v-if="message.hasDownload" class="download-link">
                      {{ message.downloadText }}
                    </div>
                  </div>
                </div>

                <!-- System Error Message -->
                <div v-else-if="message.type === 'system'" class="ai-message">
                  <div class="ai-label">System</div>
                  <div class="ai-bubble error-message">
                    <div class="markdown-content" v-html="renderMarkdown(message.text)"></div>
                  </div>
                </div>

                <!-- User Message -->
                <div v-else class="user-message">
                  <div class="user-label">
                    {{ authStore.user?.first_name || authStore.user?.email || 'User' }}
                  </div>
                  <div class="user-bubble">
                    <div class="markdown-content" v-html="renderMarkdown(message.text)"></div>
                  </div>
                </div>
              </div>

              <!-- Typing Indicator - appears as next AI message -->
              <div v-if="chatStore.isTyping" class="message-wrapper message-ai message-slide-in-left">
                <div class="ai-message">
                  <div class="ai-label">Element</div>
                  <div class="bg-surface rounded-2xl rounded-bl-md px-6 py-3 flex items-center space-x-3" style="display: inline-flex;">
                    <div class="flex space-x-1.5">
                      <div class="w-2 h-2 bg-muted rounded-full loading-dot"></div>
                      <div class="w-2 h-2 bg-muted rounded-full loading-dot"></div>
                      <div class="w-2 h-2 bg-muted rounded-full loading-dot"></div>
                    </div>
                    <p class="text-charcoal text-[13px] font-medium">
                      {{ chatStore.statusMessage || 'Element thinking...' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Instruction Text (when no messages) -->
          <div
            v-if="messages.length === 0"
            class="absolute w-full flex items-center justify-center"
            :style="{
              top: '60px',
              bottom: '200px',
              left: '0',
              right: '0',
              padding: '40px',
            }"
          >
            <p
              class="text-center"
              :style="{
                fontFamily: `'Euclid Circular B', Arial, sans-serif`,
                fontSize: '16px',
                fontWeight: 'normal',
                lineHeight: '1.5',
                color: '#9ca3af',
              }"
            >
              If you have questions about any analysis, tasks, or your fleet...
            </p>
          </div>

          <!-- Connection Status -->
          <div
            v-if="chatStore.isConnecting"
            class="absolute w-full flex items-center justify-center top-4"
          >
            <p class="text-slate-500 font-mono text-xs">Connecting to Element...</p>
          </div>

          <!-- Divider Line -->
          <div
            class="absolute border-t border-gray-200 mx-5 will-change-auto"
            :style="{
              bottom: '104px',
              left: '0',
              right: '0',
            }"
          ></div>

          <!-- Send/Stop Button -->
          <button
            v-if="!chatStore.isTyping"
            @click="handleSendMessage"
            class="absolute bottom-5 right-5 send-btn"
          >
            <ArrowUpIcon class="w-4 h-4 text-white" />
          </button>

          <!-- Stop Streaming Button -->
          <button
            v-else
            @click="chatStore.stopStreaming()"
            class="absolute bottom-5 right-5 stop-btn"
            title="Stop streaming"
          >
            <StopIcon class="w-4 h-4 text-white" />
          </button>

          <!-- Large Textarea -->
          <textarea
            ref="chatTextareaFullscreen"
            v-model="chatMessage"
            @keydown.enter="handleKeyDown"
            placeholder="Type your message here."
            class="absolute w-full resize-none border-0 bg-transparent focus:outline-none px-8 will-change-auto"
            :style="{
              bottom: '30px',
              height: '70px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontFamily: `'Euclid Circular B', Arial, sans-serif`,
              fontSize: '18px',
              fontWeight: 'normal',
              lineHeight: '1.5',
              color: '#374151',
            }"
          ></textarea>
        </div>
      </div>
    </Transition>
  </Teleport>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUpIcon, StopIcon } from '@heroicons/vue/24/outline'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import { marked } from 'marked'

// Lazy load heavy components (maps, charts)
const MapRenderer = defineAsyncComponent(() => import('@/components/MapRenderer.vue'))
const VisualizationRenderer = defineAsyncComponent(() => import('@/components/VisualizationRenderer.vue'))

// Initialize stores
const chatStore = useChatStore()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const router = useRouter()

// Task data from store
const topTasks = computed(() => taskStore.topTasksByPriority)

// Navigation to tasks page with selected task
const navigateToTask = (taskId) => {
  router.push({
    name: 'Tasks',
    query: { selected_task: taskId },
  })
}

// Navigation to insights page
const navigateToInsights = () => {
  router.push({ name: 'Insights' })
}

// Data is loaded by router before component renders
// No need for onMounted data fetching

// Enhanced markdown rendering with Web Worker support
const renderedMarkdown = ref(new Map()) // Cache rendered markdown

const renderMarkdown = (content) => {
  if (!content || typeof content !== 'string') return content || ''

  // Check if we have cached result
  if (renderedMarkdown.value.has(content)) {
    return renderedMarkdown.value.get(content)
  }

  // Return immediate fallback (original content or simple processing)
  try {
    // Simple fallback rendering for immediate display
    const result = marked.parse(content, {
      breaks: true,
      gfm: true,
      headerIds: false,
      sanitize: false,
    })

    // Cache the result
    renderedMarkdown.value.set(content, result)
    return result
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return content
  }
}

// Chat input state
const chatMessage = ref('')
const isChatExpanded = ref(false)
const hasUserSentMessage = ref(false)

// Check if current messages contain visualizations
const hasVisualization = computed(() => {
  return messages.value.some(
    (msg) => msg.metadata?.visualizationType || msg.metadata?.type === 'map'
  )
})

// Message state management
const messagesContainer = ref(null)
const minimapContainer = ref(null)
const chatTextarea = ref(null)
const chatTextareaFullscreen = ref(null)
const fullscreenOverlay = ref(null)

// User scroll detection to prevent auto-scroll fighting
const userIsScrolling = ref(false)
let scrollTimeout = null

// Removed PerfectScrollbar instances for better performance

// Use chat store messages
const messages = computed(() => {
  return chatStore.currentMessages.map((msg) => ({
    id: msg.id,
    type: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'ai',
    text: msg.content,
    timestamp: msg.timestamp,
    hasDownload: msg.metadata?.hasDownload || false,
    downloadText: msg.metadata?.downloadText || '',
    isError: msg.isError || false,
    metadata: msg.metadata || {}, // Pass through all metadata
  }))
})

// Calculate minimap bubble heights based on message content length
const getMinimapDimensions = (message) => {
  const textLength = message.text?.length || 0

  // Dynamic height based on actual character count ranges
  let height
  if (textLength <= 50) {
    height = 18 + (textLength - 20) * 0.4 // 18-30px for short
  } else if (textLength <= 100) {
    height = 30 + (textLength - 50) * 0.3 // 30-45px for medium
  } else if (textLength <= 200) {
    height = 45 + (textLength - 100) * 0.2 // 45-65px for long
  } else if (textLength <= 400) {
    height = 65 + (textLength - 250) * 0.1 // 65+ for very long
  } else if (textLength <= 600) {
    height = 85 + (textLength - 300) * 0.1
  } else {
    height = 100 + (textLength - 400) * 0.1
  }

  // Dynamic width based on character count ranges
  let width
  if (textLength <= 20) {
    width = 40 + textLength * 1.5
  } else if (textLength <= 40) {
    width = 80 + textLength * 1.5 // 80-125px for short
  } else if (textLength <= 80) {
    width = 125 + (textLength - 30) * 1.0 // 125-175px for medium
  } else if (textLength <= 150) {
    width = 175 + (textLength - 80) * 0.7 // 175-224px for long
  } else {
    width = 224 + (textLength - 150) * 0.3 // 224+ for very long
  }

  // Apply min/max limits appropriate for minimap preview
  const maxWidth = 224 // Maximum width for readability in minimap
  const maxHeight = 200 // Maximum height to keep bubbles compact but readable
  const minWidth = 40
  const minHeight = 18 // Minimum height for visual consistency

  return {
    width: Math.max(minWidth, Math.min(width, maxWidth)),
    height: Math.max(minHeight, Math.min(height, maxHeight)),
  }
}

// Watch for message changes to update scrollbar
const updateMessagesScrollbar = () => {
  nextTick(() => {
    if (isChatExpanded.value) {
      // Use smart scrolling for new messages
      scrollToNewMessage()
    } else {
      // Scroll minimap to bottom
      scrollMinimapToBottom()
    }
  })
}

// Watch messages for scrollbar updates
watch(
  messages,
  () => {
    updateMessagesScrollbar()
  },
  { deep: true },
)

// Watch for chat expansion to handle scrollbar
watch(isChatExpanded, (isExpanded) => {
  if (isExpanded) {
    // When expanding, destroy minimap scrollbar immediately

    // Scroll to most recent message when chat expands
    setTimeout(() => {
      nextTick(() => {
        scrollToNewMessage()
      })
    }, 250)
  } else {
    // When collapsing, scroll minimap to bottom
    nextTick(() => {
      scrollMinimapToBottom()
    })
  }
})

// Smart scrolling functions
const scrollToNewMessage = () => {
  // Don't auto-scroll if user is manually scrolling
  if (userIsScrolling.value) {
    return
  }

  if (messagesContainer.value) {
    requestAnimationFrame(() => {
      const container = messagesContainer.value
      const lastMessage = container.lastElementChild

      if (lastMessage) {
        // Check if user is near the bottom (within 150px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150

        // Only auto-scroll if user is near the bottom
        if (!isNearBottom) {
          return
        }

        // Check if the new message is larger than the visible area
        const containerHeight = container.clientHeight
        const messageHeight = lastMessage.offsetHeight

        if (messageHeight > containerHeight * 0.8) {
          // If message is large, scroll to the start of the message
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          // If message is small, scroll to bottom as usual
          container.scrollTop = container.scrollHeight
        }
      } else {
        // Fallback to bottom scroll
        container.scrollTop = container.scrollHeight
      }
    })
  }
}

// Handle user scroll events
const handleUserScroll = () => {
  userIsScrolling.value = true

  // Clear existing timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // Reset after 1 second of no scrolling
  scrollTimeout = setTimeout(() => {
    userIsScrolling.value = false
  }, 1000)
}

const scrollMinimapToBottom = () => {
  if (minimapContainer.value) {
    requestAnimationFrame(() => {
      minimapContainer.value.scrollTop = minimapContainer.value.scrollHeight
    })
  }
}

// Empty functions for compatibility (no longer needed)
const destroyScrollbar = () => {}

const toggleStar = async (taskId) => {
  await taskStore.toggleTaskStar(taskId)
}

// Animation functions for chat expand/collapse
const onChatExpand = (el) => {
  // Get the position and size of the original chat card
  const originalCard = document.querySelector('.home-card')
  if (originalCard) {
    const rect = originalCard.getBoundingClientRect()

    // Set initial transform to match the original card position and size
    el.style.transformOrigin = 'top left'
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${rect.width / window.innerWidth}, ${rect.height / window.innerHeight})`
    el.style.transition = 'none'

    // Force a reflow
    el.offsetHeight

    // Animate to fullscreen
    el.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.transform = 'translate(0px, 0px) scale(1, 1)'
  }
}

const onChatCollapse = (el) => {
  // Get the position and size of the original chat card
  const originalCard = document.querySelector('.home-card')
  if (originalCard) {
    const rect = originalCard.getBoundingClientRect()

    // Animate to original card position and size
    el.style.transformOrigin = 'top left'
    el.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out'
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${rect.width / window.innerWidth}, ${rect.height / window.innerHeight})`
    el.style.opacity = '0'
  }
}

const headerTransform = ref('translateX(0)')

const handleTextareaFocus = () => {
  if (!isChatExpanded.value) {
    // Calculate distance to move header LEFT to viewport center
    const viewportCenter = window.innerWidth / 2
    const headerElement = document.querySelector('h2.text-2xl')
    if (headerElement) {
      const headerRect = headerElement.getBoundingClientRect()
      // Calculate how far left the header needs to move to center itself
      const headerLeft = headerRect.left
      const headerWidth = headerRect.width
      const targetLeft = viewportCenter - headerWidth / 2
      const distanceToMove = targetLeft - headerLeft
      headerTransform.value = `translateX(${distanceToMove}px)`
    }

    // Force layout calculation and use double RAF for smooth animation
    requestAnimationFrame(() => {
      // Force reflow by reading layout property
      document.body.offsetHeight
      requestAnimationFrame(() => {
        isChatExpanded.value = true
        // Focus the fullscreen textarea after expansion
        nextTick(() => {
          setTimeout(() => {
            if (chatTextareaFullscreen.value) {
              chatTextareaFullscreen.value.focus()
            }
          }, 400) // Wait for the 400ms expansion animation to complete
        })
      })
    })
  }
}

const handleKeyDown = (event) => {
  // If Shift+Enter, allow default behavior (new line)
  if (event.shiftKey && event.key === 'Enter') {
    return
  }

  // If just Enter (without Shift), prevent default and send message
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSendMessage()
  }
}

const handleSendMessage = async () => {
  if (chatMessage.value.trim()) {
    // Expand chat interface if not already expanded
    if (!isChatExpanded.value) {
      handleTextareaFocus()
    }

    const messageText = chatMessage.value

    // Send message through chat store
    const success = await chatStore.sendChatMessage(messageText)

    if (success) {
      // Mark that user has sent a message
      if (!hasUserSentMessage.value) {
        hasUserSentMessage.value = true
      }

      // Clear input
      chatMessage.value = ''

      // Force scroll to bottom when user sends a message
      // Reset user scrolling flag to allow auto-scroll
      userIsScrolling.value = false

      // Scroll to bottom after a brief delay to ensure DOM updates
      nextTick(() => {
        if (messagesContainer.value) {
          requestAnimationFrame(() => {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
          })
        }
        scrollMinimapToBottom()
      })

      // Update scrollbar
      updateMessagesScrollbar()
    }
  }
}

const collapseChat = () => {
  isChatExpanded.value = false
  headerTransform.value = 'translateX(0)'
}

const handlePillClick = (pillText) => {
  chatMessage.value = pillText
}

const handleChatClick = (event) => {
  // Don't interfere if clicking buttons or other interactive elements
  if (event.target.closest('button') || event.target.closest('.ps__rail-y')) {
    return
  }

  // Focus the textarea, which will trigger the expansion animation
  if (chatTextarea.value) {
    chatTextarea.value.focus()
  }
}

// Handle ESC key to collapse chat
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isChatExpanded.value) {
    collapseChat()
  }
}

// Handle click outside to collapse chat
const handleClickOutside = (event) => {
  if (isChatExpanded.value) {
    const chatContainer = event.target.closest('.home-card')
    if (!chatContainer) {
      collapseChat()
    }
  }
}

onMounted(async () => {
  // Load data for demo mode
  await taskStore.load()
  await chatStore.load()

  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)

  // Add scroll listener to messages container when it's available
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.addEventListener('scroll', handleUserScroll)
    }
  })
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)

  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleUserScroll)
  }

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  destroyScrollbar()
})
</script>

<style scoped>
/* Fade out animations for tasks */
.fade-tasks-enter-active,
.fade-tasks-leave-active {
  transition: all 200ms ease-out;
}

.fade-tasks-enter-from,
.fade-tasks-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Fade out animations for pills */
.fade-pills-enter-active,
.fade-pills-leave-active {
  transition: all 150ms ease-out;
  transition-delay: 50ms;
}

.fade-pills-enter-from,
.fade-pills-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Center header animation */
.center-header-enter-active,
.center-header-leave-active {
  transition: all 300ms ease-out;
  transition-delay: 100ms;
}

.center-header-enter-from,
.center-header-leave-to {
  opacity: 0;
}

/* Chat Messages Styling */
.messages-outer-container {
  position: relative;
}

.messages-container {
  /* Native scrolling with custom scrollbar styling */
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #000 transparent;
  height: 100%;
  width: 100%;
  position: relative;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
  height: 0px; /* Hide horizontal scrollbar */
}

.messages-container::-webkit-scrollbar:horizontal {
  display: none; /* Completely hide horizontal scrollbar */
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #000;
  border-radius: 3px;
}

.messages-container.messages-hidden {
  overflow: hidden !important; /* Force hidden when collapsed for minimap */
}

.messages-hidden {
  opacity: 0;
  pointer-events: none;
}

.message-wrapper {
  margin-bottom: 16px;
}

/* AI Message (Left-aligned) */
.message-ai {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ai-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
  margin-left: 12px;
}

.ai-bubble {
  background: #F5F5F5;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  padding: 16px 24px 8px 24px;
  max-width: 75%;
  display: inline-block;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.ai-message .ai-bubble:has(table) {
  max-width: 95%;
  display: block;
}

/* Also target the markdown content wrapper */
.ai-bubble .markdown-content:has(table) {
  width: 100%;
}

/* Wider bubble for visualizations (maps, charts, etc.) */
.ai-bubble.has-visualization {
  max-width: none;
  width: 100%;
  display: block;
}

/* Make visualization message break out of column constraints */
.ai-message.has-viz-message {
  width: 80vw;
  margin-left: calc(-40vw + 50%);
  max-width: 80vw;
}

.ai-bubble.has-visualization .map-container {
  width: 100%;
}

.download-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 8px;
  font-size: 13px;
}

.download-link:hover {
  color: #2563eb;
}

/* User Message (Right-aligned) */
.message-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
}

.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.user-bubble {
  background: #00D7D2;
  color: white;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  padding: 16px 24px 8px 24px;
  max-width: 75%;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* User bubble code styling - white text on teal background */
.user-bubble .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
}

/* User bubble code blocks - teal theme */
.user-bubble .markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
  margin-left: -8px;
  margin-right: -8px;
}

.user-bubble .markdown-content :deep(pre code) {
  color: white !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
  font-size: 14px !important;
}

/* User bubble code block scrollbar - teal theme */
.user-bubble .markdown-content :deep(pre)::-webkit-scrollbar {
  height: 8px;
}

.user-bubble .markdown-content :deep(pre)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.user-bubble .markdown-content :deep(pre)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.user-bubble .markdown-content :deep(pre)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.user-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
  text-align: right;
  width: 100%;
  padding-right: 12px;
}

/* Perfect Scrollbar Custom Styling */
.messages-container .ps__rail-y {
  width: 4px !important;
  background-color: transparent !important;
  right: 2px !important;
  top: 2px !important;
  bottom: 24px !important;
  border-radius: 2px !important;
}

.messages-container .ps__thumb-y {
  background-color: #000000 !important;
  border-radius: 2px !important;
  width: 4px !important;
  opacity: 1 !important;
  right: 0 !important;
}

.messages-container .ps__rail-y:hover .ps__thumb-y,
.messages-container .ps__rail-y:focus .ps__thumb-y,
.messages-container .ps__rail-y.ps--clicking .ps__thumb-y {
  background-color: #000000 !important;
  opacity: 1 !important;
}

.messages-container .ps__rail-y:hover {
  background-color: rgba(0, 0, 0, 0.03) !important;
  border-radius: 2px !important;
}

/* Error Message Styling */
.error-message {
  background-color: #fee2e2 !important;
  border-color: #fecaca !important;
  color: #dc2626 !important;
}

/* Custom loading dots animation */
@keyframes bounce-gentle {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-dot {
  animation: bounce-gentle 1.5s infinite ease-in-out;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}
.loading-dot:nth-child(3) {
  animation-delay: 0s;
}

/* Message slide-in animations */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-slide-in-right {
  animation: slideInFromRight 0.4s ease-out;
  --original-duration: 0.4s;
}

.message-slide-in-left {
  animation: slideInFromLeft 0.4s ease-out;
  --original-duration: 0.4s;
}

/* Performance optimization: Pause animations when not visible */
.animation-paused {
  animation-play-state: paused !important;
  transition-duration: 0s !important;
}

.animation-running {
  animation-play-state: running !important;
  transition-duration: var(--original-duration, 0.3s) !important;
}

/* Chat Minimap Styles */
.minimap-container {
  position: absolute;
  top: 16px;
  left: 4px;
  right: 4px;
  bottom: 12px;
  overflow-x: hidden; /* Prevent horizontal scrollbar */
  overflow-y: scroll; /* Always show scrollbar space to prevent shifting */
  scroll-behavior: smooth;
  scrollbar-width: none; /* Hide Firefox scrollbar */
  padding: 12px 16px 12px 16px;
  display: block;
  box-sizing: border-box;
}

/* Completely hide webkit scrollbar */
.minimap-container::-webkit-scrollbar {
  width: 0px;
  height: 0px;
  background: transparent;
}

.minimap-container::-webkit-scrollbar-track {
  background: transparent;
}

.minimap-container::-webkit-scrollbar-thumb {
  background: transparent;
}

.minimap-bubble {
  border-radius: 16px;
  opacity: 0.8;
  margin-bottom: 2px;
  display: block;
}

.minimap-bubble-user {
  background: #00D7D2;
  margin-left: auto;
  margin-right: 0;
  border: 1px solid #05AFDC;
}

.minimap-bubble-ai {
  background: #F5F5F5;
  margin-left: 0;
  margin-right: auto;
  border: 1px solid #E3E3E3;
}

.minimap-bubble-system {
  background: #f3f4f6;
  margin: 0 auto;
  opacity: 0.6;
  border: 1px solid #9ca3af;
  border-radius: 16px;
}

.minimap-bubble-error {
  background: #fee2e2;
  margin-left: 0;
  margin-right: auto;
  opacity: 0.6;
  border: 1px solid #dc2626;
  border-radius: 16px;
}

.minimap-more-indicator {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.7;
}

/* Removed old PerfectScrollbar styles */

/* TasksView-inspired Markdown Styling */
.markdown-content {
  font-family: 'Euclid Circular B', Arial, sans-serif;
  color: #000000;
  line-height: 1.5;
  font-size: 0.9755rem;
  font-weight: 400;
}

.markdown-content :deep(p) {
  color: #000000;
  margin-bottom: 0.75rem;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  line-height: 1.625;
}

.markdown-content :deep(h1) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #000000;
  line-height: 1.25;
  margin-bottom: 0.75rem;
  margin-top: 1rem;
  font-family: 'Euclid Circular B', Arial, sans-serif;
}

.markdown-content :deep(h2) {
  font-size: 1.125rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
  margin-top: 0.75rem;
  font-family: 'Euclid Circular B', Arial, sans-serif;
}

.markdown-content :deep(h3) {
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
  margin-top: 0.75rem;
  font-family: 'Euclid Circular B', Arial, sans-serif;
}

.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 0.875rem;
  font-weight: 700;
  color: #000000;
  line-height: 1.25;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  font-family: 'Euclid Circular B', Arial, sans-serif;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 0.75rem;
}

.markdown-content :deep(li) {
  display: block;
  margin-bottom: 0.25rem;
  padding-left: 1rem;
  text-indent: -1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
}

.markdown-content :deep(li::before) {
  content: '• ';
  color: #000000;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-weight: 500;
}

.markdown-content :deep(li > *) {
  font-family: 'Euclid Circular B', Arial, sans-serif;
  color: #000000;
  line-height: 1.5;
  display: inline;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  color: #000000;
}

.markdown-content :deep(em) {
  font-style: italic;
}

/* Inline code */
.markdown-content :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 85%;
  color: #24292e;
  border: 1px solid rgba(27, 31, 35, 0.1);
}

/* Code blocks */
.markdown-content :deep(pre) {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.45;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border: none;
  color: #d4d4d4;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  display: block;
  white-space: pre;
}

/* Scrollbar styling for code blocks */
.markdown-content :deep(pre)::-webkit-scrollbar {
  height: 8px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

/* Table styling */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.875em;
  table-layout: auto;
}

/* Desktop: minimum width for tables */
@media (min-width: 768px) {
  .markdown-content :deep(table) {
    min-width: 600px;
  }
}

/* Table wrapper for horizontal scroll if needed */
.markdown-content:has(table) {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Mobile: smaller font and padding */
@media (max-width: 767px) {
  .markdown-content :deep(table) {
    font-size: 0.75em;
  }

  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: 6px 8px;
  }

  .ai-message .ai-bubble:has(table) {
    max-width: 98%;
  }
}

.markdown-content :deep(th) {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 600;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(td) {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Fullscreen Chat Styles */
.fullscreen-chat {
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: white;
  z-index: 99999 !important;
}

/* Chat Expand Animation */
.chat-expand-enter-active,
.chat-expand-leave-active {
  transition:
    transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms ease;
}

.chat-expand-enter-from {
  opacity: 1;
}

.chat-expand-leave-to {
  opacity: 0;
}

/* Suggestion Pills - Premium Element style */
.suggestion-pill {
  padding: 0.625rem 1.25rem;
  font-size: 13px;
  font-weight: 500;
  color: #00D7D2;
  background: rgba(0, 215, 210, 0.08);
  border-radius: 9999px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(0, 215, 210, 0.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.suggestion-pill:hover {
  background: rgba(0, 215, 210, 0.15);
  border-color: rgba(0, 215, 210, 0.3);
  color: #05AFDC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 215, 210, 0.15);
}

.suggestion-pill:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* Fleet Insights Banner - Premium */
.insights-banner {
  position: relative;
  padding: 1.5rem 1.75rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 50%, #00D7D2 100%);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  box-shadow:
    0 4px 12px rgba(0, 215, 210, 0.25),
    0 8px 24px rgba(5, 175, 220, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.insights-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.insights-banner:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 215, 210, 0.3),
    0 16px 40px rgba(5, 175, 220, 0.2);
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.insights-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 13px;
  font-weight: 600;
  color: #00D7D2;
  background: white;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.insights-btn:hover {
  background: #f8fffe;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.insights-btn:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* View All Link - Premium (Blue for CTAs/links per Element brand) */
.view-all-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: #05AFDC;
  text-decoration: none;
  transition: all 0.2s ease;
}

.view-all-link:hover {
  color: #00D7D2;
}

.view-all-link .arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(5, 175, 220, 0.1);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-all-link:hover .arrow {
  background: rgba(5, 175, 220, 0.2);
  transform: translateX(3px);
}

/* Section Headers - Premium */
.section-header {
  font-size: 11px;
  font-weight: 600;
  color: #A0A0A0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 12px;
}

.section-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #00D7D2 0%, #05AFDC 100%);
  border-radius: 2px;
}

/* Send Button - Premium */
.send-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.send-btn:hover {
  background: linear-gradient(135deg, #00D7D2 0%, #05AFDC 100%);
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 215, 210, 0.3);
}

.send-btn:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* Stop Button - Premium */
.stop-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
}

.stop-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.35);
}

.stop-btn:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* Element Brand Color Utilities */
.text-charcoal {
  color: #3C3C3C;
}

.text-muted {
  color: #A0A0A0;
}

.text-teal {
  color: #00D7D2;
}

.text-teal-dark {
  color: #05AFDC;
}

.bg-surface {
  background-color: #F5F5F5;
}

.bg-muted {
  background-color: #A0A0A0;
}

/* Primary Button - Element style (Blue for CTAs) */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  font-size: 15px;
  font-weight: 500;
  color: white;
  background: #05AFDC;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(5, 175, 220, 0.25);
}

.btn-primary:hover {
  background: #00D7D2;
  box-shadow: 0 4px 16px rgba(5, 175, 220, 0.35);
  transform: translateY(-1px);
}
</style>

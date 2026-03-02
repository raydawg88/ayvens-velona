import { defineStore } from 'pinia'

// Demo responses for Element Fleet AI showcase
const DEMO_RESPONSES = [
  {
    trigger: ['hello', 'hi', 'hey'],
    response: `Hello! I'm your Element Fleet AI assistant. I can help you with:

- **Fleet status** - Check vehicle availability and utilization
- **Maintenance** - View upcoming service needs and alerts
- **Driver performance** - Review safety scores and coaching opportunities
- **Cost analysis** - Understand your cost per mile breakdown
- **Route optimization** - Find efficiency improvements

What would you like to explore today?`,
  },
  {
    trigger: ['fuel', 'cost', 'efficiency', 'mpg'],
    response: `## Fuel & Cost Analysis

Based on yesterday's data:

| Metric | Value | vs Target |
|--------|-------|-----------|
| **Cost per Mile** | $0.58 | +$0.06 ⚠️ |
| **Fleet Avg MPG** | 7.8 | On target ✓ |
| **Total Fuel Spend** | $42,318 | +11% |

### Key Finding
Tuesday/Thursday routes are costing 18% more due to older trucks (5.2 MPG vs 7.8 fleet average).

**Recommendation:** Replacing 8 oldest trucks would save **$4,200/month** in fuel costs.

Would you like me to identify which specific vehicles to prioritize?`,
  },
  {
    trigger: ['maintenance', 'service', 'repair', 'brake'],
    response: `## Maintenance Overview

### Vehicles Requiring Attention

| Urgency | Count | Action Window |
|---------|-------|---------------|
| 🔴 **Critical** | 12 | Today |
| 🟠 **High** | 24 | This week |
| 🟡 **Medium** | 38 | Next 7 days |

### AI Prediction Alert
**Unit #782** has an **87% probability** of transmission failure based on sensor patterns matching 3 previous failures.

- Preventive repair today: **$4,500**
- If it fails on road: **$8,500 + 3 extra days downtime**

Should I schedule this repair and show you the other high-priority items?`,
  },
  {
    trigger: ['driver', 'safety', 'score', 'training'],
    response: `## Driver Safety Analysis

### Fleet Safety Score: 87/100 (↓3 from last week)

### Pattern Detected
**73% of crashes** occur during **2-6 PM** with drivers who have **<6 months experience**.

### Top Performers Yesterday
| Rank | Driver | Score | Miles |
|------|--------|-------|-------|
| 🥇 | Maria Rodriguez | 98 | 342 |
| 🥈 | James Wilson | 96 | 487 |
| 🥉 | Sarah Chen | 95 | 218 |

### Coaching Opportunity
3 drivers showing hard braking patterns could save **$940/month** in maintenance with targeted training.

Would you like me to generate a coaching schedule?`,
  },
  {
    trigger: ['vehicle', 'fleet', 'status', 'utilization'],
    response: `## Fleet Status Overview

**Total Fleet:** 1,250 vehicles

| Status | Count | % |
|--------|-------|---|
| 🟢 Active | 1,147 | 92% |
| 🟡 In Shop | 92 | 7% |
| 🔴 Out of Service | 11 | 1% |

### Utilization by Type
| Type | Utilization |
|------|-------------|
| Long-haul Trucks | 95% |
| Box Trucks | 82% |
| Delivery Vans | 71% |
| Service Vehicles | 62% |

### Opportunity Found
**87 delivery vans** sat idle yesterday costing **$30,189** in lease/insurance/depreciation.

Redistributing to high-demand areas could capture **$558,000 additional annual revenue**.`,
  },
  {
    trigger: ['help', 'what can you do', 'capabilities'],
    response: `## Element Fleet AI Capabilities

I analyze your fleet data in real-time to provide actionable insights:

### 📊 Analytics
- Cost per mile breakdowns
- Fuel efficiency trends
- Utilization patterns

### 🔧 Maintenance
- Predictive failure alerts
- Service scheduling optimization
- Shop performance rankings

### 🛡️ Safety
- Driver behavior scoring
- Crash pattern analysis
- Coaching recommendations

### 💰 Savings
- Idle asset identification
- Route optimization
- Lease mileage management

### Try asking:
- "Show me today's critical alerts"
- "Which vehicles need maintenance?"
- "How can I reduce fuel costs?"
- "Who are my best drivers?"`,
  },
]

// Default response when no trigger matches
const DEFAULT_RESPONSE = `I can help you analyze your fleet data. Try asking about:

- **"Show fleet status"** - Vehicle availability overview
- **"What needs maintenance?"** - Service alerts and predictions
- **"How are my drivers performing?"** - Safety scores and trends
- **"What are my fuel costs?"** - Cost per mile analysis

What would you like to know?`

function findBestResponse(message) {
  const lowerMessage = message.toLowerCase()

  for (const demo of DEMO_RESPONSES) {
    if (demo.trigger.some(t => lowerMessage.includes(t))) {
      return demo.response
    }
  }

  return DEFAULT_RESPONSE
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    isTyping: false,
    statusMessage: '',
    currentSessionId: 'demo-session',
    connectionStatus: 'connected',
  }),

  getters: {
    isConnected: () => true,
    isConnecting: () => false,
    totalMessageCount: (state) => state.messages.length,
    currentMessages: (state) => state.messages,
  },

  actions: {
    async load() {
      // Add welcome message if no messages
      if (this.messages.length === 0) {
        this.messages.push({
          id: this.generateMessageId(),
          role: 'assistant',
          content: `Welcome to **Element Fleet AI**! 👋

I'm your intelligent fleet management assistant. I can help you understand your fleet's performance, identify cost savings, and stay ahead of maintenance needs.

**Quick Actions:**
- Ask me about vehicle status, fuel costs, or driver performance
- Check maintenance alerts and predictions
- Explore optimization opportunities

What would you like to know about your fleet today?`,
          timestamp: new Date(),
          sessionId: this.currentSessionId,
        })
      }
      return this.messages
    },

    async sendChatMessage(messageText) {
      if (!messageText.trim()) return false

      // Add user message
      this.messages.push({
        id: this.generateMessageId(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        sessionId: this.currentSessionId,
      })

      // Show typing indicator
      this.isTyping = true
      this.statusMessage = 'Thinking...'

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

      // Get response
      const response = findBestResponse(messageText)

      // Simulate streaming effect
      this.statusMessage = 'Generating response...'
      await new Promise(resolve => setTimeout(resolve, 300))

      // Add AI response
      this.messages.push({
        id: this.generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sessionId: this.currentSessionId,
      })

      this.isTyping = false
      this.statusMessage = ''

      return true
    },

    startNewConversation() {
      this.messages = []
      this.currentSessionId = `demo-session-${Date.now()}`
      this.load()
    },

    clearAllState() {
      this.messages = []
      this.isTyping = false
      this.statusMessage = ''
    },

    generateMessageId() {
      return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    // Stub methods to prevent errors from components expecting these
    async connectWebSocket() { return true },
    disconnectWebSocket() {},
    stopStreaming() { this.isTyping = false },
  },
})

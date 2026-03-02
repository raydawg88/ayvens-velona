import { defineStore } from 'pinia'

// Demo tasks for Element Fleet AI showcase
const DEMO_TASKS = [
  {
    id: 'task-001',
    priority: 'High',
    title: 'Critical Brake System Alert - Unit 2847',
    category: 'safety',
    is_starred: true,
    closed_at: null,
    created_at: '2025-01-15T08:00:00Z',
    affected_units: ['Unit 2847'],
    summary: 'Brake pad wear detected at 92% - immediate inspection required before next deployment.',
    problem: 'Telematics data shows brake system degradation beyond safe operating thresholds. The front brake pads on Unit 2847 have reached critical wear levels, with only 8% material remaining. Continued operation poses significant safety risks.',
    business_impact: 'If not addressed immediately:\n- **Safety Risk**: Potential brake failure during operation\n- **Liability**: Increased exposure to accident-related claims\n- **Downtime**: Unplanned breakdown could result in 3-5 days off-road\n- **Cost**: Emergency repairs cost 40% more than scheduled maintenance',
    action_plan: '1. **Immediately**: Remove Unit 2847 from active rotation\n2. **Today**: Schedule brake pad replacement at certified service center\n3. **This Week**: Inspect brake systems on similar-age fleet units\n4. **Ongoing**: Adjust predictive maintenance thresholds for brake components',
    success_metrics: '- Brake pads replaced within 24 hours\n- Unit returned to service within 48 hours\n- Zero safety incidents related to brake systems\n- Preventive inspections completed on 5 similar units',
  },
  {
    id: 'task-002',
    priority: 'High',
    title: 'Fuel Efficiency Drop Detected - 12 Vehicles',
    category: 'fuel_efficiency',
    is_starred: false,
    closed_at: null,
    created_at: '2025-01-14T14:30:00Z',
    affected_units: ['Unit 1923', 'Unit 2156', 'Unit 2201', 'Unit 2344', 'Unit 2456', 'Unit 2567', 'Unit 2678', 'Unit 2789', 'Unit 2890', 'Unit 2901', 'Unit 3012', 'Unit 3123'],
    summary: '12 vehicles showing 15-22% decrease in fuel efficiency over the past 2 weeks. Pattern suggests common root cause.',
    problem: 'Fleet-wide analysis detected a cluster of vehicles with significant fuel efficiency degradation. The affected units share similar routes and were last serviced at the same location. Potential causes include:\n- Fuel quality issues\n- Air filter degradation\n- Tire pressure inconsistencies\n- Driving behavior changes',
    business_impact: '- **Monthly Fuel Cost Increase**: Estimated $4,200 additional fuel spend\n- **Annual Projection**: $50,400 if unaddressed\n- **Carbon Footprint**: 12% increase in emissions for affected vehicles\n- **Competitive Position**: Higher operating costs reduce profit margins',
    action_plan: '1. **Immediate**: Check tire pressure on all 12 vehicles\n2. **This Week**: Replace air filters on affected units\n3. **This Week**: Analyze fuel source - verify quality from recent fill-ups\n4. **Next Week**: Review driver behavior data for route optimization\n5. **Monthly**: Implement fuel efficiency monitoring dashboard',
    success_metrics: '- Fuel efficiency restored to baseline within 2 weeks\n- Root cause identified and documented\n- Preventive measures implemented fleet-wide\n- Monthly fuel spend reduced by $4,000+',
  },
  {
    id: 'task-003',
    priority: 'Medium',
    title: 'Scheduled Maintenance Due - 8 Units',
    category: 'maintenance',
    is_starred: false,
    closed_at: null,
    created_at: '2025-01-13T09:15:00Z',
    affected_units: ['Unit 1845', 'Unit 1967', 'Unit 2089', 'Unit 2190', 'Unit 2291', 'Unit 2392', 'Unit 2493', 'Unit 2594'],
    summary: '8 vehicles approaching 50,000-mile service interval. Oil changes and multi-point inspections required within the next 500 miles.',
    problem: 'Routine maintenance scheduling alert. These vehicles are within the service window for their 50,000-mile comprehensive service package, which includes:\n- Oil and filter change\n- Transmission fluid check\n- Brake inspection\n- Tire rotation\n- Multi-point safety inspection',
    business_impact: '- **Warranty Compliance**: Service required to maintain warranty coverage\n- **Resale Value**: Documented maintenance history improves resale by 8-12%\n- **Reliability**: Reduces risk of unexpected breakdowns\n- **Scheduling**: Proactive scheduling minimizes operational disruption',
    action_plan: '1. **Today**: Generate service appointments for all 8 units\n2. **This Week**: Stagger appointments to maintain fleet availability\n3. **During Service**: Request digital service records\n4. **Post-Service**: Update fleet management system with completed work',
    success_metrics: '- All 8 units serviced within 2 weeks\n- Zero missed warranty deadlines\n- Service costs within 5% of estimate\n- 100% digital record capture',
  },
  {
    id: 'task-004',
    priority: 'Medium',
    title: 'Driver Behavior Training Opportunity',
    category: 'driver_behavior',
    is_starred: false,
    closed_at: null,
    created_at: '2025-01-12T11:45:00Z',
    affected_units: ['Driver: M. Johnson', 'Driver: S. Williams', 'Driver: R. Davis'],
    summary: '3 drivers showing patterns of hard braking and rapid acceleration. Training intervention recommended to improve safety and reduce wear.',
    problem: 'Telematics analysis identified three drivers with driving patterns that exceed fleet safety thresholds:\n- **Hard Braking Events**: 40% above fleet average\n- **Rapid Acceleration**: 35% above fleet average\n- **Harsh Cornering**: 25% above fleet average\n\nThese patterns correlate with increased vehicle wear and higher fuel consumption.',
    business_impact: '- **Safety**: Increased accident risk (hard braking often indicates close following)\n- **Maintenance**: Accelerated brake and tire wear (+$1,200/year per vehicle)\n- **Fuel**: 8-12% higher fuel consumption\n- **Insurance**: Pattern may impact fleet insurance rates',
    action_plan: '1. **This Week**: Schedule individual coaching sessions\n2. **During Sessions**: Review telematics data with each driver\n3. **30 Days**: Implement driver scorecards with improvement targets\n4. **60 Days**: Re-evaluate driving patterns\n5. **Ongoing**: Recognize and reward improvement',
    success_metrics: '- 50% reduction in hard braking events within 30 days\n- Driver satisfaction maintained above 80%\n- Fuel efficiency improvement of 5%+ for coached drivers\n- Zero at-fault accidents',
  },
  {
    id: 'task-005',
    priority: 'Low',
    title: 'Telematics Device Firmware Update Available',
    category: 'telematics',
    is_starred: false,
    closed_at: null,
    created_at: '2025-01-11T16:20:00Z',
    affected_units: ['All Fleet Vehicles (47 units)'],
    summary: 'New firmware v3.2.1 available for fleet telematics devices. Update includes improved GPS accuracy and battery optimization.',
    problem: 'A new firmware update is available for the telematics devices installed across the fleet. This update includes:\n- 15% improvement in GPS location accuracy\n- 20% reduction in device power consumption\n- Enhanced cellular connectivity in low-signal areas\n- Bug fixes for data transmission reliability',
    business_impact: '- **Data Quality**: Improved GPS accuracy for better route analysis\n- **Reliability**: Fewer data gaps from connectivity improvements\n- **Cost Neutral**: Update is included in service agreement\n- **Minimal Disruption**: Over-the-air update requires no vehicle downtime',
    action_plan: '1. **This Week**: Schedule overnight OTA update deployment\n2. **Pre-Update**: Verify all devices are connected and responding\n3. **Post-Update**: Validate firmware version on all units\n4. **48 Hours Post**: Monitor for any data anomalies',
    success_metrics: '- 100% of devices updated within 1 week\n- Zero data collection interruptions\n- GPS accuracy improvement verified\n- No driver workflow impact',
  },
  {
    id: 'task-006',
    priority: 'Low',
    title: 'License Renewal Reminder - 3 Vehicles',
    category: 'compliance',
    is_starred: false,
    closed_at: null,
    created_at: '2025-01-10T08:00:00Z',
    affected_units: ['Unit 1756', 'Unit 1823', 'Unit 1901'],
    summary: 'Vehicle registrations expiring within 45 days. Renewal process should begin to avoid compliance issues.',
    problem: 'Three fleet vehicles have registrations expiring in the next 45 days:\n- Unit 1756: Expires Feb 15, 2025\n- Unit 1823: Expires Feb 22, 2025\n- Unit 1901: Expires Feb 28, 2025\n\nRenewal processing typically requires 2-3 weeks.',
    business_impact: '- **Compliance**: Operating with expired registration is a violation\n- **Fines**: Potential penalties of $200-500 per vehicle\n- **Insurance**: May void coverage if operating illegally\n- **Reputation**: Compliance issues reflect poorly on operations',
    action_plan: '1. **This Week**: Gather required documentation for each vehicle\n2. **Week 2**: Submit renewal applications\n3. **Week 3**: Verify processing and receipt of new registrations\n4. **Ongoing**: Add 60-day advance alerts for future renewals',
    success_metrics: '- All renewals completed before expiration\n- Zero compliance violations\n- Documentation archived digitally\n- Future renewals tracked proactively',
  },
]

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    isLoading: false,
    error: null,
    lastFetchTime: null,
  }),

  getters: {
    cacheDuration: () => 15 * 60 * 1000,

    isDataFresh: (state) => {
      if (!state.lastFetchTime) return false
      return Date.now() - state.lastFetchTime < 15 * 60 * 1000
    },

    incompleteTasks: (state) => state.tasks.filter((task) => !task.is_completed),

    topTasksByPriority: (state) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 }
      return [...state.tasks.filter((task) => !task.is_completed)]
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 3)
    },
  },

  actions: {
    async load() {
      if (!this.isDataFresh) {
        await this.fetchTasks()
      }
      return this.tasks
    },

    async refreshAll() {
      return await this.fetchTasks(true)
    },

    async fetchTasks(forceRefresh = false) {
      if (!forceRefresh && this.isDataFresh) {
        return this.tasks
      }

      this.isLoading = true
      this.error = null

      try {
        this.tasks = DEMO_TASKS.map(this.transformTask)
        this.lastFetchTime = Date.now()
        return this.tasks
      } catch (err) {
        this.error = err.message
        return []
      } finally {
        this.isLoading = false
      }
    },

    async updateTask(taskId, updates) {
      // For demo, just update local state
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates }
      }
      return true
    },

    async toggleTaskStar(taskId) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (!task) return false

      task.starred = !task.starred
      task.is_starred = task.starred
      return true
    },

    async toggleTaskCompletion(taskId) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (!task) return false

      task.is_completed = !task.is_completed
      if (task.is_completed) {
        task.closed_at = new Date().toISOString()
      } else {
        task.closed_at = null
      }
      return true
    },

    getTaskById(taskId) {
      return this.tasks.find((t) => t.id === taskId) || null
    },

    clearError() {
      this.error = null
    },

    refreshTasks() {
      return this.refreshAll()
    },

    clearAllState() {
      this.tasks = []
      this.isLoading = false
      this.error = null
      this.lastFetchTime = null
    },

    transformTask(backendTask) {
      return {
        id: backendTask.id,
        priority: backendTask.priority,
        title: backendTask.title,
        description: backendTask.summary || 'No summary available',
        tags: this.extractTags(backendTask),
        starred: backendTask.is_starred,
        borderColor: this.getPriorityColor(backendTask.priority),
        dotColor: this.getPriorityColor(backendTask.priority),
        is_completed: backendTask.closed_at !== null,
        is_starred: backendTask.is_starred,
        completed_at: backendTask.closed_at,
        created_at: backendTask.created_at,
        category: backendTask.category,
        affected_units: backendTask.affected_units,
        summary: backendTask.summary,
        problem: backendTask.problem,
        business_impact: backendTask.business_impact,
        action_plan: backendTask.action_plan,
        success_metrics: backendTask.success_metrics,
        closed_at: backendTask.closed_at,
      }
    },

    getPriorityColor(priority) {
      const colors = {
        High: '#fe9292',
        high: '#fe9292',
        Medium: '#fed692',
        medium: '#fed692',
        Low: '#c0f7b7',
        low: '#c0f7b7',
      }
      return colors[priority] || '#e5e7eb'
    },

    extractTags(task) {
      const tags = []
      if (task.category) {
        tags.push(task.category.replace(/_/g, ' '))
      }
      if (task.affected_units && task.affected_units.length > 0) {
        tags.push(`${task.affected_units.length} units`)
      }
      return tags
    },
  },
})

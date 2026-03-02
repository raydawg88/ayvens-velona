<template>
  <div class="visualization-wrapper">
    <!-- Map visualization -->
    <MapRenderer v-if="mapData" :mapData="mapData" :text="text" />

    <!-- Fallback for unsupported types -->
    <div v-else class="unsupported-viz">
      <p>Visualization type "{{ visualizationType }}" is not yet supported.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MapRenderer from './MapRenderer.vue'

const props = defineProps({
  // Raw visualization data from LLM tool result
  visualizationData: {
    type: Object,
    required: true,
  },
  // Optional text to display above visualization
  text: {
    type: String,
    default: '',
  },
})

// Parse the visualization data and convert to MapRenderer format
const visualizationType = computed(() => props.visualizationData.visualizationType)

const mapData = computed(() => {
  if (!props.visualizationData) return null

  const vizType = props.visualizationData.visualizationType
  let resultData = props.visualizationData.resultData

  // Parse resultData if it's a string
  if (typeof resultData === 'string') {
    try {
      resultData = JSON.parse(resultData)
    } catch (error) {
      console.error('Failed to parse resultData:', error)
      return null
    }
  }

  if (!resultData || !resultData.rows) return null

  // Handle polyline visualization (trips/routes)
  if (vizType === 'polyline') {
    return processPolylineVisualization(resultData)
  }

  // Handle plot visualization (event markers)
  if (vizType === 'plot') {
    return processPlotVisualization(resultData)
  }

  return null
})

// Process polyline data from get_map_polylines tool
function processPolylineVisualization(resultData) {
  const rows = resultData.rows || []
  if (rows.length === 0) return null

  const routes = []
  const markers = []
  const bounds = { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }

  rows.forEach((row, index) => {
    // Decode polyline if it's a string
    if (row.polyline) {
      routes.push({
        polyline: row.polyline,
        color: getRouteColor(index),
        width: 3,
      })
    }

    // Build vehicle label
    const vehicleLabel = formatVehicleLabel(row)

    // Add start marker
    if (row.start_lat && row.start_lon) {
      markers.push({
        lat: row.start_lat,
        lng: row.start_lon,
        label: `${vehicleLabel} - Start`,
        description: formatTripStartInfo(row),
        color: '#22c55e',
        type: 'start',
        routeIndex: index, // Link marker to its route
      })
      updateBounds(bounds, row.start_lat, row.start_lon)
    }

    // Add stop marker
    if (row.stop_lat && row.stop_lon) {
      markers.push({
        lat: row.stop_lat,
        lng: row.stop_lon,
        label: `${vehicleLabel} - End`,
        description: formatTripEndInfo(row),
        color: '#ef4444',
        type: 'end',
        routeIndex: index, // Link marker to its route
      })
      updateBounds(bounds, row.stop_lat, row.stop_lon)
    }
  })

  // Calculate center from bounds
  const center = [
    (bounds.minLng + bounds.maxLng) / 2,
    (bounds.minLat + bounds.maxLat) / 2,
  ]

  return {
    theme: 'streets',
    center: center,
    zoom: 12,
    markers: markers,
    routes: routes, // Pass all routes
  }
}

// Process plot data from get_map_plots tool
function processPlotVisualization(resultData) {
  const rows = resultData.rows || []
  if (rows.length === 0) return null

  const markers = []
  const bounds = { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }

  rows.forEach((row) => {
    if (!row.lat || !row.lon) return

    markers.push({
      lat: row.lat,
      lng: row.lon,
      label: row.event_type || 'Event',
      description: formatEventDescription(row),
      color: getEventColor(row.event_type),
    })

    updateBounds(bounds, row.lat, row.lon)
  })

  // Calculate center from bounds
  const center = [
    (bounds.minLng + bounds.maxLng) / 2,
    (bounds.minLat + bounds.maxLat) / 2,
  ]

  return {
    theme: 'streets',
    center: center,
    zoom: 12,
    markers: markers,
  }
}

// Helper: Get color for route based on index
function getRouteColor(index) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  return colors[index % colors.length]
}

// Helper: Get color for event type
function getEventColor(eventType) {
  const colorMap = {
    'harsh_braking': '#ef4444',
    'hard_brake': '#ef4444',
    'speeding': '#f59e0b',
    'rapid_acceleration': '#f97316',
    'idling': '#eab308',
    'geofence_exit': '#8b5cf6',
    'geofence_enter': '#06b6d4',
  }
  return colorMap[eventType?.toLowerCase()] || '#6b7280'
}

// Helper: Format event description
function formatEventDescription(row) {
  const parts = []

  if (row.vehicle_id) parts.push(`Vehicle: ${row.vehicle_id}`)
  if (row.timestamp) parts.push(`Time: ${formatDateTime(row.timestamp)}`)
  if (row.max_value) parts.push(`Max: ${row.max_value}`)
  if (row.duration) parts.push(`Duration: ${row.duration}ms`)

  return parts.join('<br>')
}

// Helper: Format vehicle label (make/model/year instead of UUID)
function formatVehicleLabel(row) {
  if (row.make && row.model && row.year) {
    return `${row.year} ${row.make} ${row.model}`
  }
  if (row.make && row.model) {
    return `${row.make} ${row.model}`
  }
  if (row.vehicle_id) {
    // Fallback to UUID if no vehicle info
    return row.vehicle_id.substring(0, 8) + '...'
  }
  return 'Vehicle'
}

// Helper: Format trip start info
function formatTripStartInfo(row) {
  const parts = []

  if (row.start_time_local || row.start_time) {
    parts.push(`Started: ${formatDateTime(row.start_time_local || row.start_time)}`)
  }

  if (row.distance_miles) {
    parts.push(`Distance: ${row.distance_miles.toFixed(1)} mi`)
  }

  if (row.duration_minutes) {
    const hours = Math.floor(row.duration_minutes / 60)
    const mins = Math.round(row.duration_minutes % 60)
    if (hours > 0) {
      parts.push(`Duration: ${hours}h ${mins}m`)
    } else {
      parts.push(`Duration: ${mins}m`)
    }
  }

  return parts.join('<br>')
}

// Helper: Format trip end info
function formatTripEndInfo(row) {
  const parts = []

  if (row.stop_time_local || row.stop_time) {
    parts.push(`Ended: ${formatDateTime(row.stop_time_local || row.stop_time)}`)
  }

  if (row.hard_brake_count !== null && row.hard_brake_count !== undefined) {
    parts.push(`Hard brakes: ${row.hard_brake_count || 0}`)
  }

  if (row.vin) {
    parts.push(`VIN: ${row.vin.substring(row.vin.length - 6)}`)
  }

  return parts.join('<br>')
}

// Helper: Format date/time
function formatDateTime(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// Helper: Update bounds
function updateBounds(bounds, lat, lng) {
  bounds.minLat = Math.min(bounds.minLat, lat)
  bounds.maxLat = Math.max(bounds.maxLat, lat)
  bounds.minLng = Math.min(bounds.minLng, lng)
  bounds.maxLng = Math.max(bounds.maxLng, lng)
}
</script>

<style scoped>
.visualization-wrapper {
  width: 100%;
}

.unsupported-viz {
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  color: #6b7280;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-size: 14px;
}
</style>

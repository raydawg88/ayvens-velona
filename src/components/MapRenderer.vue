<template>
  <div class="map-message">
    <!-- Optional text content above the map -->
    <div v-if="text" class="map-text markdown-content" v-html="renderMarkdown(text)"></div>

    <!-- Map container -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- Optional summary below map -->
    <div v-if="mapData.summary" class="map-summary">
      {{ mapData.summary }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { marked } from 'marked'
import polyline from '@mapbox/polyline'
import config from '@/config'

const props = defineProps({
  mapData: {
    type: Object,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
})

const mapContainer = ref(null)
let map = null
let currentHighlightedRoute = null
let openPopups = [] // Track all open popups

// Highlight polyline when marker is clicked
const highlightPolyline = (markerIndex) => {
  if (!map) return

  // Reset previous highlight
  if (currentHighlightedRoute !== null) {
    const prevLayerId = `route-layer-${currentHighlightedRoute}`
    if (map.getLayer(prevLayerId)) {
      map.setPaintProperty(prevLayerId, 'line-width', 3)
      map.setPaintProperty(prevLayerId, 'line-opacity', 0.75)
    }
  }

  // Highlight the route associated with this marker (usually route 0)
  const routeIndex = 0 // Can be enhanced to map markers to specific routes
  const layerId = `route-layer-${routeIndex}`

  if (map.getLayer(layerId)) {
    // Move layer to top
    map.moveLayer(layerId)

    // Slow pulsing flash animation
    const pulseAnimation = () => {
      let opacity = 1
      let width = 6
      let increasing = false
      let pulseCount = 0
      const maxPulses = 3

      const pulse = setInterval(() => {
        if (increasing) {
          opacity += 0.05
          width += 0.1
          if (opacity >= 1) {
            increasing = false
            pulseCount++
          }
        } else {
          opacity -= 0.05
          width -= 0.1
          if (opacity <= 0.6) {
            increasing = true
          }
        }

        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-opacity', opacity)
          map.setPaintProperty(layerId, 'line-width', width)
        }

        // Stop after 3 pulses
        if (pulseCount >= maxPulses) {
          clearInterval(pulse)
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-width', 5)
            map.setPaintProperty(layerId, 'line-opacity', 1)
          }
        }
      }, 50) // 50ms for smooth animation
    }

    pulseAnimation()
    currentHighlightedRoute = routeIndex
  }
}

// Render markdown for text content
const renderMarkdown = (content) => {
  if (!content || typeof content !== 'string') return content || ''

  try {
    return marked.parse(content, {
      breaks: true,
      gfm: true,
      headerIds: false,
      sanitize: false,
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return content
  }
}

onMounted(() => {
  // Set Mapbox access token
  mapboxgl.accessToken = config.mapbox.accessToken

  // Map style themes - easier names for backend
  const styleMap = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1',
    'navigation-night': 'mapbox://styles/mapbox/navigation-night-v1',
  }

  // Get style - allow both short names and full mapbox:// URLs
  let mapStyle = props.mapData.style || props.mapData.theme || 'streets'
  if (!mapStyle.startsWith('mapbox://')) {
    mapStyle = styleMap[mapStyle] || styleMap.streets
  }

  // Create the map
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: props.mapData.center || [-97.7431, 30.2672],
    zoom: props.mapData.zoom || 12,
  })

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  // Add markers if provided
  if (props.mapData.markers && props.mapData.markers.length > 0) {
    props.mapData.markers.forEach((marker, index) => {
      const el = document.createElement('div')
      el.className = 'custom-marker'

      // Use marker's color directly (set by VisualizationRenderer)
      el.style.backgroundColor = marker.color || '#3b82f6'

      // Size based on type
      if (marker.type === 'start' || marker.type === 'end') {
        el.style.width = '14px'
        el.style.height = '14px'
      } else {
        el.style.width = '12px'
        el.style.height = '12px'
      }

      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'

      // Store marker data for click handling
      el.dataset.markerIndex = index
      el.dataset.routeIndex = marker.routeIndex !== undefined ? marker.routeIndex : 0

      const mapMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])

      // Add popup if label provided
      if (marker.label || marker.description) {
        const popupContent = `
          ${marker.label ? `<h3 style="margin: 0 0 4px 0; font-weight: 600;">${marker.label}</h3>` : ''}
          ${marker.description ? `<p style="margin: 0; font-size: 12px;">${marker.description}</p>` : ''}
        `
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeOnClick: true,
          closeButton: true,
          maxWidth: '300px'
        }).setHTML(popupContent)

        // Close all other popups when this one opens
        popup.on('open', () => {
          openPopups.forEach(p => {
            if (p !== popup && p.isOpen()) {
              p.remove()
            }
          })
        })

        openPopups.push(popup)
        mapMarker.setPopup(popup)
      }

      // Add click handler to highlight polyline
      el.addEventListener('click', () => {
        const routeIdx = marker.routeIndex !== undefined ? marker.routeIndex : 0
        highlightPolyline(routeIdx)
      })

      mapMarker.addTo(map)
    })

    // Fit bounds to show all markers if multiple
    if (props.mapData.markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      props.mapData.markers.forEach((marker) => {
        bounds.extend([marker.lng, marker.lat])
      })
      map.fitBounds(bounds, { padding: 50 })
    }
  }

  // Add routes/polylines if provided
  const routesToAdd = props.mapData.routes || (props.mapData.route ? [props.mapData.route] : [])

  if (routesToAdd.length > 0) {
    map.on('load', () => {
      routesToAdd.forEach((route, index) => {
        let coordinates = route.coordinates

        // Handle encoded polyline string (from your get_map_polylines tool)
        if (typeof route.coordinates === 'string') {
          try {
            // Decode polyline string to [[lng, lat], [lng, lat], ...] format
            const decoded = polyline.decode(route.coordinates)
            // Flip to [lng, lat] format (polyline library returns [lat, lng])
            coordinates = decoded.map(coord => [coord[1], coord[0]])
          } catch (error) {
            console.error('Failed to decode polyline:', error)
            return
          }
        }

        // Handle encoded polyline in separate field
        if (route.polyline && typeof route.polyline === 'string') {
          try {
            const decoded = polyline.decode(route.polyline)
            coordinates = decoded.map(coord => [coord[1], coord[0]])
          } catch (error) {
            console.error('Failed to decode polyline:', error)
            return
          }
        }

        if (!coordinates || coordinates.length === 0) {
          console.warn('No valid coordinates found for route')
          return
        }

        const sourceId = `route-${index}`
        const layerId = `route-layer-${index}`

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          },
        })

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': route.color || '#3b82f6',
            'line-width': route.width || 3,
            'line-opacity': 0.75,
          },
        })

        // Add click handler to polyline to show start/end info
        map.on('click', layerId, (e) => {
          // Get start and end coordinates
          const startCoord = coordinates[0]
          const endCoord = coordinates[coordinates.length - 1]

          // Get route metadata if available
          const routeInfo = route.label || route.name || `Route ${index + 1}`
          const distance = route.distance ? `${route.distance} mi` : null
          const duration = route.duration || null

          // Create popup content for this specific route
          const popupContent = `
            <div style="font-family: 'Euclid Circular B', Arial, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${routeInfo}</h3>
              ${distance ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Distance: ${distance}</div>` : ''}
              ${duration ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Duration: ${duration}</div>` : ''}
              <div style="font-size: 11px; color: #6b7280;">
                Click markers to see start/end details
              </div>
            </div>
          `

          // Show popup at click location
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map)

          // Highlight the polyline
          highlightPolyline(index)
        })

        // Change cursor on hover
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer'
        })

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = ''
        })
      })
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-message {
  width: 100%;
}

.map-text {
  margin-bottom: 12px;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  color: #000000;
  line-height: 1.5;
}

.map-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-summary {
  margin-top: 12px;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

/* Markdown styling for map text */
.map-text :deep(p) {
  margin-bottom: 0.5rem;
}

.map-text :deep(strong) {
  font-weight: 700;
}

.map-text :deep(ul),
.map-text :deep(ol) {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}

.map-text :deep(li) {
  margin-bottom: 0.25rem;
}
</style>

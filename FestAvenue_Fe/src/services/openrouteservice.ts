// OpenRouteService API
// Get free API key at: https://openrouteservice.org/dev/#/signup

const ORS_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY || '5b3ce3597851110001cf6248YOUR_API_KEY_HERE'
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions'

// ======================
// OpenRouteService GeoJSON Types
// ======================

interface OpenRouteGeoJSONResponse {
  type: 'FeatureCollection'
  bbox: number[]
  features: ORSFeature[]
  metadata: {
    attribution: string
    service: string
    timestamp: number
    query: {
      coordinates: [number, number][]
      profile: string
      profileName: string
      format: string
    }
    engine: {
      version: string
      build_date: string
      graph_date: string
      osm_date: string
    }
  }
}

interface ORSFeature {
  bbox: number[]
  type: 'Feature'
  properties: {
    segments: Array<{
      distance: number
      duration: number
      steps: Array<{
        distance: number
        duration: number
        type: number
        instruction: string
        name: string
        way_points: number[]
      }>
    }>
    way_points: number[]
    summary: {
      distance: number // meters
      duration: number // seconds
    }
  }
  geometry: {
    coordinates: [number, number][] // [lng, lat] format - GeoJSON LineString
    type: 'LineString'
  }
}

export interface DirectionsResult {
  distance: number // meters
  duration: number // seconds
  coordinates: [number, number][] // [lat, lng] format for Leaflet
}

/**
 * Get waypoints to force route through Vietnam
 * This helps avoid routing through other countries
 */
function getVietnameseWaypoints(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
  const waypoints: { lat: number; lng: number }[] = [start]

  // If route is long (>500km roughly), add waypoints to stay in Vietnam
  const distance = Math.abs(start.lat - end.lat) + Math.abs(start.lng - end.lng)

  if (distance > 5) {
    // Long route - add strategic waypoints in Vietnam
    const midLat = (start.lat + end.lat) / 2
    const midLng = (start.lng + end.lng) / 2

    // Add waypoint in central Vietnam to avoid crossing borders
    // Adjust longitude to stay within Vietnam (102-110 longitude)
    const vietnamLng = Math.max(105, Math.min(107, midLng))

    waypoints.push({
      lat: midLat,
      lng: vietnamLng
    })
  }

  waypoints.push(end)
  return waypoints
}

/**
 * Get directions using OSRM with waypoints to stay in Vietnam
 */
async function getDirectionsFromOSRM(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<DirectionsResult> {
  // Get waypoints to force route through Vietnam
  const waypoints = getVietnameseWaypoints(start, end)

  // Build OSRM URL with all waypoints
  const coords = waypoints.map((wp) => `${wp.lng},${wp.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found from OSRM')
  }

  const route = data.routes[0]

  // Convert [lng, lat] to [lat, lng] for Leaflet
  const coordinates_leaflet: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  )

  return {
    distance: route.distance,
    duration: route.duration,
    coordinates: coordinates_leaflet
  }
}

/**
 * Get directions from start to end coordinates
 * @param start {lat, lng}
 * @param end {lat, lng}
 * @returns DirectionsResult with route info
 */
export async function getDirections(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<DirectionsResult> {
  try {
    // Try OSRM first (free, no API key, better for Vietnam)
    try {
      return await getDirectionsFromOSRM(start, end)
    } catch (osrmError) {
      console.warn('OSRM failed, trying OpenRouteService:', osrmError)
    }

    // Fallback to OpenRouteService
    // ORS uses [lng, lat] format, not [lat, lng]
    const coordinates = [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ]

    const response = await fetch(`${ORS_BASE_URL}/driving-car/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY
      },
      body: JSON.stringify({
        coordinates,
        options: {
          avoid_countries: ['104', '116', '156'], // Avoid Myanmar(104), Cambodia(116), China(156)
          avoid_borders: 'controlled' // Avoid crossing international borders
        },
        preference: 'shortest' // Use shortest path instead of fastest
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouteService API error:', errorText)
      throw new Error(`OpenRouteService API error: ${response.status} ${response.statusText}`)
    }

    const data: OpenRouteGeoJSONResponse = await response.json()
    console.log('OpenRouteService response:', data)

    if (!data.features || data.features.length === 0) {
      throw new Error('No route found')
    }

    const feature = data.features[0]

    // Check if geometry exists and has coordinates
    if (!feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
      console.error('Invalid geometry in feature:', feature)
      throw new Error('Invalid route geometry')
    }

    // Convert [lng, lat] to [lat, lng] for Leaflet
    const coordinates_leaflet: [number, number][] = feature.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    )

    return {
      distance: feature.properties.summary.distance,
      duration: feature.properties.summary.duration,
      coordinates: coordinates_leaflet
    }
  } catch (error) {
    console.error('Error fetching directions:', error)
    throw error
  }
}

/**
 * Get user's current geolocation
 * @returns Promise with {lat, lng} or null if denied
 */
export function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('Error getting user location:', error)
        resolve(null)
      }
    )
  })
}

import { useState, useCallback } from 'react'

// ==================== TYPES ====================

interface GeocodeResult {
  lat: number
  lng: number
  formatted_address: string
  compound?: {
    province?: string
    district?: string
    commune?: string
  }
}

interface AutocompleteResult {
  description: string
  place_id: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

interface DirectionResult {
  routes: Array<{
    overview_polyline: { points: string }
    legs: Array<{
      distance: { text: string; value: number }
      duration: { text: string; value: number }
      steps: Array<{
        distance: { text: string; value: number }
        duration: { text: string; value: number }
        html_instructions: string
        polyline: { points: string }
      }>
    }>
  }>
}

interface DistanceMatrixResult {
  rows: Array<{
    elements: Array<{
      status: string
      duration: { text: string; value: number }
      distance: { text: string; value: number }
    }>
  }>
}

type VehicleType = 'car' | 'bike' | 'taxi' | 'truck' | 'hd'

// ==================== HOOK ====================

export const useGoongAPI = (apiKey?: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goongApiKey = apiKey || import.meta.env.VITE_GOONG_API_KEY || ''

  /**
   * GEOCODE V2: Convert address to coordinates
   * @param address Full address string
   */
  const geocode = useCallback(
    async (address: string): Promise<GeocodeResult | null> => {
      if (!address || !goongApiKey) {
        setError('Missing address or API key')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        // Try both V2 and V1 formats
        // V2: https://rsapi.goong.io/v2/geocode
        // V1: https://rsapi.goong.io/geocode
        const response = await fetch(
          `https://rsapi.goong.io/v2/geocode?address=${encodeURIComponent(address)}&api_key=${goongApiKey}`
        )

        if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`)

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formatted_address: result.formatted_address,
            compound: result.compound
          }
        }

        return null
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Geocoding failed')
        console.error('Geocoding error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * REVERSE GEOCODE V2: Convert coordinates to address
   */
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<GeocodeResult | null> => {
      if (!lat || !lng || !goongApiKey) {
        setError('Missing coordinates or API key')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        // V2 format: /v2/geocode
        const response = await fetch(`https://rsapi.goong.io/v2/geocode?latlng=${lat},${lng}&api_key=${goongApiKey}`)

        if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.statusText}`)

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formatted_address: result.formatted_address,
            compound: result.compound
          }
        }

        return null
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reverse geocoding failed')
        console.error('Reverse geocoding error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * AUTOCOMPLETE V2: Get address suggestions
   */
  const autocomplete = useCallback(
    async (input: string, limit: number = 10): Promise<AutocompleteResult[]> => {
      if (!input || !goongApiKey) return []

      setIsLoading(true)
      setError(null)

      try {
        // V2 format: /v2/place/autocomplete
        const response = await fetch(
          `https://rsapi.goong.io/v2/place/autocomplete?input=${encodeURIComponent(
            input
          )}&limit=${limit}&api_key=${goongApiKey}`
        )

        if (!response.ok) throw new Error(`Autocomplete failed: ${response.statusText}`)

        const data = await response.json()

        if (data.predictions && data.predictions.length > 0) {
          return data.predictions.map((prediction: any) => ({
            description: prediction.description,
            place_id: prediction.place_id,
            structured_formatting: prediction.structured_formatting
          }))
        }

        return []
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Autocomplete failed')
        console.error('Autocomplete error:', err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * PLACE DETAIL V2: Get details for a place by place_id
   */
  const getPlaceDetail = useCallback(
    async (placeId: string): Promise<GeocodeResult | null> => {
      if (!placeId || !goongApiKey) return null

      setIsLoading(true)
      setError(null)

      try {
        // V2 format: /v2/place/detail
        const response = await fetch(`https://rsapi.goong.io/v2/place/detail?place_id=${placeId}&api_key=${goongApiKey}`)

        if (!response.ok) throw new Error(`Place detail failed: ${response.statusText}`)

        const data = await response.json()

        if (data.result) {
          const result = data.result
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formatted_address: result.formatted_address,
            compound: result.compound
          }
        }

        return null
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Place detail failed')
        console.error('Place detail error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * DIRECTION V2: Get route from origin to destination
   * @param origin Starting coordinates [lat, lng]
   * @param destination Ending coordinates [lat, lng]
   * @param vehicle Vehicle type
   */
  const getDirection = useCallback(
    async (
      origin: [number, number],
      destination: [number, number],
      vehicle: VehicleType = 'car'
    ): Promise<DirectionResult | null> => {
      if (!origin || !destination || !goongApiKey) return null

      setIsLoading(true)
      setError(null)

      try {
        const originStr = `${origin[0]},${origin[1]}`
        const destStr = `${destination[0]},${destination[1]}`

        // V2 format: /v2/direction
        const response = await fetch(
          `https://rsapi.goong.io/v2/direction?origin=${originStr}&destination=${destStr}&vehicle=${vehicle}&api_key=${goongApiKey}`
        )

        if (!response.ok) throw new Error(`Direction failed: ${response.statusText}`)

        const data = await response.json()

        return data as DirectionResult
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Direction failed')
        console.error('Direction error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * DISTANCE MATRIX V2: Get distance and duration between multiple origins and destinations
   * @param origins Array of coordinates [[lat, lng], ...]
   * @param destinations Array of coordinates [[lat, lng], ...]
   * @param vehicle Vehicle type
   */
  const getDistanceMatrix = useCallback(
    async (
      origins: [number, number][],
      destinations: [number, number][],
      vehicle: VehicleType = 'car'
    ): Promise<DistanceMatrixResult | null> => {
      if (!origins.length || !destinations.length || !goongApiKey) return null

      setIsLoading(true)
      setError(null)

      try {
        const originsStr = origins.map(([lat, lng]) => `${lat},${lng}`).join('|')
        const destStr = destinations.map(([lat, lng]) => `${lat},${lng}`).join('|')

        // V2 format: /v2/distancematrix (lowercase!)
        const response = await fetch(
          `https://rsapi.goong.io/v2/distancematrix?origins=${originsStr}&destinations=${destStr}&vehicle=${vehicle}&api_key=${goongApiKey}`
        )

        if (!response.ok) throw new Error(`Distance Matrix failed: ${response.statusText}`)

        const data = await response.json()

        return data as DistanceMatrixResult
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Distance Matrix failed')
        console.error('Distance Matrix error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [goongApiKey]
  )

  /**
   * Helper: Calculate distance between user and event location
   */
  const calculateDistance = useCallback(
    async (userLocation: [number, number], eventLocation: [number, number], vehicle: VehicleType = 'car') => {
      const result = await getDistanceMatrix([userLocation], [eventLocation], vehicle)
      if (result && result.rows[0]?.elements[0]) {
        return result.rows[0].elements[0]
      }
      return null
    },
    [getDistanceMatrix]
  )

  return {
    // Geocoding
    geocode,
    reverseGeocode,

    // Places
    autocomplete,
    getPlaceDetail,

    // Routing
    getDirection,
    getDistanceMatrix,
    calculateDistance,

    // State
    isLoading,
    error
  }
}

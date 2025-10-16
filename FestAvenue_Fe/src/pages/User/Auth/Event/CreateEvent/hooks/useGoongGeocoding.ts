import { useCallback } from 'react'
import { useGoongAPI } from './useGoongAPI'

export const useGoongGeocoding = (apiKey?: string) => {
  const { geocode, reverseGeocode, autocomplete, getPlaceDetail, isLoading, error } = useGoongAPI(apiKey)


  /**
   * Get coordinates for province/district/ward
   * @param province Province name
   * @param district District name (optional)
   * @param ward Ward name (optional)
   * @returns Coordinates
   */
  const getCoordinatesForAddress = useCallback(
    async (province: string, district?: string, ward?: string): Promise<{ lat: number; lng: number } | null> => {
      const addressParts = [ward, district, province, 'Việt Nam'].filter(Boolean)
      const fullAddress = addressParts.join(', ')

      const result = await geocode(fullAddress)
      if (result) {
        return { lat: result.lat, lng: result.lng }
      }

      return null
    },
    [geocode]
  )

  return {
    geocode,
    reverseGeocode,
    autocomplete,
    getPlaceDetail,
    getCoordinatesForAddress,
    isLoading,
    error
  }
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Province {
  code: number
  name: string
  codename: string
  division_type: string
  phone_code: number
  wards: any[] // Currently empty in API v2 (2025 reform - 34 provinces)
}

const fetchProvinces = async (): Promise<Province[]> => {
  const response = await fetch('https://provinces.open-api.vn/api/v2/')
  if (!response.ok) {
    throw new Error('Failed to fetch provinces')
  }
  return response.json()
}

export const useProvinceData = () => {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)

  // Fetch all provinces (34 provinces after 2025 administrative reform)
  const provincesQuery = useQuery({
    queryKey: ['provinces-v2'],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  const provinces = provincesQuery.data || []

  return {
    // Data
    provinces,

    // Loading states
    isLoadingProvinces: provincesQuery.isLoading,

    // Selection handlers
    selectedProvinceCode,
    setSelectedProvinceCode,

    // Utility functions
    getProvinceName: (code: number) => provinces.find((p) => p.code === code)?.name || ''
  }
}

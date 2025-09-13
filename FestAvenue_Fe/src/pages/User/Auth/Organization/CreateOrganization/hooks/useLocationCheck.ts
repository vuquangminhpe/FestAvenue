import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseFormReturn } from 'react-hook-form'
import userApi from '@/apis/user.api'
import type { OrganizationType } from '@/types/user.types'
import type { FormData, MapCenter } from '../types'

export const useLocationCheck = (form: UseFormReturn<FormData>) => {
  const [mapCenter, setMapCenter] = useState<MapCenter>({ lat: 21.0285, lng: 105.8542 })
  const [existingOrganization, setExistingOrganization] = useState<OrganizationType>()
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [isLocationChecked, setIsLocationChecked] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)

  const checkExitsLocationMutation = useMutation({
    mutationFn: userApi.checkOrganizationExists
  })

  const handleCheckLocation = async () => {
    const currentName = form.getValues('name')
    const latitude = form.getValues('latitude')
    const longitude = form.getValues('longitude')

    if (!currentName || currentName.length < 2) {
      toast.error('Vui lòng nhập tên tổ chức trước khi kiểm tra vị trí')
      return
    }

    if (!latitude || !longitude) {
      toast.error('Vui lòng nhập tọa độ hoặc chọn vị trí trên bản đồ')
      return
    }

    setIsCheckingLocation(true)

    const body = {
      name: currentName,
      latitude,
      longitude
    }

    checkExitsLocationMutation.mutateAsync(body, {
      onSuccess: (data) => {
        setExistingOrganization(data?.data as any)
        setShowConflictDialog(data?.data !== null ? true : false)

        if (data?.data !== null) {
          form.setError('latitude', { message: 'Tổ chức đã tồn tại tại vị trí này' })
          form.setError('longitude', { message: 'Tổ chức đã tồn tại tại vị trí này' })
        }

        setIsLocationChecked(data?.data !== null ? false : true)
        setIsCheckingLocation(data?.data !== null ? false : true)
      },
      onError: () => {
        form.clearErrors(['latitude', 'longitude'])
        setExistingOrganization(null as any)
        setShowConflictDialog(false)
        setIsLocationChecked(true)
        setIsCheckingLocation(false)
        toast.success('Vị trí hợp lệ! Bạn có thể tiếp tục.')
      }
    })
  }

  const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    setMapCenter({ lat, lng })
    form.setValue('latitude', lat.toString())
    form.setValue('longitude', lng.toString())

    setIsLocationChecked(false)
    setIsCheckingLocation(false)
    form.clearErrors(['latitude', 'longitude'])
  }

  const resetLocationCheck = () => {
    setIsLocationChecked(false)
    setIsCheckingLocation(false)
    form.clearErrors(['latitude', 'longitude'])
    setShowConflictDialog(false)
    setExistingOrganization(null as any)
  }

  return {
    mapCenter,
    setMapCenter,
    existingOrganization,
    showConflictDialog,
    setShowConflictDialog,
    isLocationChecked,
    isCheckingLocation,
    handleCheckLocation,
    handleMapClick,
    resetLocationCheck,
    setExistingOrganization
  }
}

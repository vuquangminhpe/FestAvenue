import { useQuery } from '@tanstack/react-query'
import serviceUserManagementsApis from '@/apis/serviceUserManagement.api'

/**
 * Hook để check xem user hiện tại có phải event owner không
 * @param eventCode - Mã event cần check
 * @param enabled - Có enable query hay không (default: true)
 * @returns isEventOwner - Boolean cho biết user có phải owner không
 */
export const useCheckIsEventOwner = (eventCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['isEventOwner', eventCode],
    queryFn: () => serviceUserManagementsApis.checkUserIsEventOwner(eventCode),
    enabled: !!eventCode && enabled,
    staleTime: 10 * 60 * 1000, // Cache 10 phút (owner status ít thay đổi)
    refetchOnWindowFocus: false
  })
}

/**
 * Hook để lấy quyền của user hiện tại trong event
 * @param eventCode - Mã event cần check quyền
 * @param enabled - Có enable query hay không (default: true)
 * @returns servicePackageIds - Danh sách service package IDs mà user có quyền
 */
export const useUserPermissionsInEvent = (eventCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['userPermissions', eventCode],
    queryFn: () => serviceUserManagementsApis.getPermissionServicesInEventByUser(eventCode),
    enabled: !!eventCode && enabled,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnWindowFocus: false
  })
}

/**
 * Hook để lấy danh sách service packages của event
 * @param eventCode - Mã event cần lấy packages
 * @param enabled - Có enable query hay không (default: true)
 * @returns packageDetail - Chi tiết về package và service packages của event
 */
export const useEventPackages = (eventCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['eventPackages', eventCode],
    queryFn: () => serviceUserManagementsApis.getEventPackageByEventCode(eventCode),
    enabled: !!eventCode && enabled,
    staleTime: 10 * 60 * 1000, // Cache 10 phút
    refetchOnWindowFocus: false
  })
}

/**
 * Hook để check xem user có quyền với service package cụ thể không
 */
export const useHasPermission = (eventCode: string, servicePackageId?: string) => {
  const { data: permissionsData, isLoading } = useUserPermissionsInEvent(eventCode)

  const servicePackageIds = permissionsData?.data?.servicePackageIds || []

  const hasPermission = (packageId: string): boolean => {
    return servicePackageIds.includes(packageId)
  }

  const hasAnyPermission = (packageIds: string[]): boolean => {
    return packageIds.some((id) => servicePackageIds.includes(id))
  }

  const hasAllPermissions = (packageIds: string[]): boolean => {
    return packageIds.every((id) => servicePackageIds.includes(id))
  }

  return {
    servicePackageIds,
    hasPermission: servicePackageId ? hasPermission(servicePackageId) : false,
    hasAnyPermission,
    hasAllPermissions,
    isLoading
  }
}

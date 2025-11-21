import { useQuery } from '@tanstack/react-query'
import serviceUserManagementsApis from '@/apis/serviceUserManagement.api'
import permissionEventApi from '@/apis/permissionEvent.api'
import { useUsersStore } from '@/contexts/app.context'

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
 * @returns servicePackagePermissions - Danh sách quyền của user
 */
export const useUserPermissionsInEvent = (eventCode: string, enabled: boolean = true) => {
  const memberId = useUsersStore((state) => state.isProfile?.id)

  return useQuery({
    queryKey: ['userPermissions', eventCode, memberId],
    queryFn: async () => {
      if (!memberId) return null
      return permissionEventApi.getPermissionEventByMemberId(eventCode, memberId)
    },
    enabled: !!eventCode && !!memberId && enabled,
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

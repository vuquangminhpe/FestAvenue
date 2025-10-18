import { createContext, useContext, type ReactNode } from 'react'
import { useUserPermissionsInEvent } from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'

interface PermissionContextType {
  servicePackageIds: string[]
  isLoading: boolean
  isEventOwner: boolean
  hasPermission: (servicePackageId: string) => boolean
  hasAnyPermission: (servicePackageIds: string[]) => boolean
  hasAllPermissions: (servicePackageIds: string[]) => boolean
  canManageUsers: boolean
  canManageAnalytics: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

interface PermissionProviderProps {
  children: ReactNode
  eventCode: string
  isEventOwner?: boolean
}

export function PermissionProvider({ children, eventCode, isEventOwner = false }: PermissionProviderProps) {
  const { data: permissionsData, isLoading } = useUserPermissionsInEvent(eventCode, !!eventCode)

  const servicePackageIds = permissionsData?.data?.servicePackageIds || []

  const hasPermission = (servicePackageId: string): boolean => {
    // Event owner có tất cả quyền
    if (isEventOwner) return true
    return servicePackageIds.includes(servicePackageId)
  }

  const hasAnyPermission = (packageIds: string[]): boolean => {
    if (isEventOwner) return true
    return packageIds.some((id) => servicePackageIds.includes(id))
  }

  const hasAllPermissions = (packageIds: string[]): boolean => {
    if (isEventOwner) return true
    return packageIds.every((id) => servicePackageIds.includes(id))
  }

  // Chỉ event owner mới được quản lý users và analytics
  const canManageUsers = isEventOwner
  const canManageAnalytics = isEventOwner

  const value: PermissionContextType = {
    servicePackageIds,
    isLoading,
    isEventOwner,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUsers,
    canManageAnalytics
  }

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

import { createContext, useContext, type ReactNode } from 'react'
import { useUserPermissionsInEvent } from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'
import { useQuery } from '@tanstack/react-query'
import permissionEventApi from '@/apis/permissionEvent.api'

interface PermissionContextType {
  servicePackageIds: string[]
  permissions: string[]
  isLoading: boolean
  isEventOwner: boolean
  hasPermission: (servicePackageId: string) => boolean
  hasActionPermission: (actionName: string) => boolean
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
  const { data: permissionsData, isLoading: isLoadingUserPermissions } = useUserPermissionsInEvent(eventCode, !!eventCode && !isEventOwner)
  
  // Fetch all event permissions to map IDs to Names
  const { data: allPermissionsData, isLoading: isLoadingAllPermissions } = useQuery({
    queryKey: ['eventPermissions', eventCode],
    queryFn: () => permissionEventApi.getPermissionEvent(eventCode),
    enabled: !!eventCode && !isEventOwner,
    staleTime: 10 * 60 * 1000
  })

  const isLoading = isLoadingUserPermissions || isLoadingAllPermissions

  // Extract servicePackageIds
  const servicePackageIds: string[] = []
  // Extract all action names
  const permissions: string[] = []

  // Create a map of actionId -> actionName
  const actionIdToNameMap: Record<string, string> = {}
  if (allPermissionsData?.data) {
    allPermissionsData.data.forEach((pkg) => {
      pkg.permissionActions.forEach((action) => {
        actionIdToNameMap[action.permissionActionId] = action.actionName
      })
    })
  }

  const userData = (permissionsData?.data as any)?.[0]
  if (userData?.servicePackagePermissions) {
    userData.servicePackagePermissions.forEach((pkg: any) => {
      servicePackageIds.push(pkg.servicePackageId)
      if (pkg.permissions && Array.isArray(pkg.permissions)) {
        // Map IDs to Names
        const actionNames = pkg.permissions
          .map((id: string) => actionIdToNameMap[id])
          .filter((name: string | undefined) => !!name)
        permissions.push(...actionNames)
      }
    })
  }
 
  const hasPermission = (servicePackageId: string): boolean => {
    if (isEventOwner) return true
    return servicePackageIds.includes(servicePackageId)
  }

  const hasActionPermission = (actionName: string): boolean => {
    if (isEventOwner) return true    
    return permissions.includes(actionName)
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
    permissions,
    isLoading,
    isEventOwner,
    hasPermission,
    hasActionPermission,
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

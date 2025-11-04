import { type ReactNode } from 'react'
import { usePermissions } from '@/contexts/PermissionContext'

interface PermissionGuardProps {
  children: ReactNode
  /** Service package ID required */
  requires?: string
  /** Any of these service package IDs */
  requiresAny?: string[]
  /** All of these service package IDs */
  requiresAll?: string[]
  /** Only event owner */
  requiresEventOwner?: boolean
  /** Fallback content when no permission */
  fallback?: ReactNode
  /**
   * If true, will render children even without permission (for view-only mode)
   * Use this to wrap action buttons - they will be hidden if user doesn't have permission
   */
  hideWithoutPermission?: boolean
}

/**
 * Component để bảo vệ UI dựa trên quyền
 *
 * Mặc định: Chỉ render children nếu user có đủ quyền
 * Với hideWithoutPermission=true: Dùng để ẩn action buttons, page vẫn accessible
 */
export function PermissionGuard({
  children,
  requires,
  requiresAny,
  requiresAll,
  requiresEventOwner,
  fallback = null,
  hideWithoutPermission = false
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isEventOwner, isLoading } = usePermissions()

  // Loading state - có thể customize
  if (isLoading && !hideWithoutPermission) {
    return <>{fallback}</>
  }

  // Check event owner permission
  if (requiresEventOwner && !isEventOwner) {
    return <>{fallback}</>
  }

  // Check single permission
  if (requires && !hasPermission(requires)) {
    return <>{fallback}</>
  }

  // Check any permission
  if (requiresAny && !hasAnyPermission(requiresAny)) {
    return <>{fallback}</>
  }

  // Check all permissions
  if (requiresAll && !hasAllPermissions(requiresAll)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook để check permission trong component logic
 */
export function useCanAccess(options: Omit<PermissionGuardProps, 'children' | 'fallback'>): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isEventOwner, isLoading } = usePermissions()

  if (isLoading) return false

  if (options.requiresEventOwner && !isEventOwner) return false
  if (options.requires && !hasPermission(options.requires)) return false
  if (options.requiresAny && !hasAnyPermission(options.requiresAny)) return false
  if (options.requiresAll && !hasAllPermissions(options.requiresAll)) return false

  return true
}

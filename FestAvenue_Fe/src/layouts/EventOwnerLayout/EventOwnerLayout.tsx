import { type ReactNode, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { cn } from '@/lib/utils'
import path from '@/constants/path'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'
import { getIdFromNameId } from '@/utils/utils'
import { Loader2 } from 'lucide-react'
import { PermissionProvider } from '@/contexts/PermissionContext'

interface EventOwnerLayoutProps {
  children: ReactNode
}

// Map service package names to routes (sử dụng exact name từ backend để tránh conflict)
const SERVICE_PACKAGE_ROUTE_MAP: Record<string, { displayName: string; href: string }> = {
  'Quản lý social medias': {
    displayName: 'Quản lý social medias',
    href: path.user.event_owner.social_media
  },
  'Quản lý thành viên': {
    displayName: 'Quản lý thành viên',
    href: path.user.event_owner.user_management
  },
  'Quản lý vé': {
    displayName: 'Quản lý vé',
    href: path.user.event_owner.ticket_management
  },
  'Thống kê': {
    displayName: 'Thống kê',
    href: path.user.analytics_event.view
  },
  'Quản lý lịch trình': {
    displayName: 'Quản lý lịch',
    href: path.user.schedule.view
  }
}

export default function EventOwnerLayout({ children }: EventOwnerLayoutProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  // Fetch event packages và check owner status
  const { data: eventPackagesData, isLoading: isLoadingPackages } = useEventPackages(eventCode)
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner: boolean =
    ownerCheckData &&
    typeof ownerCheckData === 'object' &&
    'data' in ownerCheckData &&
    typeof ownerCheckData.data === 'boolean'
      ? ownerCheckData.data
      : false
  const packageDetail = eventPackagesData?.data
  const servicePackages = packageDetail?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Build navigation items dựa trên permissions
  const navigation = useMemo(() => {
    // Helper function to append nameId to href
    const appendNameId = (href: string) => {
      return nameId ? `${href}?${nameId}` : href
    }

    const navItems: Array<{ name: string; href: string }> = []

    // Nếu là event owner, hiển thị tất cả routes có trong SERVICE_PACKAGE_ROUTE_MAP
    if (isEventOwner) {
      Object.keys(SERVICE_PACKAGE_ROUTE_MAP).forEach((packageName) => {
        const route = SERVICE_PACKAGE_ROUTE_MAP[packageName]
        navItems.push({
          name: route.displayName,
          href: appendNameId(route.href)
        })
      })
      return navItems
    }

    // Nếu không phải owner, chỉ hiển thị services mà user có permission
    servicePackages.forEach((pkg) => {
      // Check if user has permission for this service package
      if (userServicePackageIds.includes(pkg.id)) {
        const route = SERVICE_PACKAGE_ROUTE_MAP[pkg.name]
        if (route) {
          navItems.push({
            name: route.displayName,
            href: appendNameId(route.href)
          })
        }
      }
    })

    return navItems
  }, [isEventOwner, userServicePackageIds, servicePackages, nameId])

  // Loading state
  if (isLoadingPackages || isCheckingOwner || isLoadingPermissions) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white flex items-center justify-center'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
          <span className='text-gray-600 font-medium'>Đang tải thông tin sự kiện...</span>
        </div>
      </div>
    )
  }

  return (
    <PermissionProvider eventCode={eventCode} isEventOwner={isEventOwner}>
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
        {/* Navigation Pills - Centered */}
        <div className='sticky top-0 z-40 py-6'>
          <div className='container mx-auto px-4'>
            <div className='flex justify-center'>
              <nav className='bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-3 py-3 flex items-center gap-2'>
                {navigation.map((item) => {
                  // Extract pathname from href (remove query params for comparison)
                  const itemPath = item.href.split('?')[0]
                  const isActive = location.pathname === itemPath
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300',
                        'hover:shadow-md hover:scale-105',
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg shadow-cyan-200/50'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600'
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className='container mx-auto px-4 py-8'>{children}</main>
      </div>
    </PermissionProvider>
  )
}

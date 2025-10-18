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

interface EventOwnerLayoutProps {
  children: ReactNode
}

// Map service package names to navigation items
const getNavigationItems = (servicePackageIds: string[], servicePackages: any[]) => {
  const navigationMap = [
    {
      name: 'Quản lý social media',
      href: path.user.event_owner.social_media,
      matchNames: ['Social Media Management', 'Social Media', 'Quản lý mạng xã hội']
    },
    {
      name: 'Quản người dùng',
      href: path.user.event_owner.user_management,
      isAlwaysVisible: true // User management luôn hiển thị cho mọi user trong event
    },
    {
      name: 'Quản lý lịch',
      href: path.user.schedule.view,
      matchNames: ['Schedule Management', 'Lịch trình', 'Schedule']
    },
    {
      name: 'Quản lý vé',
      href: path.user.event_owner.ticket_management,
      matchNames: ['Ticket Management', 'Quản lý vé', 'Ticketing']
    },
    {
      name: 'Thống kê',
      href: path.user.analytics_event.view,
      ownerOnly: true // Chỉ event owner mới thấy
    }
  ]

  return navigationMap.filter((item) => {
    // Nếu là owner only, chỉ return nếu có permission context
    if (item.ownerOnly) return true
    // Nếu luôn hiển thị
    if (item.isAlwaysVisible) return true
    // Nếu không có matchNames, ẩn item
    if (!item.matchNames) return false

    // Check xem có service package nào match không
    return servicePackages.some(
      (pkg) => servicePackageIds.includes(pkg.id) && item.matchNames?.some((name) => pkg.name.includes(name))
    )
  })
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

  const isEventOwner = ownerCheckData?.data?.data || false
  const packageDetail = eventPackagesData?.data
  const servicePackages = packageDetail?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Build navigation items dựa trên permissions
  const navigation = useMemo(() => {
    // Nếu là event owner, hiển thị tất cả
    if (isEventOwner) {
      return [
        { name: 'Quản lý social medias', href: path.user.event_owner.social_media },
        { name: 'Quản người dùng', href: path.user.event_owner.user_management },
        { name: 'Quản lý lịch', href: path.user.schedule.view },
        { name: 'Quản lý vé', href: path.user.event_owner.ticket_management },
        { name: 'Thống kê', href: path.user.analytics_event.view }
      ]
    }

    // Nếu không phải owner, filter theo service packages
    return getNavigationItems(userServicePackageIds, servicePackages)
  }, [isEventOwner, userServicePackageIds, servicePackages])

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
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
      {/* Navigation Pills - Centered */}
      <div className='sticky top-0 z-40 py-6'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center'>
            <nav className='bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-3 py-3 flex items-center gap-2'>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
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
  )
}

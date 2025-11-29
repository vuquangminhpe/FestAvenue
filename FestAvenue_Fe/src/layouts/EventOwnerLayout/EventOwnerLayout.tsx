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
import { Loader2, Lock } from 'lucide-react'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { useGetEventByCode } from '@/pages/User/Auth/Event/EventDetails/hooks'

interface EventOwnerLayoutProps {
  children: ReactNode
}

// Map service package names to routes (sử dụng exact name từ backend để tránh conflict)
const SERVICE_PACKAGE_ROUTE_MAP: Record<string, { displayName: string; href: string }> = {
  'Quản lý bài viết truyền thông': {
    displayName: 'Quản lý bài viết truyền thông',
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
  },
  'Quét mã vé sự kiện': {
    displayName: 'Quét mã vé sự kiện',
    href: path.user.scanQR.view
  }
}

export default function EventOwnerLayout({ children }: EventOwnerLayoutProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  // Fetch event packages và check owner status
  const { isLoading: isLoadingPackages } = useEventPackages(eventCode)
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)
  const { data: dataEventCodeDetail } = useGetEventByCode(eventCode)
  const isEventOwner: boolean =
    ownerCheckData &&
    typeof ownerCheckData === 'object' &&
    'data' in ownerCheckData &&
    typeof ownerCheckData.data === 'boolean'
      ? ownerCheckData.data
      : false

  // Check if event is currently active (between start and end time)
  const isEventActive = useMemo(() => {
    if (!dataEventCodeDetail?.startTimeEventTime || !dataEventCodeDetail?.endTimeEventTime) {
      return false
    }
    const eventStartTime = new Date(dataEventCodeDetail.startTimeEventTime)
    const eventEndTime = new Date(dataEventCodeDetail.endTimeEventTime)
    const now = new Date()
    return now >= eventStartTime && now < eventEndTime
  }, [dataEventCodeDetail])

  // Build navigation items - Hiển thị tất cả services cho mọi người
  const navigation = useMemo(() => {
    // Helper function to append nameId to href
    const appendNameId = (href: string) => {
      return nameId ? `${href}?${nameId}` : href
    }

    const navItems: Array<{ name: string; href: string }> = []

    // Hiển thị tất cả routes có trong SERVICE_PACKAGE_ROUTE_MAP cho mọi user
    // Logic phân quyền action sẽ được xử lý trong từng page
    Object.keys(SERVICE_PACKAGE_ROUTE_MAP).forEach((packageName) => {
      const route = SERVICE_PACKAGE_ROUTE_MAP[packageName]
      navItems.push({
        name: route.displayName,
        href: appendNameId(route.href)
      })
    })

    return navItems
  }, [nameId])

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

                  // Check if this is the QR scan feature and event is not active
                  const isScanQR = item.name === 'Quét mã vé sự kiện'
                  const isDisabled = isScanQR && !isEventActive

                  // If disabled, render as disabled button with tooltip
                  if (isDisabled) {
                    return (
                      <div key={item.name} className='relative group'>
                        <button
                          disabled
                          className={cn(
                            'px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300',
                            'bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2',
                            'opacity-60'
                          )}
                          title='Tính năng chỉ mở khi sự kiện đã bắt đầu, vui lòng chờ đến thời gian'
                        >
                          <Lock className='w-4 h-4' />
                          {item.name}
                        </button>
                        {/* Tooltip */}
                        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
                          Tính năng chỉ mở khi sự kiện đã bắt đầu
                          <div className='absolute top-full left-1/2 transform -translate-x-1/2 -mt-1'>
                            <div className='border-4 border-transparent border-t-gray-800'></div>
                          </div>
                        </div>
                      </div>
                    )
                  }

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

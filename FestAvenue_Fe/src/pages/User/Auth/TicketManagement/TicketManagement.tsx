import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Ticket as TicketIcon, Armchair, Lock, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import TicketConfig from './components/TicketConfig'
import EditorSeat from '@/components/custom/EditorSeat/EditorSeat'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'

type TabType = 'ticket-config' | 'seat-setup'

export default function TicketManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventIdSplit = nameId.split('-')
  const eventId = eventIdSplit[eventIdSplit.length - 1]
  const eventCode = getIdFromNameId(nameId)

  // Check permissions
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner = ownerCheckData?.data || false
  const servicePackages = eventPackagesData?.data?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Tìm service package ID cho Ticket Management (sử dụng exact name từ backend)
  const TICKET_PACKAGE_NAME = 'Quản lý vé'
  const ticketPackage = servicePackages.find((pkg: any) => pkg.name === TICKET_PACKAGE_NAME)
  const hasTicketPermission = isEventOwner || (ticketPackage && userServicePackageIds.includes(ticketPackage.id))

  const [activeTab, setActiveTab] = useState<TabType>('ticket-config')

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      '.ticket-management-container',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  // Tab switch animation
  const handleTabChange = (tab: TabType) => {
    gsap.to('.content-area', {
      opacity: 0,
      x: -20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab)
        gsap.fromTo('.content-area', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
      }
    })
  }

  // Loading state
  if (isCheckingOwner || isLoadingPermissions) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex items-center justify-center'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
          <span className='text-gray-600 font-medium'>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    )
  }

  // Permission denied
  if (!hasTicketPermission) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex items-center justify-center'>
        <div className='max-w-md text-center'>
          <div className='mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-6'>
            <Lock className='w-10 h-10 text-red-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>Không có quyền truy cập</h2>
          <p className='text-gray-600 mb-6'>
            Bạn không có quyền quản lý vé cho sự kiện này. Vui lòng liên hệ chủ sự kiện để được cấp quyền.
          </p>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <strong>Gợi ý:</strong> Chủ sự kiện có thể cấp quyền cho bạn thông qua trang Quản người dùng.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='ticket-management-container min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50'>
      <div className='flex flex-col h-screen'>
        {/* Top Header with Horizontal Tabs */}
        <div className='bg-white border-b border-gray-200 shadow-sm flex-shrink-0'>
          {/* Horizontal Tabs */}
          <div className='px-8 flex gap-2 border-t border-gray-100'>
            <button
              onClick={() => handleTabChange('ticket-config')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'ticket-config'
                  ? 'border-cyan-400 text-cyan-600 bg-cyan-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TicketIcon className='w-5 h-5' />
              <span>Cấu hình vé</span>
            </button>

            <button
              onClick={() => handleTabChange('seat-setup')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'seat-setup'
                  ? 'border-cyan-400 text-cyan-600 bg-cyan-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Armchair className='w-5 h-5' />
              <span>Thiết lập chỗ ngồi</span>
            </button>
          </div>
        </div>

        {/* Main Content Area - Full Width */}
        <div className='flex-1 overflow-hidden'>
          {activeTab === 'seat-setup' ? (
            /* Full-height mode for EditorSeat (allows zoom) */
            <div className='content-area h-full overflow-hidden'>
              <EditorSeat eventCode={eventCode} eventId={eventId} />
            </div>
          ) : (
            /* Standard scrollable mode for TicketConfig */
            <div className='content-area h-full overflow-y-auto p-8'>
              <TicketConfig />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

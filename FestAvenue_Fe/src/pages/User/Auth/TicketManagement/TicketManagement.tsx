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
      <div className='flex h-screen'>
        {/* Sidebar Navigation */}
        <div className='w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col'>
          {/* Header */}
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
              Quản lý vé
            </h2>
            <p className='text-xs text-gray-500 mt-1'>Cấu hình vé và chỗ ngồi</p>
          </div>

          {/* Tab Navigation */}
          <nav className='flex-1 p-4'>
            <div className='space-y-2'>
              <button
                onClick={() => handleTabChange('ticket-config')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'ticket-config'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg shadow-cyan-200/50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TicketIcon className='w-5 h-5' />
                <span className='font-medium'>Cấu hình vé</span>
              </button>

              <button
                onClick={() => handleTabChange('seat-setup')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'seat-setup'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg shadow-cyan-200/50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Armchair className='w-5 h-5' />
                <span className='font-medium'>Thiết lập chỗ ngồi</span>
              </button>
            </div>
          </nav>

          {/* Footer Info */}
          <div className='p-4 border-t border-gray-200 bg-gray-50'>
            <div className='text-xs text-gray-500'>
              <p className='font-semibold text-gray-700 mb-1'>Hướng dẫn:</p>
              <ul className='space-y-1 pl-3'>
                <li className='list-disc'>Cấu hình vé trước</li>
                <li className='list-disc'>Sau đó setup chỗ ngồi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className='flex-1 overflow-hidden'>
          <div className='h-full overflow-y-auto'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200 px-8 py-6 shadow-sm'>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
                {activeTab === 'ticket-config' ? 'Quản lý vé trong sự kiện' : 'Thiết lập chỗ ngồi'}
              </h1>
              <p className='text-gray-600 mt-2'>
                {activeTab === 'ticket-config'
                  ? 'Quản lý và theo dõi tất cả các loại vé của sự kiện'
                  : 'Thiết kế và quản lý sơ đồ chỗ ngồi cho sự kiện'}
              </p>
            </div>

            {/* Content */}
            <div className='content-area p-8'>
              {activeTab === 'ticket-config' ? <TicketConfig /> : <EditorSeat eventCode={eventCode} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

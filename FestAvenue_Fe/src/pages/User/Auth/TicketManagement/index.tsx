import { useState, useEffect } from 'react'
import { Ticket as TicketIcon, Armchair } from 'lucide-react'
import gsap from 'gsap'
import TicketConfig from './components/TicketConfig'
import EditorSeat from '@/components/custom/EditorSeat/EditorSeat'

type TabType = 'ticket-config' | 'seat-setup'

export default function TicketManagement() {
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
              {activeTab === 'ticket-config' ? <TicketConfig /> : <EditorSeat />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

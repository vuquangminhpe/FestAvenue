import { useUsersStore } from '@/contexts/app.context'
import { Building, X, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

interface OrganizationNotificationProps {
  isVisible?: boolean
  onClose?: () => void
}

export default function OrganizationNotification({ isVisible = true, onClose }: OrganizationNotificationProps) {
  const profile = useUsersStore((state) => state.isProfile)
  const [internalVisible, setInternalVisible] = useState(true)

  // Reset internal visibility when isVisible prop changes from false to true
  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true)
    }
  }, [isVisible])

  if (!profile || profile.organization || !isVisible || !internalVisible) {
    return null
  }

  const handleClose = () => {
    setInternalVisible(false)
    onClose?.()
  }

  return (
    <div className='fixed top-21 z-[9999] right-4 max-w-sm bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl shadow-lg  animate-in slide-in-from-right-full duration-300'>
      <div className='relative p-4'>
        {/* Close button */}
        <button
          onClick={handleClose}
          className='absolute top-2 right-2 p-1 rounded-full hover:bg-white/50 transition-colors'
        >
          <X className='h-4 w-4 text-gray-500 hover:text-gray-700' />
        </button>

        {/* Icon */}
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div className='w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-300 rounded-full flex items-center justify-center shadow-md'>
              <Building className='h-6 w-6 text-white' />
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-2 mb-1'>
              <h3 className='text-sm font-semibold text-gray-900'>Tạo tổ chức của bạn</h3>
              <div className='w-2 h-2 bg-cyan-500 rounded-full animate-pulse'></div>
            </div>

            <p className='text-xs text-gray-600 leading-relaxed mb-3'>
              Bạn chưa có tổ chức nào. Tạo tổ chức để quản lý sự kiện một cách chuyên nghiệp!
            </p>

            {/* Action buttons */}
            <div className='flex space-x-2'>
              <Link
                to='/create-organization'
                className='inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-300 text-white text-xs font-medium rounded-lg hover:from-cyan-500 hover:to-blue-400 transition-all duration-200 shadow-sm hover:shadow-md'
              >
                <Plus className='h-3 w-3 mr-1' />
                Tạo ngay
              </Link>

              <button
                onClick={handleClose}
                className='inline-flex items-center px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200'
              >
                Để sau
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className='mt-3 pt-2 border-t border-cyan-100'>
          <div className='flex items-center space-x-1 text-xs text-gray-500'>
            <div className='w-1 h-1 bg-cyan-400 rounded-full'></div>
            <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
            <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
            <span className='ml-1'>Bước 1/3: Thiết lập tổ chức</span>
          </div>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-blue-300/10 pointer-events-none'></div>
    </div>
  )
}

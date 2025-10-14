import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import path from '@/constants/path'

interface EventOwnerLayoutProps {
  children: ReactNode
}

const navigation = [
  {
    name: 'Quản lý social media',
    href: path.user.event_owner.social_media
  },
  {
    name: 'Quản người dùng',
    href: path.user.event_owner.user_management
  },
  {
    name: 'Quản lý lịch',
    href: path.user.schedule.view
  },
  {
    name: 'Quản lý vé',
    href: path.user.event_owner.ticket_management
  },
  {
    name: 'Thống kê',
    href: path.user.analytics_event.view
  }
]

export default function EventOwnerLayout({ children }: EventOwnerLayoutProps) {
  const location = useLocation()

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
      {/* Navigation Tabs */}
      <div className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-1 overflow-x-auto scrollbar-hide py-4'>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300',
                    'hover:shadow-md hover:scale-105',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg shadow-cyan-200'
                      : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600'
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>{children}</main>
    </div>
  )
}

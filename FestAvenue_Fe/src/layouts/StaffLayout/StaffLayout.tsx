import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { MessageCircle, Menu, X, Users, Settings, LogOut, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaffStore } from '@/contexts/app.context'
import path from '@/constants/path'

interface StaffLayoutProps {
  children: ReactNode
}

const StaffLayout = ({ children }: StaffLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const setIsLogin = useStaffStore((state) => state.setIsLogin)

  const menuItems = [
    {
      label: 'Messages',
      icon: MessageCircle,
      path: path.staff.messages,
      description: 'Quản lý tin nhắn và group chat'
    },
    {
      label: 'Event Management',
      icon: Calendar,
      path: path.staff.events,
      description: 'Quản lý và phê duyệt sự kiện'
    },
    {
      label: 'Users',
      icon: Users,
      path: path.staff.users,
      description: 'Quản lý người dùng'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: path.staff.settings,
      description: 'Cài đặt hệ thống'
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setIsLogin(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          {sidebarOpen && <h1 className='text-xl font-bold text-gray-800'>Staff Panel</h1>}
          <Button variant='ghost' size='sm' onClick={() => setSidebarOpen(!sidebarOpen)} className='hover:bg-gray-100'>
            {sidebarOpen ? <X className='w-4 h-4' /> : <Menu className='w-4 h-4' />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className='flex-1 p-2'>
          <ul className='space-y-1'>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    {sidebarOpen && (
                      <div>
                        <span className='font-medium'>{item.label}</span>
                        <p className='text-xs text-gray-500 mt-0.5'>{item.description}</p>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className='p-2 border-t border-gray-200'>
          <Button
            variant='ghost'
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 ${
              !sidebarOpen ? 'px-2' : ''
            }`}
          >
            <LogOut className='w-5 h-5' />
            {sidebarOpen && <span>Đăng xuất</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Top Bar */}
        <div className='bg-white shadow-sm border-b border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-800'>Staff Dashboard</h2>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>Staff Mode</span>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-6 overflow-auto'>{children}</div>
      </div>
    </div>
  )
}

export default StaffLayout

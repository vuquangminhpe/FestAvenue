import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Shield, Menu, X, Users, Settings, BarChart3, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/contexts/app.context'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const setIsLogin = useAdminStore((state) => state.setIsLogin)

  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/admin/dashboard',
      description: 'Tổng quan hệ thống'
    },
    {
      label: 'Users',
      icon: Users,
      path: '/admin/users',
      description: 'Quản lý người dùng'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      description: 'Cài đặt hệ thống'
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsLogin(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div
        className={`bg-slate-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          {sidebarOpen && (
            <div className='flex items-center gap-2'>
              <Shield className='w-6 h-6 text-blue-400' />
              <h1 className='text-xl font-bold'>Admin Panel</h1>
            </div>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='hover:bg-slate-700 text-white'
          >
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
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    {sidebarOpen && (
                      <div>
                        <span className='font-medium'>{item.label}</span>
                        <p className='text-xs text-slate-400 mt-0.5'>{item.description}</p>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className='p-2 border-t border-slate-700'>
          <Button
            variant='ghost'
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-red-400 hover:bg-red-900 hover:text-red-300 ${
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
            <h2 className='text-lg font-semibold text-gray-800'>Admin Dashboard</h2>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>Administrator</span>
              <div className='w-2 h-2 bg-red-500 rounded-full'></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-6 overflow-auto'>{children}</div>
      </div>
    </div>
  )
}

export default AdminLayout

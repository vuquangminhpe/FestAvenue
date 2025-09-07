import path from '@/constants/path'
import LOGO_IMG from '../../../../../public/Images/Fest.png'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { getAccessTokenFromLS, clearLocalStorage } from '@/utils/auth'
import { Search, Heart, HelpCircle, User, LogOut, Menu, X } from 'lucide-react'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName] = useState('Emily')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessTokenFromLS()
      setIsAuthenticated(!!token)
    }

    checkAuth()

    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen, isUserMenuOpen])

  const handleLogout = () => {
    clearLocalStorage()
    setIsAuthenticated(false)
    setIsUserMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  return (
    <header className='w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50'>
      <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Main Header */}
        <div className='flex items-center justify-between h-16 lg:h-20'>
          {/* Logo */}
          <div className='flex items-center'>
            <div className='flex items-center'>
              <Link to='/' className='flex items-center hover:opacity-80 transition-opacity'>
                <img src={LOGO_IMG} className='w-[160px] h-full object-contain' alt='Fest Avenue Logo' />
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className='hidden lg:flex flex-1 max-w-[400px] lg:w-[400px] md:w-[200px] sm:w-full mx-8'>
              <form onSubmit={handleSearch} className='w-full'>
                <div className='relative flex items-center'>
                  <Search className='absolute left-4 h-5 w-5 text-gray-400' />
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Tìm kiếm sự kiện...'
                    className='w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 hover:bg-gray-100'
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center space-x-1'>
            {!isAuthenticated ? (
              <>
                <Link
                  to='/events'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                >
                  Tìm sự kiện
                </Link>
                <Link
                  to='/create-event'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                >
                  Tạo sự kiện
                </Link>
                <Link
                  to='/help'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1'
                >
                  <HelpCircle className='h-4 w-4' />
                  <span>Trợ giúp</span>
                </Link>
                <div className='w-px h-6 bg-gray-300 mx-2' />
                <Link
                  to={path.auth.login}
                  className='px-4 py-2 text-gray-700 hover:text-cyan-400 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                >
                  Đăng nhập
                </Link>
                <Link
                  to={path.auth.signup}
                  className='px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link
                  to='/create-event'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                >
                  Tạo sự kiện
                </Link>
                <Link
                  to='/favorites'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1'
                >
                  <Heart className='h-4 w-4' />
                  <span className='hidden xl:inline'>Yêu thích</span>
                </Link>
                <Link
                  to='/help'
                  className='px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1'
                >
                  <HelpCircle className='h-4 w-4' />
                  <span className='hidden xl:inline'>Trợ giúp</span>
                </Link>
                <div className='w-px h-6 bg-gray-300 mx-2' />

                {/* User Profile Dropdown */}
                <div className='relative'>
                  <button
                    onClick={toggleUserMenu}
                    className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center'>
                      <User className='h-5 w-5 text-white' />
                    </div>
                    <span className='font-medium text-gray-700 hidden xl:inline'>{userName}</span>
                  </button>

                  {/* Desktop User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200'>
                      <div className='py-2'>
                        <Link
                          to='/profile'
                          className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Hồ sơ của tôi
                        </Link>
                        <Link
                          to='/my-events'
                          className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Sự kiện của tôi
                        </Link>
                        <Link
                          to='/settings'
                          className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Cài đặt
                        </Link>
                        <div className='border-t border-gray-100 my-1' />
                        <button
                          onClick={handleLogout}
                          className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2'
                        >
                          <LogOut className='h-4 w-4' />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleMobileMenu} className='lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors'>
            {isMobileMenuOpen ? <X className='h-6 w-6 text-gray-600' /> : <Menu className='h-6 w-6 text-gray-600' />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className='lg:hidden pb-4'>
          <form onSubmit={handleSearch} className='w-full'>
            <div className='relative flex items-center'>
              <Search className='absolute left-3 h-5 w-5 text-gray-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm sự kiện...'
                className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500'
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className='lg:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-5 duration-200'>
          <div className='px-4 py-2 space-y-1'>
            {!isAuthenticated ? (
              <>
                <Link
                  to='/events'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tìm sự kiện
                </Link>
                <Link
                  to='/create-event'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tạo sự kiện
                </Link>
                <Link
                  to='/help'
                  className='flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className='h-4 w-4' />
                  <span>Trợ giúp</span>
                </Link>
                <div className='border-t border-gray-100 my-2' />
                <Link
                  to={path.auth.login}
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to={path.auth.signup}
                  className='block mx-4 my-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-center'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className='flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-2'>
                  <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center'>
                    <User className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>{userName}</p>
                    <p className='text-sm text-gray-500'>Đã đăng nhập</p>
                  </div>
                </div>

                <Link
                  to='/create-event'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tạo sự kiện
                </Link>
                <Link
                  to='/favorites'
                  className='flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className='h-4 w-4' />
                  <span>Yêu thích</span>
                </Link>
                <Link
                  to='/help'
                  className='flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className='h-4 w-4' />
                  <span>Trợ giúp</span>
                </Link>
                <div className='border-t border-gray-100 my-2' />
                <Link
                  to='/profile'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hồ sơ của tôi
                </Link>
                <Link
                  to='/my-events'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sự kiện của tôi
                </Link>
                <Link
                  to='/settings'
                  className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cài đặt
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className='w-full text-left flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <LogOut className='h-4 w-4' />
                  <span>Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

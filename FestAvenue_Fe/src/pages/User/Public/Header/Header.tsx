import path from '@/constants/path'
import LOGO_IMG from '../../../../../public/Images/logo.png'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { getAccessTokenFromLS, clearLocalStorage } from '@/utils/auth'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessTokenFromLS()
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    clearLocalStorage()
    setIsAuthenticated(false)
  }

  return (
    <div className='w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-xl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo and Brand */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center'>
              <img src={LOGO_IMG} className='rounded-full size-14 object-cover ring-2 ring-white/30' alt='Logo' />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-white text-xl font-bold tracking-wide'>Fest Avenue</h1>
              <p className='text-white/80 text-sm'>Premium Events</p>
            </div>
          </div>

          {/* Navigation */}
          <div className='flex items-center space-x-6'>
            {!isAuthenticated ? (
              <>
                <Link
                  to={path.auth.login}
                  className='text-white hover:text-white/80 font-medium transition-all duration-200 hover:scale-105'
                >
                  Login
                </Link>
                <Link
                  to={path.auth.signup}
                  className='bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/30'
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className='flex items-center space-x-4'>
                <div className='text-white font-medium'>
                  Welcome back!
                </div>
                <button
                  onClick={handleLogout}
                  className='bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

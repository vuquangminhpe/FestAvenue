import path from '@/constants/path'
import LOGO_IMG from '../../../../../public/Images/Fest.png'
import { Link, useNavigate, useLocation } from 'react-router'
import { useEffect, useState, useMemo } from 'react'
import { clearLocalStorage } from '@/utils/auth'
import { Search, Heart, LogOut, Menu, X, Building, HelpCircle, Headphones, Loader2 } from 'lucide-react'
import { useUsersStore } from '@/contexts/app.context'
import LOGO_DEFAULT from '../../../../../public/Images/FestDefault.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Joyride, { type Step, type CallBackProps, STATUS } from 'react-joyride'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import chatApi from '@/apis/chat.api'
import { toast } from 'sonner'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useUsersStore((data) => data.isAuth)
  const profile = useUsersStore((data) => data.isProfile)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showOrgNotification, setShowOrgNotification] = useState(true)
  const [isConnectingStaff, setIsConnectingStaff] = useState(false)

  // Joyride states
  const [runTour, setRunTour] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  // Detect if we're on MyEvents page
  const isMyEventsPage = location.pathname.includes('/my/events')

  // MyEvents page tour steps
  const myEventsSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className='space-y-3'>
          <h3 className='text-xl font-bold text-gray-900'>Hướng dẫn quản lý sự kiện 📋</h3>
          <p className='text-gray-600'>Hãy để chúng tôi hướng dẫn bạn các tính năng quản lý sự kiện của bạn.</p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true
    },
    {
      target: '.create-event-btn',
      content: 'Nhấn vào đây để tạo một sự kiện mới. Bạn sẽ được hướng dẫn qua từng bước thiết lập sự kiện.',
      placement: 'bottom' as const
    },
    {
      target: '.search-events',
      content: 'Tìm kiếm nhanh sự kiện của bạn theo tên hoặc mô tả.',
      placement: 'bottom' as const
    },
    {
      target: '.tab-my-events',
      content:
        'Tab này hiển thị tất cả các sự kiện đang hoạt động của bạn - những sự kiện đã được duyệt và đang diễn ra.',
      placement: 'bottom' as const
    },
    {
      target: '.tab-pending-rejected',
      content:
        'Theo dõi các sự kiện đang chờ duyệt hoặc bị từ chối. Bạn có thể chỉnh sửa và gửi lại sự kiện bị từ chối.',
      placement: 'bottom' as const
    },
    {
      target: '.tab-invitations',
      content: 'Xem các lời mời tham gia vào sự kiện từ các tổ chức khác.',
      placement: 'bottom' as const
    },
    {
      target: '.event-table',
      content:
        'Bảng quản lý chi tiết sự kiện với các thông tin về trạng thái, thời gian, vé và các hành động bạn có thể thực hiện.',
      placement: 'top' as const
    },
    {
      target: 'body',
      content: (
        <div className='space-y-3'>
          <h3 className='text-lg font-bold text-gray-900'>Các trạng thái sự kiện:</h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li>
              <strong className='text-blue-600'>Chọn gói:</strong> Sự kiện đang chờ bạn chọn gói dịch vụ
            </li>
            <li>
              <strong className='text-yellow-600'>Chờ duyệt:</strong> Sự kiện đang được admin xem xét
            </li>
            <li>
              <strong className='text-green-600'>Đã duyệt:</strong> Sự kiện đã được phê duyệt và hiển thị công khai
            </li>
            <li>
              <strong className='text-red-600'>Từ chối:</strong> Sự kiện bị từ chối, bạn có thể chỉnh sửa và gửi lại
            </li>
            <li>
              <strong className='text-gray-600'>Hủy bỏ:</strong> Sự kiện đã bị hủy
            </li>
          </ul>
        </div>
      ),
      placement: 'center' as const
    },
    {
      target: 'body',
      content: (
        <div className='space-y-3'>
          <h3 className='text-xl font-bold text-gray-900'>Hoàn tất! ✨</h3>
          <p className='text-gray-600'>
            Bạn đã nắm được các tính năng quản lý sự kiện. Chúc bạn tổ chức sự kiện thành công!
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            Bạn có thể xem lại hướng dẫn bất cứ lúc nào bằng nút "Hướng dẫn".
          </p>
        </div>
      ),
      placement: 'center' as const
    }
  ]

  // Home page tour steps
  const homeSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className='space-y-3'>
          <h3 className='text-xl font-bold text-gray-900'>Chào mừng đến với FestAvenue!</h3>
          <p className='text-gray-600'>Hãy để chúng tôi hướng dẫn bạn khám phá các tính năng của nền tảng.</p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true
    },
    {
      target: '.search-bar',
      content: 'Tìm kiếm sự kiện yêu thích của bạn bằng tên, từ khóa hoặc thể loại.',
      placement: 'bottom' as const
    },
    {
      target: '.nav-events',
      content: 'Khám phá tất cả các sự kiện đang diễn ra và sắp tới.',
      placement: 'bottom' as const
    },
    {
      target: '.nav-create',
      content: 'Tạo sự kiện của riêng bạn một cách dễ dàng và chuyên nghiệp.',
      placement: 'bottom' as const
    },
    ...(isAuthenticated
      ? [
          {
            target: '.nav-favorites',
            content: 'Xem lại các sự kiện bạn đã yêu thích.',
            placement: 'bottom' as const
          },
          {
            target: '.user-menu',
            content: 'Quản lý hồ sơ, sự kiện của bạn và các tùy chỉnh tài khoản.',
            placement: 'bottom' as const
          }
        ]
      : [
          {
            target: '.nav-login',
            content: 'Đăng nhập để trải nghiệm đầy đủ các tính năng.',
            placement: 'bottom' as const
          }
        ]),
    {
      target: 'body',
      content: (
        <div className='space-y-3'>
          <h3 className='text-xl font-bold text-gray-900'>Hoàn tất! </h3>
          <p className='text-gray-600'>Bạn đã sẵn sàng khám phá FestAvenue. Chúc bạn có trải nghiệm tuyệt vời!</p>
          <p className='text-sm text-gray-500 mt-2'>
            Bạn có thể xem lại hướng dẫn bất cứ lúc nào bằng nút "Hướng dẫn".
          </p>
        </div>
      ),
      placement: 'center' as const
    }
  ]

  // Dynamically select tour steps based on current page
  const tourSteps = useMemo(() => {
    return isMyEventsPage ? myEventsSteps : homeSteps
  }, [isMyEventsPage])

  // Check first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('festAvenue_hasVisited')
    if (!hasVisited) {
      // Show welcome dialog after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRunTour(false)
    }
  }

  const startTour = () => {
    setShowWelcome(false)
    setRunTour(true)
    localStorage.setItem('festAvenue_hasVisited', 'true')
  }

  const dismissWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('festAvenue_hasVisited', 'true')
  }

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
    setIsUserMenuOpen(false)
    window.location.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${path.events}?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('') // Clear search after navigation
    }
  }

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleConnectStaff = async () => {
    if (!profile?.id || isConnectingStaff) return

    setIsConnectingStaff(true)
    try {
      const response = await chatApi.GroupChat.addGroupSupport(profile.id)
      if (response?.data) {
        toast.success('Đã kết nối với hỗ trợ! Kiểm tra tin nhắn trong Chat.')
      }
    } catch (error) {
      console.error('Error connecting to staff:', error)
      toast.error('Không thể kết nối với hỗ trợ')
    } finally {
      setIsConnectingStaff(false)
    }
  }

  return (
    <>
      {/* Joyride Tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#06b6d4',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000
          },
          tooltip: {
            borderRadius: 12,
            padding: 20
          },
          buttonNext: {
            backgroundColor: '#06b6d4',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500
          },
          buttonBack: {
            color: '#6b7280',
            marginRight: 10
          },
          buttonSkip: {
            color: '#ef4444'
          }
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          skip: 'Bỏ qua'
        }}
      />

      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-center'>Chào mừng đến với FestAvenue!</DialogTitle>
            <DialogDescription className='text-center space-y-3 pt-4'>
              <div className='text-base text-gray-600'>Lần đầu tiên ghé thăm trang web của chúng tôi?</div>
              <div className='bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-4'>
                <p className='text-sm text-cyan-900 font-medium'>
                  Nếu bạn cảm thấy khó khăn khi sử dụng, hãy bấm vào nút{' '}
                  <span className='inline-flex items-center gap-1 bg-cyan-100 px-2 py-1 rounded'>
                    <HelpCircle className='h-4 w-4' />
                    Hướng dẫn
                  </span>{' '}
                  để chúng tôi hỗ trợ bạn tốt hơn nhé!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex gap-2'>
            <Button variant='outline' onClick={dismissWelcome} className='flex-1'>
              Để sau
            </Button>
            <Button
              onClick={startTour}
              className='flex-1 bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400'
            >
              Bắt đầu hướng dẫn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className='w-full z-[50] bg-white shadow-lg border-b border-gray-200 sticky top-0'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Main Header */}
          <div className='flex items-center justify-between h-16 lg:h-20'>
            {/* Logo */}
            <div className='flex items-center'>
              <div className='flex items-center'>
                <Link to={path.asHome} className='flex items-center hover:opacity-80 transition-opacity'>
                  <img src={LOGO_IMG} className='w-[160px] h-full object-contain' alt='Fest Avenue Logo' />
                </Link>
              </div>

              {/* Desktop Search Bar */}
              <div className='hidden lg:flex flex-1 max-w-[300px] lg:w-[300px] md:w-[200px] sm:w-full mx-8'>
                <form onSubmit={handleSearch} className='w-full'>
                  <div className='relative flex items-center search-bar'>
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
                    to={path.events}
                    className='nav-events px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    Tìm sự kiện
                  </Link>
                  <Link
                    to={isAuthenticated ? path.user.event.create_event : path.auth.login}
                    className='nav-create px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    Tạo sự kiện
                  </Link>

                  <div className='w-px h-6 bg-gray-300 mx-2' />

                  {/* Guide Button */}
                  <button
                    onClick={() => setRunTour(true)}
                    className='px-4 py-2 text-cyan-600 hover:text-cyan-700 font-medium rounded-lg hover:bg-cyan-50 transition-all duration-200 flex items-center space-x-1'
                    title='Hướng dẫn sử dụng'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span>Hướng dẫn</span>
                  </button>

                  <div className='w-px h-6 bg-gray-300 mx-2' />
                  <Link
                    to={path.auth.login}
                    className='nav-login px-4 py-2 text-gray-700 hover:text-cyan-400 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={path.auth.signup}
                    className='px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-full  shadow-lg '
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={path.events}
                    className='nav-events px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    Tìm sự kiện
                  </Link>
                  <Link
                    to={isAuthenticated ? path.user.event.create_event : path.auth.login}
                    className='nav-create px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200'
                  >
                    Tạo sự kiện
                  </Link>
                  <Link
                    to={path.user.my.favorites}
                    className='nav-favorites px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1'
                  >
                    <Heart className='h-4 w-4' />
                    <span className='hidden xl:inline'>Yêu thích</span>
                  </Link>

                  {/* Organization trigger button - Only show if no organization and notification is hidden */}
                  {!showOrgNotification && (
                    <button
                      onClick={() => setShowOrgNotification(true)}
                      className='px-3 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg hover:bg-cyan-50 transition-all duration-200 flex items-center space-x-1 border border-cyan-200 hover:border-cyan-300'
                      title='Tạo tổ chức'
                    >
                      <Building className='h-4 w-4' />
                      <span className='hidden xl:inline'>Tổ chức</span>
                    </button>
                  )}

                  <div className='w-px h-6 bg-gray-300 mx-2' />

                  {/* Staff Support Button */}
                  <button
                    onClick={handleConnectStaff}
                    disabled={isConnectingStaff}
                    className='px-3 py-2 text-teal-600 hover:text-teal-700 font-medium rounded-lg hover:bg-teal-50 transition-all duration-200 flex items-center space-x-1 disabled:opacity-50'
                    title='Nhắn tin với nhân viên CSKH'
                  >
                    {isConnectingStaff ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Headphones className='h-4 w-4' />
                    )}
                    <span className='hidden xl:inline'>CSKH</span>
                  </button>

                  {/* Guide Button */}
                  <button
                    onClick={() => setRunTour(true)}
                    className='px-3 py-2 text-cyan-600 hover:text-cyan-700 font-medium rounded-lg hover:bg-cyan-50 transition-all duration-200 flex items-center space-x-1'
                    title='Hướng dẫn sử dụng'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span className='hidden xl:inline'>Hướng dẫn</span>
                  </button>

                  <div className='w-px h-6 bg-gray-300 mx-2' />

                  {/* User Profile Dropdown */}
                  <div className='relative'>
                    <button
                      onClick={toggleUserMenu}
                      className='user-menu flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200'
                    >
                      <div className='size-10  rounded-full flex items-center justify-center'>
                        <Avatar className='w-12 h-12 rounded-full object-cover'>
                          <AvatarImage src={profile?.avatar || LOGO_DEFAULT} />
                          <AvatarFallback>{profile?.firstName?.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <span className='font-medium text-gray-700 hidden xl:inline'>
                        {profile?.firstName} {profile?.lastName}
                      </span>
                    </button>

                    {/* Desktop User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200'>
                        <div className='py-2'>
                          <Link
                            to={path.user.my.profile}
                            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Hồ sơ của tôi
                          </Link>
                          <Link
                            to={path.user.my.events}
                            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Sự kiện của tôi
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
                    to={path.events}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tìm sự kiện
                  </Link>
                  <Link
                    to={isAuthenticated ? path.user.event.create_event : path.auth.login}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tạo sự kiện
                  </Link>

                  <div className='border-t border-gray-100 my-2' />

                  {/* Mobile Guide Button */}
                  <button
                    onClick={() => {
                      setRunTour(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className='w-full flex items-center space-x-2 px-4 py-3 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors font-medium'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span>Hướng dẫn sử dụng</span>
                  </button>

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
                    className='block mx-4 my-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-lg hover:from-cyan-300-700 hover:to-blue-300 transition-all duration-200 text-center'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  {/* User Info */}
                  <div className='flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-2'>
                    <div className='w-10 h-10  rounded-full flex items-center justify-center'>
                      <Avatar className='w-12 h-12 rounded-full object-cover'>
                        <AvatarImage src={profile?.avatar || LOGO_DEFAULT} />
                        <AvatarFallback>{profile?.firstName?.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {profile?.firstName} {profile?.lastName}
                      </p>
                      <p className='text-sm text-gray-500'>Đã đăng nhập</p>
                    </div>
                  </div>

                  <Link
                    to={path.events}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tìm sự kiện
                  </Link>
                  <Link
                    to={isAuthenticated ? path.user.event.create_event : path.auth.login}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tạo sự kiện
                  </Link>
                  <Link
                    to={path.user.my.favorites}
                    className='flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className='h-4 w-4' />
                    <span>Yêu thích</span>
                  </Link>

                  {/* Mobile Organization trigger button */}
                  {!showOrgNotification && (
                    <button
                      onClick={() => {
                        setShowOrgNotification(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className='w-full flex items-center space-x-2 px-4 py-3 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors font-medium border border-cyan-200 mt-2'
                    >
                      <Building className='h-4 w-4' />
                      <span>Tạo tổ chức</span>
                    </button>
                  )}

                  <div className='border-t border-gray-100 my-2' />

                  {/* Mobile Staff Support Button */}
                  <button
                    onClick={() => {
                      handleConnectStaff()
                      setIsMobileMenuOpen(false)
                    }}
                    disabled={isConnectingStaff}
                    className='w-full flex items-center space-x-2 px-4 py-3 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium disabled:opacity-50'
                  >
                    {isConnectingStaff ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Headphones className='h-4 w-4' />
                    )}
                    <span>Nhắn tin với nhân viên CSKH</span>
                  </button>

                  {/* Mobile Guide Button for authenticated users */}
                  <button
                    onClick={() => {
                      setRunTour(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className='w-full flex items-center space-x-2 px-4 py-3 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors font-medium'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span>Hướng dẫn sử dụng</span>
                  </button>

                  <div className='border-t border-gray-100 my-2' />
                  <Link
                    to={path.user.my.profile}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    to={path.user.my.events}
                    className='block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sự kiện của tôi
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
    </>
  )
}

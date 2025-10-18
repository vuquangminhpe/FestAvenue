/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomIcon from '@/components/Icons'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import path from '@/constants/path'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef, Fragment, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useBulkPreloader } from '@/hooks/useBulkPreloader'
import SmartLink from '@/components/custom/SmartLink/index'

interface MyLayoutProps {
  children?: React.ReactNode
}

const items = [
  {
    title: 'Trang cá nhân',
    url: path.user.my.profile,
    icon: <CustomIcon name='UserOutline' className='h-[14px] w-[14px]' />,
    preloadKey: 'user-profile'
  },
  {
    title: 'Tin nhắn',
    url: path.user.my.messages,
    icon: <CustomIcon name='Message' className='size-4' />,
    preloadKey: 'messages-page'
  },
  {
    title: 'Tổ chức',
    url: path.user.my.organization,
    icon: <CustomIcon name='Organization' className='size-5' />,
    preloadKey: 'messages-page'
  },
  {
    title: 'Sự kiện của tôi',
    url: path.user.my.events,
    icon: <CustomIcon name='Calendar' className='w-4 h-4' />,
    preloadKey: 'events-page'
  },
  {
    title: 'Tín dụng',
    url: path.user.my.credit,
    icon: <CustomIcon name='CardOutline' className='w-4 h-3' />,
    preloadKey: 'credit-page'
  },
  {
    title: 'Thanh toán',
    url: path.user.my.payment,
    icon: <CustomIcon name='CardOutline' className='w-4 h-3' />,
    preloadKey: 'payment-page'
  }
]

export default function MyLayout({ children }: MyLayoutProps) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<string>('Trang cá nhân')
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({ top: 0, height: 0 })
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0
  })
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLUListElement>(null)

  // Preload các components khi idle
  useBulkPreloader(['create-organization'], 'idle')

  useEffect(() => {
    const currentItem = items.find((item) => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.title)
    }
  }, [location.pathname])

  // Optimized indicator updates
  const updateIndicator = useCallback(() => {
    if (sidebarRef.current) {
      const activeIndex = items.findIndex((item) => item.title === activeTab)
      if (activeIndex !== -1) {
        const menuItems = sidebarRef.current.querySelectorAll('[data-menu-item]')
        const activeElement = menuItems[activeIndex] as HTMLElement
        if (activeElement) {
          setIndicatorStyle({
            top: activeElement.offsetTop + 6,
            height: activeElement.offsetHeight - 14
          })
        }
      }
    }
  }, [activeTab])

  const updateMobileIndicator = useCallback(() => {
    if (mobileRef.current) {
      const activeIndex = items.findIndex((item) => item.title === activeTab)
      if (activeIndex !== -1) {
        const menuItems = mobileRef.current.querySelectorAll('[data-mobile-item]')
        const activeElement = menuItems[activeIndex] as HTMLElement
        if (activeElement) {
          setMobileIndicatorStyle({
            left: activeElement.offsetLeft,
            width: activeElement.offsetWidth
          })
        }
      }
    }
  }, [activeTab])

  useEffect(() => {
    updateIndicator()
    updateMobileIndicator()
  }, [updateIndicator, updateMobileIndicator])

  return (
    <Fragment>
      <div className='flex flex-col lg:flex-row z-[2]'>
        <SidebarProvider
          style={
            {
              '--sidebar-width': '17.5rem',
              '--sidebar-collapsed-width': '4rem'
            } as React.CSSProperties
          }
          className='hidden lg:flex w-fit border-r'
        >
          <Sidebar className='bg-white relative' collapsible='none'>
            <SidebarContent>
              <SidebarGroup className='p-0'>
                <SidebarGroupLabel className='h-16 pt-6 pb-4 pl-10 text-xl font-semibold text-ellipsis overflow-hidden whitespace-nowrap'>
                  Trang của tôi
                </SidebarGroupLabel>
                <SidebarGroupContent className='py-2 px-6 relative' ref={sidebarRef}>
                  {/* Animated Background Indicator */}
                  <div
                    className='absolute left-6 right-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg transition-all duration-300 ease-out z-0 shadow-sm'
                    style={{
                      top: `${indicatorStyle.top}px`,
                      height: `${indicatorStyle.height}px`,
                      opacity: indicatorStyle.height > 0 ? 1 : 0,
                      transform: indicatorStyle.height > 0 ? 'scale(1)' : 'scale(0.95)'
                    }}
                  />

                  <SidebarMenu className='gap-y-2 relative z-10'>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title} data-menu-item>
                        <SidebarMenuButton
                          className='h-fit -translate-y-2 data-[active=true]:bg-transparent data-[active=true]:rounded-[8px] relative group'
                          isActive={false}
                        >
                          <SmartLink
                            to={item.url}
                            onClick={() => setActiveTab(item.title)}
                            className='flex items-center gap-x-2 w-full h-12 px-4 rounded-lg transition-all duration-200 ease-out hover:bg-gray-50 hover:shadow-sm relative overflow-hidden border border-transparent hover:border-gray-200'
                          >
                            {/* Hover ripple effect */}
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out' />

                            <div className='h-6 w-6 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 relative z-10'>
                              {item.icon}
                            </div>
                            <span
                              className={cn(
                                'text-base text-ellipsis overflow-hidden whitespace-nowrap transition-all duration-200 relative z-10',
                                item.title === activeTab
                                  ? 'text-blue-700 font-semibold'
                                  : 'text-gray-700 group-hover:text-gray-900'
                              )}
                            >
                              {item.title}
                            </span>

                            {/* Active indicator dot */}
                            {item.title === activeTab && (
                              <div className='ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                            )}
                          </SmartLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>

        <div className='lg:hidden bg-white p-3'>
          <h3 className='text-[20px] font-semibold mb-3'>Trang của tôi</h3>
          <div className='relative h-10 px-4 overflow-hidden'>
            <ul
              ref={mobileRef}
              className='absolute top-0 left-0 w-full flex overflow-auto relative z-10'
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Mobile Animated Indicator */}
              <div
                className='absolute bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-400 ease-out z-0'
                style={{
                  left: `${mobileIndicatorStyle.left + 12}px`,
                  width: `${mobileIndicatorStyle.width - 24}px`,
                  opacity: mobileIndicatorStyle.width > 0 ? 1 : 0,
                  transform: mobileIndicatorStyle.width > 0 ? 'scale(1)' : 'scale(0.8)'
                }}
              />

              {/* Mobile Animated Background */}
              <div
                className='absolute top-0.5 bottom-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-sm transition-all duration-300 ease-out z-0 border border-blue-100'
                style={{
                  left: `${mobileIndicatorStyle.left}px`,
                  width: `${mobileIndicatorStyle.width}px`,
                  opacity: mobileIndicatorStyle.width > 0 ? 0.8 : 0,
                  transform: mobileIndicatorStyle.width > 0 ? 'scale(1)' : 'scale(0.95)'
                }}
              />

              {items.map((item) => (
                <li key={item.title} className='relative group' data-mobile-item>
                  <SmartLink
                    to={item.url}
                    className={cn(
                      'px-3 h-10 flex items-center whitespace-nowrap border border-transparent cursor-pointer transition-all duration-200 ease-out relative overflow-hidden',
                      'hover:border-gray-200 rounded-sm',
                      activeTab === item.title
                        ? 'text-blue-700 font-semibold bg-transparent'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={() => setActiveTab(item.title)}
                    // Mobile preload configuration
                  >
                    {/* Hover ripple effect */}
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out' />

                    <span className='transition-all duration-200 group-hover:scale-105 relative z-10'>
                      {item.title}
                    </span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Optimized content area */}
        <div className='flex-1 w-full bg-gray-50 py-9 px-7 xl:py-8 xl:pt-16'>{children}</div>
      </div>
    </Fragment>
  )
}

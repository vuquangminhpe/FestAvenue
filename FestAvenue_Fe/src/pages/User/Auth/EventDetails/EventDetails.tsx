import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, MapPin, Clock, Users, Share2, Bookmark, Heart, Tag, Navigation } from 'lucide-react'
import { FacebookShareButton, TwitterShareButton, FacebookIcon, XIcon } from 'react-share'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import LeafletMap from '@/components/custom/MapLeaflet'
import { getUserLocation, getDirections } from '@/services/openrouteservice'
import type { Event } from '@/types/event.types'

gsap.registerPlugin(ScrollTrigger)

// Mock data - replace with actual API call
const mockEventData: Event = {
  id: '1',
  name: 'Anh trai say bye',
  description: `Sự kiện cá sấu giúp mỗi của các nghệ sĩ hàng đầu Việt Nam.
    Đây là concert âm nhạc hoành tráng với sự góp mặt của các ca sĩ nổi tiếng. 
    Sự kiện hứa hẹn mang đến những trải nghiệm âm nhạc tuyệt vời và không gian biểu diễn hiện đại, chuyên nghiệp.`,
  shortDescription: 'Concert âm nhạc hoành tráng với sự góp mặt của các ca sĩ nổi tiếng',
  eventType: 0 as any,
  categoryId: 'music',
  status: 1,
  visibility: 0,
  capacity: 5000,
  startDate: '2025-12-12T20:00:00Z',
  endDate: '2025-12-12T22:00:00Z',
  registrationStartDate: '2025-10-01T00:00:00Z',
  registrationEndDate: '2025-12-10T23:59:59Z',
  logoUrl: '/spidermanAcross.jpg',
  bannerUrl: '/johnWick4.png',
  website: 'https://festevenue.com',
  publicContactEmail: 'contact@example.com',
  publicContactPhone: '+84 123 456 789',
  location: {
    venueId: 'venue1',
    address: {
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      state: 'Quận 1',
      postalCode: '700000',
      country: 'Vietnam'
    },
    coordinates: {
      latitude: 10.7769,
      longitude: 106.7009
    }
  },
  ticketTypes: ['VIP', 'Vé loại 1', 'Vé loại 2'],
  sponsors: [],
  speakers: [],
  exhibitors: [],
  hashtags: ['#concert', '#music', '#vietnam'],
  settings: {
    ticketing: {
      taxIncluded: true,
      taxPercentage: 10,
      invoiceEnabled: true,
      cancellationPolicy: 'Không hoàn tiền'
    },
    registration: {
      approvalRequired: false,
      waitlistEnabled: true,
      customQuestions: []
    },
    notifications: {
      confirmationEmail: true,
      reminderEmail: true,
      reminderDays: [7, 3, 1],
      followUpEmail: true
    }
  },
  metrics: {
    views: 12500,
    registrations: 2800,
    attendance: 0,
    revenue: 560000000
  },
  organizationId: 'org1',
  moduleIds: []
}

const ticketPrices = [
  {
    type: 'VIP',
    description: 'Ghế ngồi vị trí tốt nhất, view đẹp',
    price: 2000000,
    remaining: 50
  },
  {
    type: 'Vé loại 1',
    description: 'Ghế ngồi vị trí khá',
    price: 1500000,
    remaining: 200
  },
  {
    type: 'Vé loại 2',
    description: 'Ghế ngồi vị trí thường',
    price: 1000000,
    remaining: 500
  }
]

const relatedEvents = [
  {
    id: '2',
    title: 'Tên sự kiện',
    date: '20-11-2025',
    image: '/avenger_endgame.jpg'
  },
  {
    id: '3',
    title: 'Tên sự kiện',
    date: '28-11-2025',
    image: '/spidermanAcross.jpg'
  },
  {
    id: '4',
    title: 'Tên sự kiện',
    date: '28-11-2025',
    image: '/johnWick4.png'
  },
  {
    id: '5',
    title: 'Tên sự kiện',
    date: '28-11-2025',
    image: '/avenger_endgame.jpg'
  }
]

const eventPosts = [
  {
    id: '1',
    author: 'Hồ ngọc đẹp',
    time: '2 giờ trước',
    content: 'Mỗi dàng của bài đăng',
    image: '/johnWick4.png',
    likes: 1234,
    comments: 56
  },
  {
    id: '2',
    author: 'Năn quốc đáng',
    time: '5 giờ trước',
    content: 'Mỗi dàng của bài đăng',
    image: '/spidermanAcross.jpg',
    likes: 987,
    comments: 43
  }
]

const EventDetails: React.FC = () => {
  const [event] = useState<Event>(mockEventData)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showLocationAlert, setShowLocationAlert] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [routeData, setRouteData] = useState<{
    coordinates: [number, number][]
    distance: number
    duration: number
  } | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out'
        }
      )
    }

    // Content sections animation
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll('.animate-section')
      gsap.fromTo(
        sections,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%'
          }
        }
      )
    }

    // Sidebar animation
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.3,
          ease: 'power3.out'
        }
      )
    }

    // Related events animation
    if (relatedRef.current) {
      const cards = relatedRef.current.querySelectorAll('.related-card')
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: relatedRef.current,
            start: 'top 85%'
          }
        }
      )
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleGetDirections = async () => {
    setShowLocationAlert(true)
  }

  const handleConfirmLocation = async () => {
    setShowLocationAlert(false)
    setIsLoadingRoute(true)

    try {
      // Get user's current location
      const location = await getUserLocation()

      if (!location) {
        alert('Không thể lấy vị trí của bạn. Vui lòng bật GPS và cho phép truy cập vị trí.')
        setIsLoadingRoute(false)
        return
      }

      setUserPosition(location)

      // Get route from user location to event location
      const eventLocation = {
        lat: event.location.coordinates.latitude,
        lng: event.location.coordinates.longitude
      }

      const directions = await getDirections(location, eventLocation)

      setRouteData({
        coordinates: directions.coordinates,
        distance: directions.distance,
        duration: directions.duration
      })
    } catch (error) {
      console.error('Error getting directions:', error)
      alert('Không thể tính toán đường đi. Vui lòng thử lại sau.')
    } finally {
      setIsLoadingRoute(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
      {/* Hero Section */}
      <div ref={heroRef} className='relative h-[500px] overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={event.bannerUrl} alt={event.name} className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
        </div>

        <div className='relative z-10 container mx-auto px-4 h-full flex items-end pb-12'>
          <div className='text-white space-y-4 max-w-3xl'>
            <Badge className='bg-cyan-500 text-white hover:bg-cyan-600'>
              <Calendar className='w-3 h-3 mr-1' />
              {formatDate(event.startDate)}
            </Badge>
            <h1 className='text-5xl md:text-6xl font-bold leading-tight'>{event.name}</h1>
            <p className='text-lg text-gray-200'>{event.shortDescription}</p>

            <div className='flex flex-wrap gap-4 pt-4'>
              <Button
                size='lg'
                className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
              >
                <Tag className='w-4 h-4 mr-2' />
                Đặt vé ngay
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                Lưu
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size='lg'
                    variant='outline'
                    className='bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                  >
                    <Share2 className='w-4 h-4 mr-2' />
                    Chia sẻ
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Chia sẻ sự kiện</DialogTitle>
                  </DialogHeader>
                  <div className='flex flex-col gap-4 py-4'>
                    <div className='text-sm text-gray-600 mb-2'>Chia sẻ sự kiện này đến:</div>
                    <div className='flex gap-4 justify-center'>
                      <FacebookShareButton
                        url={window.location.href}
                        hashtag={event.hashtags[0]}
                        className='hover:opacity-80 transition-opacity'
                      >
                        <FacebookIcon size={48} round />
                      </FacebookShareButton>

                      <TwitterShareButton
                        url={window.location.href}
                        title={`${event.name} - ${event.shortDescription}`}
                        hashtags={event.hashtags.map((tag) => tag.replace('#', ''))}
                        className='hover:opacity-80 transition-opacity'
                      >
                        <XIcon size={48} round />
                      </TwitterShareButton>
                    </div>
                    <div className='text-xs text-gray-500 text-center mt-2'>
                      * Instagram không hỗ trợ chia sẻ từ web
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Content */}
          <div ref={contentRef} className='lg:col-span-2 space-y-8'>
            {/* Event Info Cards */}
            <div className='animate-section grid grid-cols-2 md:grid-cols-4 gap-4'>
              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <Calendar className='w-8 h-8 mx-auto mb-2 text-cyan-600' />
                  <p className='text-sm text-gray-600'>Ngày tổ chức</p>
                  <p className='font-semibold text-gray-900'>{formatDate(event.startDate)}</p>
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <Clock className='w-8 h-8 mx-auto mb-2 text-blue-600' />
                  <p className='text-sm text-gray-600'>Thời gian</p>
                  <p className='font-semibold text-gray-900'>
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </p>
                  <p className='text-xs text-gray-500'>(2 tiếng)</p>
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <MapPin className='w-8 h-8 mx-auto mb-2 text-red-500' />
                  <p className='text-sm text-gray-600'>Địa điểm</p>
                  <p className='font-semibold text-gray-900'>{event.location.address.city}</p>
                  <p className='text-xs text-gray-500'>Sulf My Krum</p>
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <Users className='w-8 h-8 mx-auto mb-2 text-purple-600' />
                  <p className='text-sm text-gray-600'>Số lượng chỗ</p>
                  <p className='font-semibold text-gray-900'>{event.capacity} người</p>
                </CardContent>
              </Card>
            </div>

            {/* Description Section */}
            <Card className='animate-section bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
              <CardContent className='p-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                  <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                  Mô tả chi tiết
                </h2>
                <div className='prose prose-lg max-w-none text-gray-700 leading-relaxed'>
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className='mb-4'>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Events */}
            <div ref={relatedRef} className='animate-section'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                Sự kiện liên quan
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {relatedEvents.map((relatedEvent) => (
                  <Card
                    key={relatedEvent.id}
                    className='related-card group cursor-pointer overflow-hidden bg-white border-cyan-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
                  >
                    <div className='relative aspect-[3/4] overflow-hidden'>
                      <img
                        src={relatedEvent.image}
                        alt={relatedEvent.title}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                    <CardContent className='p-3'>
                      <p className='font-semibold text-sm text-gray-900 truncate'>{relatedEvent.title}</p>
                      <p className='text-xs text-gray-500'>{relatedEvent.date}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Event Posts */}
            <div className='animate-section'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                Các bài đăng của sự kiện
              </h2>
              <div className='space-y-6'>
                {eventPosts.map((post) => (
                  <Card
                    key={post.id}
                    className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-center mb-4'>
                        <Avatar className='w-12 h-12 border-2 border-cyan-200'>
                          <AvatarImage src='/avatar2.jpg' />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className='ml-3'>
                          <p className='font-semibold text-gray-900'>{post.author}</p>
                          <p className='text-sm text-gray-500'>{post.time}</p>
                        </div>
                      </div>

                      <p className='text-gray-700 mb-4'>{post.content}</p>

                      {post.image && (
                        <div className='relative aspect-video rounded-lg overflow-hidden mb-4'>
                          <img src={post.image} alt='Post' className='w-full h-full object-cover' />
                        </div>
                      )}

                      <div className='flex items-center gap-6 pt-4 border-t border-gray-200'>
                        <Button variant='ghost' size='sm' className='text-gray-600 hover:text-red-500'>
                          <Heart className='w-4 h-4 mr-2' />
                          {post.likes} Thích
                        </Button>
                        <Button variant='ghost' size='sm' className='text-gray-600 hover:text-blue-500'>
                          <Share2 className='w-4 h-4 mr-2' />
                          {post.comments} Bình luận
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div ref={sidebarRef} className='lg:col-span-1 space-y-6'>
            {/* Map Section */}
            <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg overflow-hidden'>
              <CardContent className='p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <MapPin className='w-5 h-5 mr-2 text-cyan-600' />
                  Bản đồ vị trí
                </h3>
                <div className='rounded-lg overflow-hidden border-2 border-cyan-100 mb-4'>
                  <LeafletMap
                    center={{
                      lat: event.location.coordinates.latitude,
                      lng: event.location.coordinates.longitude
                    }}
                    zoom={15}
                    markerPosition={{
                      lat: event.location.coordinates.latitude,
                      lng: event.location.coordinates.longitude
                    }}
                    userPosition={userPosition || undefined}
                    routeCoordinates={routeData?.coordinates}
                    routeDistance={routeData?.distance}
                    routeDuration={routeData?.duration}
                  />
                </div>
                <Button
                  className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                  onClick={handleGetDirections}
                  disabled={isLoadingRoute}
                >
                  <Navigation className='w-4 h-4 mr-2' />
                  {isLoadingRoute ? 'Đang tính toán...' : routeData ? 'Cập nhật chỉ đường' : 'Xem chỉ đường'}
                </Button>
              </CardContent>
            </Card>

            {/* Ticket Pricing */}
            <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
              <CardContent className='p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <Tag className='w-5 h-5 mr-2 text-cyan-600' />
                  Bảng giá vé
                </h3>
                <div className='space-y-3'>
                  {ticketPrices.map((ticket, index) => (
                    <div
                      key={index}
                      className='group p-4 rounded-lg border-2 border-cyan-100 hover:border-cyan-300 transition-all bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 cursor-pointer'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <p className='font-bold text-gray-900'>{ticket.type}</p>
                          <p className='text-xs text-gray-600'>{ticket.description}</p>
                        </div>
                        <p className='font-bold text-lg text-cyan-600'>{formatPrice(ticket.price)}</p>
                      </div>
                      <p className='text-xs text-gray-500'>Còn lại: {ticket.remaining} vé</p>
                    </div>
                  ))}
                </div>
                <Button
                  size='lg'
                  className='w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all'
                >
                  Mua vé ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Location Permission Alert Dialog */}
      <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cho phép truy cập vị trí</AlertDialogTitle>
            <AlertDialogDescription>
              Chúng tôi cần truy cập vị trí hiện tại của bạn để tính toán đường đi tới địa điểm sự kiện. Bạn có muốn
              chia sẻ vị trí của mình không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLocation}>Đồng ý</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EventDetails

import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, MapPin, Clock, Users, Share2, Bookmark, Heart, Tag, Play, Copy, CheckCircle2 } from 'lucide-react'
import { FacebookIcon, XIcon } from 'react-share'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import GoongMap from '@/components/custom/GoongMap/GoongMap'
import VideoHLSPlayer from '@/components/custom/VideoHLSPlayer/VideoHLSPlayer'
import { getIdFromNameId } from '@/utils/utils'
import { useParams } from 'react-router-dom'
import { useEventDetailsData } from './hooks'

gsap.registerPlugin(ScrollTrigger)

// Mock data for related events and posts (keep as requested)
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
  const eventParams = useParams()
  const eventCode = getIdFromNameId(eventParams.eventId as string)

  // Use custom hooks for data fetching
  const { event, tickets, isLoading } = useEventDetailsData(eventCode)

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)

  // GSAP Animations
  useEffect(() => {
    if (!event || isLoading) return

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
  }, [event, isLoading])

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

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5
    return hours.toFixed(0)
  }

  // Get start and end dates - prioritize new time fields
  const getEventStartDate = () => {
    return event?.startTimeEventTime || ''
  }

  const getEventEndDate = () => {
    return event?.endTimeEventTime || ''
  }

 

  const getTicketSaleStatus = () => {
    if (!event?.startTicketSaleTime || !event?.endTicketSaleTime) {
      return { isActive: true, message: '' }
    }

    const now = new Date()
    const startSaleDate = new Date(event.startTicketSaleTime)
    const endSaleDate = new Date(event.endTicketSaleTime)

    if (now < startSaleDate) {
      return {
        isActive: false,
        message: `Bán vé bắt đầu từ ${formatDate(event.startTicketSaleTime)} lúc ${formatTime(event.startTicketSaleTime)}`
      }
    }

    if (now > endSaleDate) {
      return {
        isActive: false,
        message: 'Đã kết thúc bán vé'
      }
    }

    return { isActive: true, message: '' }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-xl text-gray-600 mb-4'>Không tìm thấy sự kiện</p>
          <Button onClick={() => window.history.back()}>Quay lại</Button>
        </div>
      </div>
    )
  }

  // Prepare share content
  const shareUrl = window.location.href
  const shareTitle = `${event.eventName} - ${event.shortDescription}`
  const shareDescription = event.description.substring(0, 200) + (event.description.length > 200 ? '...' : '')

  // Prepare share text content
  const getShareText = () => {
    const hashtags = event.hashtags?.join(' ') || ''
    return `${event.eventName}\n\n${event.shortDescription}\n\n${hashtags}`
  }

  // Get ticket sale status
  const ticketSaleStatus = getTicketSaleStatus()

  // Custom share functions
  const handleFacebookShare = () => {
    // Facebook chỉ lấy thông tin từ Open Graph meta tags
    // Không thể truyền custom text vào share dialog
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const text = getShareText()
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  // Copy content to clipboard
  const handleCopyContent = async () => {
    try {
      const content = `${getShareText()}\n\n${shareUrl}`
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
      {/* SEO and Social Media Meta Tags */}
      <Helmet>
        <title>{event.eventName} | FestAvenue</title>
        <meta name='description' content={shareDescription} />

        {/* Open Graph / Facebook */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content={shareUrl} />
        <meta property='og:title' content={shareTitle} />
        <meta property='og:description' content={shareDescription} />
        <meta property='og:image' content={event.bannerUrl} />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:site_name' content='FestAvenue' />

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:url' content={shareUrl} />
        <meta name='twitter:title' content={shareTitle} />
        <meta name='twitter:description' content={shareDescription} />
        <meta name='twitter:image' content={event.bannerUrl} />

        {/* Keywords */}
        <meta name='keywords' content={event.hashtags?.join(', ')} />
      </Helmet>
      {/* Hero Section */}
      <div ref={heroRef} className='relative h-[500px] overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={event.bannerUrl} alt={event.eventName} className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
        </div>

        <div className='relative z-10 container mx-auto px-4 h-full flex items-end pb-12'>
          <div className='text-white space-y-4 max-w-3xl'>
            <Badge className='bg-cyan-500 text-white hover:bg-cyan-600'>
              <Calendar className='w-3 h-3 mr-1' />
              {getEventStartDate() && formatDate(getEventStartDate())}
            </Badge>
            <h1 className='text-5xl md:text-6xl font-bold leading-tight'>{event.eventName}</h1>
            <p className='text-lg text-gray-200'>{event.shortDescription}</p>

            <div className='flex flex-wrap gap-4 pt-4'>
              {ticketSaleStatus.isActive ? (
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
                >
                  <Tag className='w-4 h-4 mr-2' />
                  Đặt vé ngay
                </Button>
              ) : (
                <div className='flex flex-col gap-2'>
                  <Button
                    size='lg'
                    disabled
                    className='bg-gray-400 text-white cursor-not-allowed'
                  >
                    <Tag className='w-4 h-4 mr-2' />
                    Đặt vé ngay
                  </Button>
                  <p className='text-sm text-amber-200 bg-black/30 px-3 py-1 rounded'>{ticketSaleStatus.message}</p>
                </div>
              )}
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
                <DialogContent className='sm:max-w-lg'>
                  <DialogHeader>
                    <DialogTitle>Chia sẻ sự kiện</DialogTitle>
                  </DialogHeader>
                  <div className='flex flex-col gap-4 py-4'>
                    {/* Share Preview */}
                    <div className='bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200'>
                      <div className='text-sm font-semibold text-gray-900 mb-1'>{event.eventName}</div>
                      <div className='text-xs text-gray-600 mb-2'>{event.shortDescription}</div>
                      <div className='flex flex-wrap gap-1 mb-2'>
                        {event.hashtags?.map((tag: string, index: number) => (
                          <span key={index} className='text-xs text-blue-600 font-medium'>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className='text-xs text-gray-500 break-all'>{shareUrl}</div>
                    </div>

                    {/* Copy Button */}
                    <Button
                      onClick={handleCopyContent}
                      variant='outline'
                      className='w-full border-cyan-300 hover:bg-cyan-50'
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2 text-green-600' />
                          Đã copy!
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4 mr-2' />
                          Copy nội dung
                        </>
                      )}
                    </Button>

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t border-gray-300' />
                      </div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-white px-2 text-gray-500'>Hoặc chia sẻ trực tiếp</span>
                      </div>
                    </div>

                    {/* Social Media Buttons */}
                    <div className='grid grid-cols-2 gap-3'>
                      <Button
                        onClick={handleFacebookShare}
                        variant='outline'
                        className='w-full hover:bg-blue-50 border-blue-200'
                      >
                        <FacebookIcon size={24} round className='mr-2' />
                        Facebook
                      </Button>

                      <Button
                        onClick={handleTwitterShare}
                        variant='outline'
                        className='w-full hover:bg-sky-50 border-sky-200'
                      >
                        <XIcon size={24} round className='mr-2' />
                        Twitter/X
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
                      <p className='text-xs text-amber-800 mb-2'>
                        <strong>Lưu ý về Facebook:</strong>
                      </p>
                      <ul className='text-xs text-amber-700 space-y-1 list-disc list-inside'>
                        <li>Facebook chỉ hiển thị tiêu đề và ảnh từ link</li>
                        <li>Để thêm hashtags, click "Copy nội dung" và paste vào bài post</li>
                        <li>Twitter/X tự động thêm tên sự kiện và hashtags</li>
                      </ul>
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
                  <p className='font-semibold text-gray-900'>{getEventStartDate() && formatDate(getEventStartDate())}</p>
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <Clock className='w-8 h-8 mx-auto mb-2 text-blue-600' />
                  <p className='text-sm text-gray-600'>Thời gian</p>
                  <p className='font-semibold text-gray-900'>
                    {getEventStartDate() && formatTime(getEventStartDate())} -{' '}
                    {getEventEndDate() && formatTime(getEventEndDate())}
                  </p>
                  {getEventStartDate() && getEventEndDate() && (
                    <p className='text-xs text-gray-500'>
                      ({calculateDuration(getEventStartDate(), getEventEndDate())} giờ)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <MapPin className='w-8 h-8 mx-auto mb-2 text-red-500' />
                  <p className='text-sm text-gray-600'>Địa điểm</p>
                  <p className='font-semibold text-gray-900'>{event.location?.address?.city || 'N/A'}</p>
                  <p className='text-xs text-gray-500'>{event.location?.address?.street || ''}</p>
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

            {/* Trailer Video Section */}
            {event.trailerUrl && (
              <Card className='animate-section bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg overflow-hidden'>
                <CardContent className='p-6'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                    <Play className='w-6 h-6 mr-2 text-cyan-600' />
                    Video giới thiệu
                  </h2>
                  <VideoHLSPlayer src={event.trailerUrl} classNames='rounded-lg overflow-hidden' />
                </CardContent>
              </Card>
            )}

            {/* Description Section */}
            <Card className='animate-section bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
              <CardContent className='p-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                  <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                  Mô tả chi tiết
                </h2>
                <div className='prose prose-lg max-w-none text-gray-700 leading-relaxed'>
                  {event.description.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className='mb-4'>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Organization Info */}
            {event.organization && (
              <Card className='animate-section bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
                <CardContent className='p-6'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                    Thông tin ban tổ chức
                  </h2>
                  <div className='flex items-start gap-4'>
                    {event.organization.logo && (
                      <img
                        src={event.organization.logo}
                        alt={event.organization.name}
                        className='w-16 h-16 rounded-lg object-cover'
                      />
                    )}
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2'>{event.organization.name}</h3>
                      <p className='text-gray-600 mb-2'>{event.organization.description}</p>
                      {event.organization.website && (
                        <a
                          href={event.organization.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-cyan-600 hover:text-cyan-700'
                        >
                          {event.organization.website}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
            {event.location?.coordinates && (
              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg overflow-hidden'>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                    <MapPin className='w-5 h-5 mr-2 text-cyan-600' />
                    Bản đồ vị trí
                  </h3>
                  <div className='rounded-lg overflow-hidden border-2 border-cyan-100 mb-4'>
                    <GoongMap
                      center={{
                        lat: event.location.coordinates.latitude,
                        lng: event.location.coordinates.longitude
                      }}
                      zoom={15}
                      markerPosition={{
                        lat: event.location.coordinates.latitude,
                        lng: event.location.coordinates.longitude
                      }}
                    />
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p className='font-semibold mb-1'>{event.location.address.street}</p>
                    <p>
                      {event.location.address.city}, {event.location.address.state}
                    </p>
                    <p>{event.location.address.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ticket Pricing */}
            {tickets.length > 0 && (
              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                    <Tag className='w-5 h-5 mr-2 text-cyan-600' />
                    Bảng giá vé
                  </h3>
                  <div className='space-y-3'>
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className='group p-4 rounded-lg border-2 border-cyan-100 hover:border-cyan-300 transition-all bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 cursor-pointer'
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <p className='font-bold text-gray-900'>{ticket.name}</p>
                            <p className='text-xs text-gray-600'>{ticket.description}</p>
                          </div>
                          <p className='font-bold text-lg text-cyan-600'>{formatPrice(ticket.price)}</p>
                        </div>
                        <p className='text-xs text-gray-500'>Còn lại: {ticket.quantity} vé</p>
                      </div>
                    ))}
                  </div>
                  {ticketSaleStatus.isActive ? (
                    <Button
                      size='lg'
                      className='w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all'
                    >
                      Mua vé ngay
                    </Button>
                  ) : (
                    <div className='mt-6'>
                      <Button size='lg' disabled className='w-full bg-gray-300 text-gray-500 cursor-not-allowed'>
                        Mua vé ngay
                      </Button>
                      <p className='text-sm text-red-600 text-center mt-2 font-medium'>{ticketSaleStatus.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            {(event.publicContactEmail || event.publicContactPhone) && (
              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Thông tin liên hệ</h3>
                  <div className='space-y-2 text-sm'>
                    {event.publicContactEmail && (
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-gray-700'>Email:</span>
                        <a href={`mailto:${event.publicContactEmail}`} className='text-cyan-600 hover:text-cyan-700'>
                          {event.publicContactEmail}
                        </a>
                      </div>
                    )}
                    {event.publicContactPhone && (
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-gray-700'>Điện thoại:</span>
                        <a href={`tel:${event.publicContactPhone}`} className='text-cyan-600 hover:text-cyan-700'>
                          {event.publicContactPhone}
                        </a>
                      </div>
                    )}
                    {event.website && (
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-gray-700'>Website:</span>
                        <a
                          href={event.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-cyan-600 hover:text-cyan-700 truncate'
                        >
                          {event.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hashtags */}
            {event.hashtags && event.hashtags.length > 0 && (
              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg'>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Hashtags</h3>
                  <div className='flex flex-wrap gap-2'>
                    {event.hashtags.map((tag: string, index: number) => (
                      <Badge key={index} variant='secondary' className='bg-cyan-100 text-cyan-700'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

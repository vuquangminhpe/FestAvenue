import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, MapPin, Clock, Users, Share2, Heart, Tag, Play, Copy, CheckCircle2 } from 'lucide-react'
import { FacebookIcon, XIcon } from 'react-share'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import GoongMap from '@/components/custom/GoongMap/GoongMap'
import VideoHLSPlayer from '@/components/custom/VideoHLSPlayer/VideoHLSPlayer'
import { generateNameId, getIdFromNameId } from '@/utils/utils'
import { useNavigate, useParams } from 'react-router-dom'
import { useEventDetailsData } from './hooks'
import path from '@/constants/path'
import type { top5latestRes } from '@/types/serviceSocialMedia.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApis } from '@/apis/event.api'
import { toast } from 'react-hot-toast'

gsap.registerPlugin(ScrollTrigger)

const EventDetails: React.FC = () => {
  const eventParams = useParams()
  const eventCode = getIdFromNameId(eventParams.eventId as string)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Use custom hooks for data fetching
  const { event, posts, relatedEvents, isLoading , refetch } = useEventDetailsData(eventCode)

  const [isCopied, setIsCopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)

  // Sync isFollowing with event.isFollowed when event data loads
  useEffect(() => {
    if (event?.isFollowed !== undefined) {
      setIsFollowing(event.isFollowed)
    }
  }, [event?.isFollowed])

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: (eventCode: string) => eventApis.followOrUnfollowEvent(eventCode),
    onSuccess: (data) => {
      if (data?.data) {
        setIsFollowing(data.data.isFollowing)
        queryClient.invalidateQueries({ queryKey: ['favoriteEvents'] })
        queryClient.invalidateQueries({ queryKey: ['eventDetails'] })
        toast.success(data.data.isFollowing ? 'Đã lưu sự kiện vào yêu thích' : 'Đã bỏ lưu sự kiện')
      }
    },
    onError: () => {
      toast.error('Không thể thực hiện thao tác')
    }
  })

  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)

  // Hero images array
  const heroImages = [event?.bannerUrl, event?.logoUrl].filter(Boolean)

  // Auto-slide hero images
  useEffect(() => {
    if (!event || heroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [event, heroImages.length])

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

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5
    return hours.toFixed(0)
  }

  const formatPostTime = (dateString: string) => {
    const postDate = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return postDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
        message: `Bán vé bắt đầu từ ${formatDate(event.startTicketSaleTime)} lúc ${formatTime(
          event.startTicketSaleTime
        )}`
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
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      text
    )}`
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
      <div ref={heroRef} className='relative h-[650px] overflow-hidden'>
        {/* Image Slider */}
        <div className='absolute inset-0'>
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={image} alt={`${event.eventName} - Image ${index + 1}`} className='w-full h-full object-cover' />
            </div>
          ))}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
        </div>

        {/* Indicator Dots */}
        {heroImages.length > 1 && (
          <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 flex gap-2'>
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentImageIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className='relative z-10 container mx-auto px-4 h-full flex items-end pb-12'>
          <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-end'>
            {/* Left: Event Info */}
            <div className='text-white space-y-4 lg:col-span-2'>
              <Badge className='bg-cyan-500 text-white hover:bg-cyan-600'>
                <Calendar className='w-3 h-3 mr-1' />
                {getEventStartDate() && formatDate(getEventStartDate())}
              </Badge>
              <h1 className='text-5xl md:text-6xl font-bold leading-tight'>{event.eventName}</h1>
              <p className='text-lg text-gray-200'>{event.shortDescription}</p>

              <div className='flex flex-wrap gap-4 pt-4'>
                {ticketSaleStatus.isActive ? (
                  <Button
                    onClick={() =>
                      navigate(
                        `${path.user.event.ticketDetails_event}/${generateNameId({
                          id: event.eventCode,
                          name: event.eventName,
                          id_2: event.organization.name
                        })}`
                      )
                    }
                    size='lg'
                    className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
                  >
                    <Tag className='w-4 h-4 mr-2' />
                    Đặt vé ngay
                  </Button>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <Button
                      onClick={() =>
                        navigate(
                          `${path.user.event.ticketDetails_event}/${generateNameId({
                            id: event.eventCode,
                            name: event.eventName,
                            id_2: event.organization.name
                          })}`
                        )
                      }
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
                  onClick={() => followMutation.mutate(eventCode,{
                    onSuccess: ()=>{
                      refetch()
                    }
                  })}
                  disabled={followMutation.isPending}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Đã lưu' : 'Lưu'}
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

            {/* Right: Contact Info */}
            {(event.publicContactEmail || event.publicContactPhone || event.website) && (
              <div className='lg:col-span-1'>
                <div className=' backdrop-blur-sm border-cyan-200 shadow-2xl rounded-xl'>
                  <div className='p-6'>
                    <h3 className='text-xl font-bold text-white mb-4 flex items-center'>
                      <Users className='w-5 h-5 mr-2 text-white' />
                      Thông tin liên hệ
                    </h3>
                    <div className='space-y-3 text-sm'>
                      {event.publicContactEmail && (
                        <div className='flex items-start gap-2'>
                          <span className='font-semibold text-white min-w-[80px]'>Email:</span>
                          <a
                            href={`mailto:${event.publicContactEmail}`}
                            className='text-cyan-600 font-bold hover:text-cyan-700 break-all'
                          >
                            {event.publicContactEmail}
                          </a>
                        </div>
                      )}
                      {event.publicContactPhone && (
                        <div className='flex items-start gap-2'>
                          <span className='font-semibold text-white min-w-[80px]'>Điện thoại:</span>
                          <a
                            href={`tel:${event.publicContactPhone}`}
                            className='text-cyan-600 font-bold hover:text-cyan-700'
                          >
                            {event.publicContactPhone}
                          </a>
                        </div>
                      )}
                      {event.website && (
                        <div className='flex items-start gap-2'>
                          <span className='font-semibold text-white min-w-[80px]'>Website:</span>
                          <a
                            href={event.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-cyan-600 font-bold hover:text-cyan-700 break-all'
                          >
                            {event.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <p className='font-semibold text-gray-900'>
                    {getEventStartDate() && formatDate(getEventStartDate())}
                  </p>
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  <Clock className='w-8 h-8 mx-auto mb-2 text-blue-600' />
                  <p className='text-sm text-gray-600'>Diễn ra trong</p>
                  {getEventStartDate() && getEventEndDate() && (
                    <p className='text-xs text-gray-500'>
                      ({calculateDuration(getEventStartDate(), getEventEndDate())} giờ)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-shadow'>
                <CardContent className='p-4 text-center'>
                  {/* Hashtags */}
                  {event.hashtags && event.hashtags.length > 0 && (
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-4'>Hashtags</h3>
                      <div className='flex flex-wrap gap-2'>
                        {event.hashtags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='bg-cyan-100 text-cyan-700 cursor-pointer hover:bg-cyan-200 hover:text-cyan-800 transition-colors'
                            onClick={() => navigate(`${path.events}?hashtag=${encodeURIComponent(tag)}`)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
            {relatedEvents.length > 0 && (
              <div ref={relatedRef} className='animate-section'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                  <div className='w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 mr-3 rounded-full' />
                  Sự kiện liên quan
                </h2>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {relatedEvents.slice(0, 3).map((relatedEvent) => (
                    <Card
                      key={relatedEvent.eventCode}
                      onClick={() =>
                        navigate(
                          `${path.user.event.root}/${generateNameId({
                            id: relatedEvent.eventCode,
                            name: relatedEvent.eventName,
                            id_2: relatedEvent.organization.name
                          })}`
                        )
                      }
                      className='related-card group cursor-pointer overflow-hidden bg-white border-cyan-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
                    >
                      <div className='relative aspect-[3/4] overflow-hidden'>
                        <img
                          src={relatedEvent.bannerUrl || relatedEvent.logoUrl || '/placeholder.jpg'}
                          alt={relatedEvent.eventName}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                        <Button
                          size='sm'
                          variant='ghost'
                          className='absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10'
                          onClick={(e) => {
                            e.stopPropagation()
                            followMutation.mutate(relatedEvent.eventCode)
                          }}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              relatedEvent.isFollowed ? 'text-red-500 fill-red-500' : 'text-gray-600'
                            }`}
                          />
                        </Button>
                      </div>
                      <CardContent className='p-3'>
                        <p className='font-semibold text-sm text-gray-900 truncate'>{relatedEvent.eventName}</p>
                        <p className='text-xs text-gray-500'>
                          {relatedEvent.startTimeEventTime && formatDate(relatedEvent.startTimeEventTime)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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

            {/* Event Posts */}
            <Card className='bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg overflow-hidden'>
              <CardContent className='p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <Share2 className='w-5 h-5 mr-2 text-cyan-600' />
                  Bài đăng sự kiện
                </h3>
                <div className='space-y-4'>
                  {posts && (posts as any).length > 0 ? (
                    (posts as any).map((post: top5latestRes) => (
                      <Card
                        key={post.postSocialMediaId}
                        onClick={() =>
                          navigate(
                            `${path.user.event.social_media_detail_base}/${generateNameId({
                              id: post.postSocialMediaId,
                              name: post.title,
                              id_2: `eC${eventCode}eC`,
                              templateNumber: post.templateNumber
                            })}`
                          )
                        }
                        className='group cursor-pointer overflow-hidden bg-white border-cyan-100 shadow-md hover:shadow-xl transition-all duration-300'
                      >
                        <div className='relative aspect-video overflow-hidden bg-gray-200'>
                          {post.bannerPostUrl ? (
                            <>
                              <img
                                src={post.bannerPostUrl}
                                alt={post.title}
                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                              />
                              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                            </>
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100'>
                              <span className='text-gray-400 text-sm'>Không có ảnh</span>
                            </div>
                          )}
                        </div>
                        <CardContent className='p-3'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Avatar className='w-7 h-7 border border-cyan-200'>
                              <AvatarImage src={post.avatarAthorUrl || '/avatar_default.jpg'} />
                              <AvatarFallback className='text-xs'>{post.authorName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs font-semibold text-gray-900 truncate'>{post.authorName}</p>
                              <p className='text-xs text-gray-500'>{formatPostTime(post.createAt)}</p>
                            </div>
                          </div>
                          <p className='text-xs text-gray-600 line-clamp-2 mb-2'>{post.body}</p>
                          <div className='flex items-center gap-3 text-xs'>
                            <span className='text-gray-500 flex items-center gap-1'>
                              <Heart className='w-3 h-3' /> {post.totalReactions}
                            </span>
                            <span className='text-gray-500 flex items-center gap-1'>
                              <Share2 className='w-3 h-3' /> {post.totalComments}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className='text-center py-8'>
                      <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center'>
                        <Share2 className='w-6 h-6 text-cyan-600' />
                      </div>
                      <p className='text-sm text-gray-500'>Chưa có bài đăng</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

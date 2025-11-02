import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'
import ShareDialog from './ShareDialog'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MapPin, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { generateNameId } from '@/utils/utils'
import path from '@/constants/path'
import { useTop5LatestPostByEventCode } from './hooks/useLandingTemplateQueries'

gsap.registerPlugin(ScrollTrigger)

export default function Template4(props: LandingTemplateProps) {
  const { postId } = useParams()

  const eventCode = postId?.split('eC')[1]
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  const { data: latestPosts = [] } = useTop5LatestPostByEventCode(eventCode)

  useEffect(() => {
    // Particle animation on canvas
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.3
      })
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 51, 234, ${particle.opacity})`
        ctx.fill()

        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-content', {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      })

      // Floating elements
      gsap.to('.float-1', {
        y: -30,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      gsap.to('.float-2', {
        y: -20,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5
      })

      gsap.to('.float-3', {
        y: -25,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1
      })

      // Carousel cards with 3D effect
      const updateCarousel = () => {
        const cards = document.querySelectorAll('.carousel-3d-card')
        cards.forEach((card, index) => {
          const position = index - activeIndex
          const offset = position * 380
          const scale = position === 0 ? 1 : 0.85
          const opacity = Math.abs(position) > 1 ? 0 : position === 0 ? 1 : 0.6
          const zIndex = position === 0 ? 10 : 5 - Math.abs(position)
          const rotateY = position * 15

          gsap.to(card, {
            x: offset,
            scale: scale,
            opacity: opacity,
            zIndex: zIndex,
            rotateY: rotateY,
            duration: 0.6,
            ease: 'power2.out'
          })
        })
      }

      updateCarousel()

      // Gallery grid reveal with wave effect
      gsap.from('.grid-card', {
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: 0.8,
        stagger: {
          amount: 1,
          from: 'random'
        },
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top 70%'
        }
      })

      // Related events with flip animation
      gsap.from('.event-flip-card', {
        rotateX: -90,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        transformOrigin: 'center top',
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.events-showcase',
          start: 'top 70%'
        }
      })

      // Social links burst animation
      gsap.from('.social-burst', {
        scale: 0,
        rotation: 360,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.social-section',
          start: 'top 80%'
        }
      })

      // Glowing text effect
      gsap.to('.glow-text', {
        textShadow: '0 0 20px rgba(147, 51, 234, 0.8), 0 0 40px rgba(147, 51, 234, 0.5)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [activeIndex])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % props.images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isAutoPlay, props.images.length])

  return (
    <div ref={containerRef} className='bg-white min-h-screen relative overflow-hidden'>
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className='fixed inset-0 pointer-events-none z-0' style={{ opacity: 0.3 }} />

      {/* Hero Section */}
      <div className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Background with blend mode */}
        <div className='absolute inset-0'>
          <img src={props.bannerUrl} alt={props.title} className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-br from-purple-900/70 via-pink-800/60 to-indigo-900/70 mix-blend-multiply' />
          <div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent' />
        </div>

        {/* Floating decorative elements */}
        <div className='float-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-40' />
        <div className='float-2 absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-40' />
        <div className='float-3 absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-40' />

        {/* Hero Content */}
        <div className='hero-content relative z-10 max-w-6xl mx-auto px-8 text-center'>
          <div className='inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8'>
            {props.authorAvatar && (
              <img src={props.authorAvatar} alt={props.authorName} className='w-10 h-10 rounded-full' />
            )}
            <span className='text-white font-semibold'>{props.authorName}</span>
          </div>

          <h1 className='glow-text text-7xl md:text-9xl font-black text-white mb-8 leading-none'>{props.title}</h1>

          {props.subtitle && (
            <p className='text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent mb-8'>
              {props.subtitle}
            </p>
          )}

          <p className='text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed'>
            {props.description}
          </p>

          <div className='flex items-center justify-center gap-6 text-white text-lg mb-12 flex-wrap'>
            {props.eventDate && (
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full'>
                <Calendar className='w-5 h-5' />
                <span>{props.eventDate}</span>
              </div>
            )}
            {props.eventLocation && (
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full'>
                <MapPin className='w-5 h-5' />
                <span>{props.eventLocation}</span>
              </div>
            )}
          </div>

          <div className='flex gap-6 justify-center flex-wrap'>
            <Button
              size='lg'
              className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-12 py-6 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110'
              onClick={props.onRegister}
            >
              <Sparkles className='w-6 h-6 mr-2' />
              Tham Gia Sự Kiện
            </Button>
            <ShareDialog title={props.title} description={props.description}>
              <Button
                size='lg'
                variant='outline'
                className='border-2 border-white text-white hover:bg-white hover:text-purple-900 text-lg px-12 py-6 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110'
              >
                <Share2 className='w-6 h-6 mr-2' />
                Chia Sẻ
              </Button>
            </ShareDialog>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='relative z-10 max-w-5xl mx-auto px-8 py-24'>
        <div className='text-center mb-16'>
          <h2 className='text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            Về Sự Kiện Này
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full' />
        </div>
        <p className='text-2xl text-gray-700 leading-relaxed text-center'>{props.content}</p>
      </div>

      {/* 3D Carousel Section */}
      <div className='relative py-24 overflow-hidden' style={{ perspective: '2000px' }}>
        <h2 className='text-6xl font-bold text-center mb-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent'>
          Thư Viện Sự Kiện
        </h2>

        <div
          className='relative h-[600px] flex items-center justify-center'
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          <div className='relative w-full max-w-[400px]' style={{ transformStyle: 'preserve-3d' }}>
            {props.images.map((image, index) => (
              <div
                key={image.id}
                className='carousel-3d-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[500px] cursor-pointer'
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => setActiveIndex(index)}
              >
                <div className='relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group'>
                  <img
                    src={image.url}
                    alt={image.caption}
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80'>
                    <div className='absolute bottom-0 left-0 right-0 p-8'>
                      {image.caption && <p className='text-white text-2xl font-bold mb-4'>{image.caption}</p>}
                      <div className='flex items-center gap-8 text-white text-lg'>
                        <button
                          className='flex items-center gap-3 hover:scale-125 transition-transform'
                          onClick={(e) => {
                            e.stopPropagation()
                            props.onLike?.(image.id)
                          }}
                        >
                          <Heart className='w-6 h-6 fill-current' />
                          <span className='font-semibold'>{image.likes || 0}</span>
                        </button>
                        <button
                          className='flex items-center gap-3 hover:scale-125 transition-transform'
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(image)
                            setIsCommentModalOpen(true)
                          }}
                        >
                          <MessageCircle className='w-6 h-6' />
                          <span className='font-semibold'>{image.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className='flex justify-center gap-3 mt-16'>
          {props.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`transition-all duration-300 ${
                index === activeIndex
                  ? 'w-16 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full'
                  : 'w-4 h-4 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className='gallery-grid relative z-10 max-w-7xl mx-auto px-8 py-24'>
        <h2 className='text-5xl font-bold text-center mb-16 text-gray-900'>Nổi Bật Khác</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {props.images.slice(0, 8).map((image) => (
            <div
              key={image.id}
              className='grid-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 aspect-square'
            >
              <img
                src={image.url}
                alt={image.caption}
                className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                <div className='flex items-center gap-4 text-white'>
                  <button className='flex items-center gap-2' onClick={() => props.onLike?.(image.id)}>
                    <Heart className='w-5 h-5' />
                    <span>{image.likes || 0}</span>
                  </button>
                  <button
                    className='flex items-center gap-2'
                    onClick={() => {
                      setSelectedImage(image)
                      setIsCommentModalOpen(true)
                    }}
                  >
                    <MessageCircle className='w-5 h-5' />
                    <span>{image.comments?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Events Section - Unique Design */}
      <div className='events-showcase relative py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent'>
              Khám Phá Thêm Bài Đăng
            </h2>
            <p className='text-xl text-gray-600'>Khám phá những trải nghiệm tuyệt vời khác</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            {latestPosts.map((post) => {
              const nameId = generateNameId({
                name: post.title,
                id: post.postSocialMediaId,
                id_2: post.authorName
              })
              return (
                <Link
                  key={post.postSocialMediaId}
                  to={`${path.user.event.social_media_detail_base}/${nameId}`}
                  className='event-flip-card group block'
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className='relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4'>
                    {/* Image with overlay */}
                    <div className='relative h-72 overflow-hidden'>
                      <img
                        src={post.bannerPostUrl}
                        alt={post.title}
                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/40 to-transparent' />

                      {/* Floating badge */}
                      <div className='absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2'>
                        <Sparkles className='w-4 h-4 text-purple-600' />
                        <span className='text-sm font-semibold text-purple-600'>Nổi Bật</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-8'>
                      <h3 className='text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-3'>
                        {post.title}
                        <ArrowRight className='w-6 h-6 transform group-hover:translate-x-2 transition-transform' />
                      </h3>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{post.description}</p>

                      <div className='space-y-3'>
                        <div className='flex items-center gap-3 text-gray-600'>
                          <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center'>
                            <Calendar className='w-6 h-6 text-purple-600' />
                          </div>
                          <span className='text-lg'>{new Date(post.publishDate).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className='flex items-center gap-4 text-sm text-gray-600'>
                          <span className='flex items-center gap-1'>
                            <Heart className='w-4 h-4' />
                            {post.totalReactions}
                          </span>
                          <span className='flex items-center gap-1'>
                            <MessageCircle className='w-4 h-4' />
                            {post.totalComments}
                          </span>
                        </div>
                      </div>

                      {/* Hover CTA */}
                      <div className='mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-full font-semibold'>
                          Xem Bài Đăng
                        </div>
                      </div>
                    </div>

                    {/* Animated border */}
                    <div className='absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-purple-400 transition-all duration-500 pointer-events-none' />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Social Links Section - Unique Design */}
      <div className='social-section relative py-24 bg-white overflow-hidden'>
        {/* Decorative background */}
        <div className='absolute inset-0 opacity-5'>
          <div className='absolute top-10 left-10 w-64 h-64 bg-purple-600 rounded-full blur-3xl' />
          <div className='absolute bottom-10 right-10 w-64 h-64 bg-pink-600 rounded-full blur-3xl' />
        </div>

        <div className='relative z-10 max-w-5xl mx-auto px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-6xl font-black mb-4 text-gray-900'>
              Giữ{' '}
              <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                Liên Lạc
              </span>
            </h2>
            <p className='text-xl text-gray-600'>Theo dõi chúng tôi trên mạng xã hội để cập nhật</p>
          </div>

          <div className='flex flex-wrap justify-center gap-8'>
            {props.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='social-burst group'
              >
                <div className='relative'>
                  {/* Outer glow ring */}
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 scale-125' />

                  {/* Main button */}
                  <div className='relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12'>
                    <span className='text-white text-3xl font-black uppercase'>{link.platform[0]}</span>
                  </div>

                  {/* Platform name */}
                  <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <span className='text-sm font-semibold text-gray-900 capitalize whitespace-nowrap'>
                      {link.platform}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Additional CTA */}
          <div className='mt-20 text-center'>
            <p className='text-gray-600 mb-6 text-lg'>Đừng bỏ lỡ trải nghiệm tuyệt vời này!</p>
            <Button
              size='lg'
              className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-16 py-8 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110'
              onClick={props.onRegister}
            >
              <Sparkles className='w-6 h-6 mr-3' />
              Đăng Ký Ngay
              <ArrowRight className='w-6 h-6 ml-3' />
            </Button>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        image={selectedImage}
        currentUserId={props.currentUserId}
        onComment={props.onComment}
        onDeleteComment={props.onDeleteComment}
        onUpdateComment={props.onUpdateComment}
        onLike={props.onLike}
        onReaction={props.onReaction}
      />
    </div>
  )
}

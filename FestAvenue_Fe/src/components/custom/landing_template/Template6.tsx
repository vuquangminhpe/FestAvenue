import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'
import ShareDialog from './ShareDialog'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MapPin, Calendar, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Template6(props: LandingTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger fade in for header
      gsap.from('.header-fade', {
        y: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      })

      // Banner zoom and blur effect
      gsap.from('.hero-banner-img', {
        scale: 1.5,
        filter: 'blur(20px)',
        duration: 1.5,
        ease: 'power3.out'
      })

      // Grid items with different entrance animations
      gsap.from('.grid-item-1', {
        x: -100,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.interactive-grid',
          start: 'top 70%'
        }
      })

      gsap.from('.grid-item-2', {
        y: -100,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: '.interactive-grid',
          start: 'top 70%'
        }
      })

      gsap.from('.grid-item-3', {
        x: 100,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        scrollTrigger: {
          trigger: '.interactive-grid',
          start: 'top 70%'
        }
      })

      // Rest of grid items
      gsap.from('.grid-item-rest', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.interactive-grid',
          start: 'top 60%'
        }
      })

      // Interactive hover effects with GSAP
      const gridItems = document.querySelectorAll('.hover-item')
      gridItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            scale: 1.05,
            zIndex: 10,
            duration: 0.3,
            ease: 'power2.out'
          })

          // Scale down neighbors
          const neighbors = Array.from(gridItems).filter((i) => i !== item)
          gsap.to(neighbors, {
            scale: 0.95,
            opacity: 0.7,
            duration: 0.3
          })
        })

        item.addEventListener('mouseleave', () => {
          gsap.to(gridItems, {
            scale: 1,
            opacity: 1,
            zIndex: 1,
            duration: 0.3
          })
        })
      })

      // Floating animation for author card
      gsap.to('.floating-author', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })

      // Events ripple effect
      gsap.from('.ripple-card', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: 'center'
        },
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
          trigger: '.ripple-container',
          start: 'top 75%'
        }
      })

      // Social links wave animation
      gsap.from('.wave-social', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.social-container',
          start: 'top 85%'
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className='bg-white min-h-screen'>
      {/* Hero Banner */}
      <div className='relative h-screen overflow-hidden'>
        <img
          src={props.bannerUrl}
          alt={props.title}
          className='hero-banner-img absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-blue-900/60' />

        <div className='relative z-10 h-full flex flex-col justify-between p-8 md:p-16'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='header-fade'>
              <h3 className='text-2xl font-bold text-white flex items-center gap-2'>
                <Sparkles className='w-6 h-6' />
                {props.authorName}
              </h3>
            </div>
            <div className='header-fade flex gap-4'>
              <ShareDialog title={props.title} description={props.description}>
                <Button variant='outline' className='border-white text-white hover:bg-white/20'>
                  <Share2 className='w-5 h-5' />
                </Button>
              </ShareDialog>
              <Button className='bg-white text-purple-900 hover:bg-gray-100' onClick={props.onRegister}>
                Đăng Ký Ngay
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className='max-w-5xl'>
            <h1 className='header-fade text-6xl md:text-9xl font-black text-white mb-6 leading-none'>{props.title}</h1>
            {props.subtitle && <p className='header-fade text-2xl md:text-4xl text-white/90 mb-6'>{props.subtitle}</p>}
            <p className='header-fade text-xl text-white/80 max-w-3xl'>{props.description}</p>
          </div>

          {/* Event Info */}
          <div className='header-fade flex items-center gap-8 text-white text-lg'>
            {props.eventDate && (
              <span className='flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                {props.eventDate}
              </span>
            )}
            {props.eventLocation && (
              <span className='flex items-center gap-2'>
                <MapPin className='w-5 h-5' />
                {props.eventLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Author Card */}
      <div className='max-w-7xl mx-auto px-8 -mt-20 relative z-20'>
        <div className='floating-author bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl'>
          <div className='flex items-center gap-6'>
            {props.authorAvatar && (
              <img
                src={props.authorAvatar}
                alt={props.authorName}
                className='w-20 h-20 rounded-full border-4 border-white'
              />
            )}
            <div className='flex-1 text-white'>
              <h3 className='text-2xl font-bold mb-2'>{props.authorName}</h3>
              <p className='text-white/90 text-lg'>{props.content.slice(0, 150)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='max-w-4xl mx-auto px-8 py-20'>
        <p className='text-2xl text-gray-700 leading-relaxed'>{props.content}</p>
      </div>

      {/* Interactive Grid Gallery */}
      <div className='interactive-grid max-w-7xl mx-auto px-8 py-20'>
        <h2 className='text-6xl font-bold mb-16 text-center text-gray-900'>Thư Viện</h2>

        <div className='grid grid-cols-12 gap-4'>
          {/* Large featured image */}
          {props.images[0] && (
            <div
              className='grid-item-1 hover-item col-span-12 md:col-span-8 row-span-2 cursor-pointer relative overflow-hidden rounded-3xl shadow-2xl'
              onMouseEnter={() => setHoveredImage(props.images[0].id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img
                src={props.images[0].url}
                alt={props.images[0].caption}
                className='w-full h-[600px] object-cover transition-transform duration-700'
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
                  hoveredImage === props.images[0].id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className='absolute bottom-0 left-0 right-0 p-10'>
                  {props.images[0].caption && (
                    <p className='text-white text-3xl font-bold mb-4'>{props.images[0].caption}</p>
                  )}
                  <div className='flex items-center gap-8 text-white text-xl'>
                    <button className='flex items-center gap-3' onClick={() => props.onLike?.(props.images[0].id)}>
                      <Heart className='w-7 h-7' />
                      <span>{props.images[0].likes || 0}</span>
                    </button>
                    <button
                      className='flex items-center gap-3'
                      onClick={() => {
                        setSelectedImage(props.images[0])
                        setIsCommentModalOpen(true)
                      }}
                    >
                      <MessageCircle className='w-7 h-7' />
                      <span>{props.images[0].comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top right images */}
          {props.images[1] && (
            <div
              className='grid-item-2 hover-item col-span-12 md:col-span-4 cursor-pointer relative overflow-hidden rounded-3xl shadow-xl'
              onMouseEnter={() => setHoveredImage(props.images[1].id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img src={props.images[1].url} alt={props.images[1].caption} className='w-full h-72 object-cover' />
              <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                  hoveredImage === props.images[1].id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className='absolute bottom-0 left-0 right-0 p-6'>
                  {props.images[1].caption && <p className='text-white text-lg mb-3'>{props.images[1].caption}</p>}
                  <div className='flex items-center gap-6 text-white'>
                    <button className='flex items-center gap-2' onClick={() => props.onLike?.(props.images[1].id)}>
                      <Heart className='w-5 h-5' />
                      <span>{props.images[1].likes || 0}</span>
                    </button>
                    <button
                      className='flex items-center gap-2'
                      onClick={() => {
                        setSelectedImage(props.images[1])
                        setIsCommentModalOpen(true)
                      }}
                    >
                      <MessageCircle className='w-5 h-5' />
                      <span>{props.images[1].comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {props.images[2] && (
            <div
              className='grid-item-3 hover-item col-span-12 md:col-span-4 cursor-pointer relative overflow-hidden rounded-3xl shadow-xl'
              onMouseEnter={() => setHoveredImage(props.images[2].id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img src={props.images[2].url} alt={props.images[2].caption} className='w-full h-72 object-cover' />
              <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                  hoveredImage === props.images[2].id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className='absolute bottom-0 left-0 right-0 p-6'>
                  {props.images[2].caption && <p className='text-white text-lg mb-3'>{props.images[2].caption}</p>}
                  <div className='flex items-center gap-6 text-white'>
                    <button className='flex items-center gap-2' onClick={() => props.onLike?.(props.images[2].id)}>
                      <Heart className='w-5 h-5' />
                      <span>{props.images[2].likes || 0}</span>
                    </button>
                    <button
                      className='flex items-center gap-2'
                      onClick={() => {
                        setSelectedImage(props.images[2])
                        setIsCommentModalOpen(true)
                      }}
                    >
                      <MessageCircle className='w-5 h-5' />
                      <span>{props.images[2].comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of the images */}
          {props.images.slice(3).map((image) => (
            <div
              key={image.id}
              className='grid-item-rest hover-item col-span-6 md:col-span-3 cursor-pointer relative overflow-hidden rounded-2xl shadow-lg'
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img src={image.url} alt={image.caption} className='w-full h-64 object-cover' />
              <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                  hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className='absolute bottom-0 left-0 right-0 p-4'>
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
            </div>
          ))}
        </div>
      </div>

      {/* Related Events & Social Links */}
      <div className='bg-gradient-to-b from-white to-gray-100 py-24'>
        <div className='max-w-7xl mx-auto px-8'>
          {/* Related Events */}
          <div className='ripple-container mb-20'>
            <h2 className='text-6xl font-bold mb-16 text-center text-gray-900'>Khám Phá Thêm</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {props.relatedEvents.map((event) => (
                <a
                  key={event.id}
                  href={event.url}
                  className='ripple-card group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500'
                >
                  <div className='relative overflow-hidden h-64'>
                    <img
                      src={event.image}
                      alt={event.title}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent' />
                  </div>
                  <div className='p-8'>
                    <h3 className='text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors'>
                      {event.title}
                    </h3>
                    <div className='space-y-3 text-gray-600 text-lg'>
                      <p className='flex items-center gap-3'>
                        <Calendar className='w-5 h-5' />
                        {event.date}
                      </p>
                      <p className='flex items-center gap-3'>
                        <MapPin className='w-5 h-5' />
                        {event.location}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className='social-container text-center'>
            <h3 className='text-4xl font-bold mb-12 text-gray-900'>Theo Dõi Hành Trình</h3>
            <div className='flex justify-center gap-6'>
              {props.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='wave-social w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-125 transition-all duration-300'
                >
                  {link.platform[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        image={selectedImage}
        onComment={props.onComment}
        onLike={props.onLike}
        onReaction={props.onReaction}
      />
    </div>
  )
}

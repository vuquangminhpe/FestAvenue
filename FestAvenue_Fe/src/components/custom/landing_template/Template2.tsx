import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'

import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MapPin, Calendar, ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Template2(props: LandingTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [cursorText, setCursorText] = useState('View')
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out'
      })
    }

    window.addEventListener('mousemove', moveCursor)

    const ctx = gsap.context(() => {
      // Stagger animation for header
      gsap.from('.header-item', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      })

      // Magnetic effect for images
      const magneticElements = document.querySelectorAll('.magnetic-image')
      magneticElements.forEach((el) => {
        const element = el as HTMLElement
        element.addEventListener('mouseenter', () => {
          setCursorText('View')
          gsap.to(cursor, { scale: 2, duration: 0.3 })
        })
        element.addEventListener('mouseleave', () => {
          gsap.to(cursor, { scale: 1, duration: 0.3 })
          gsap.to(element, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
        })
        element.addEventListener('mousemove', (e) => {
          const rect = element.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          gsap.to(element, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
      })

      // Reveal animations
      gsap.from('.reveal-text', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.content-reveal',
          start: 'top 70%'
        }
      })

      // Image masonry reveal
      gsap.from('.masonry-item', {
        scale: 0,
        rotation: 10,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.masonry-grid',
          start: 'top 70%'
        }
      })

      // Footer slide up
      gsap.from('.footer-section', {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: '.footer-section',
          start: 'top 90%'
        }
      })
    }, containerRef)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={containerRef} className='bg-white min-h-screen relative'>
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className='fixed w-20 h-20 bg-black/80 text-white rounded-full pointer-events-none z-50 flex items-center justify-center text-xs font-medium -translate-x-1/2 -translate-y-1/2'
        style={{ mixBlendMode: 'difference' }}
      >
        {cursorText}
      </div>

      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-8 py-6 flex items-center justify-between'>
          <div className='header-item flex items-center gap-4'>
            {props.authorAvatar && (
              <img src={props.authorAvatar} alt={props.authorName} className='w-12 h-12 rounded-full' />
            )}
            <div>
              <h3 className='font-semibold text-gray-900'>{props.authorName}</h3>
              {props.eventDate && <p className='text-sm text-gray-600'>{props.eventDate}</p>}
            </div>
          </div>
          <div className='header-item flex gap-4'>
            <Button onClick={props.onRegister}>Đăng Ký Ngay</Button>
            <Button variant='outline' onClick={props.onShare}>
              <Share2 className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className='relative h-[60vh]'>
        <img src={props.bannerUrl} alt={props.title} className='w-full h-full object-cover' />
        <div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent' />
      </div>

      {/* Content Section */}
      <div className='content-reveal max-w-4xl mx-auto px-8 py-16 -mt-32 relative z-10'>
        <h1 className='reveal-text text-6xl md:text-8xl font-bold mb-6 text-gray-900'>{props.title}</h1>
        {props.subtitle && <h2 className='reveal-text text-2xl md:text-3xl text-gray-700 mb-8'>{props.subtitle}</h2>}
        <p className='reveal-text text-xl text-gray-600 leading-relaxed mb-8'>{props.description}</p>
        <div className='reveal-text prose prose-lg max-w-none'>
          <p className='text-gray-700'>{props.content}</p>
        </div>
      </div>

      {/* Masonry Image Gallery */}
      <div className='masonry-grid max-w-7xl mx-auto px-8 py-16'>
        <h2 className='text-4xl font-bold mb-12 text-gray-900'>Thư Viện</h2>
        <div className='columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'>
          {props.images.map((image, index) => (
            <div
              key={image.id}
              className='masonry-item magnetic-image break-inside-avoid cursor-pointer'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className='relative group overflow-hidden rounded-2xl shadow-lg'>
                <img
                  src={image.url}
                  alt={image.caption}
                  className='w-full transition-transform duration-700 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='absolute bottom-0 left-0 right-0 p-6'>
                    {image.caption && <p className='text-white text-lg mb-3'>{image.caption}</p>}
                    <div className='flex items-center gap-6 text-white'>
                      <button
                        className='flex items-center gap-2 hover:scale-110 transition-transform'
                        onClick={() => props.onLike?.(image.id)}
                      >
                        <Heart className='w-5 h-5' />
                        <span>{image.likes || 0}</span>
                      </button>
                      <button
                        className='flex items-center gap-2 hover:scale-110 transition-transform'
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
            </div>
          ))}
        </div>
      </div>

      {/* Related Events & Social Links Footer */}
      <div className='footer-section bg-gray-900 text-white py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          {/* Related Events */}
          <div className='mb-16'>
            <h2 className='text-4xl font-bold mb-12'>Sự Kiện Khác</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {props.relatedEvents.map((event) => (
                <a
                  key={event.id}
                  href={event.url}
                  className='group block bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-colors duration-300'
                >
                  <img src={event.image} alt={event.title} className='w-full h-48 object-cover' />
                  <div className='p-6'>
                    <h3 className='text-xl font-semibold mb-3 flex items-center gap-2 group-hover:gap-4 transition-all'>
                      {event.title}
                      <ExternalLink className='w-5 h-5' />
                    </h3>
                    <div className='space-y-2 text-gray-400'>
                      <p className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4' />
                        {event.date}
                      </p>
                      <p className='flex items-center gap-2'>
                        <MapPin className='w-4 h-4' />
                        {event.location}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className='border-t border-gray-800 pt-12'>
            <h3 className='text-2xl font-bold mb-6 text-center'>Theo Dõi Chúng Tôi</h3>
            <div className='flex justify-center gap-6'>
              {props.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-125 transition-transform duration-300 font-bold'
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

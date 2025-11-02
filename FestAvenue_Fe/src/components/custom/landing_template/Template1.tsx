import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'
import ShareDialog from './ShareDialog'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MapPin, Calendar } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Template1(props: LandingTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero banner parallax effect
      gsap.to(bannerRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: bannerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })

      // Title animation
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.hero-title',
          start: 'top 80%'
        }
      })

      // Content fade in
      gsap.from('.content-section', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.content-section',
          start: 'top 80%'
        }
      })

      // Image gallery stagger
      gsap.from('.gallery-item', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top 70%'
        }
      })

      // Related events slide in
      gsap.from('.related-event', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.related-events-section',
          start: 'top 80%'
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className='bg-white min-h-screen'>
      {/* Hero Section with Parallax */}
      <div className='relative h-screen overflow-hidden'>
        <div
          ref={bannerRef}
          className='absolute inset-0 w-full h-[120%]'
          style={{
            backgroundImage: `url(${props.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white' />
        </div>

        <div className='relative z-10 h-full flex items-end pb-24 px-8 md:px-16'>
          <div className='hero-title max-w-4xl'>
            <div className='flex items-center gap-4 mb-4'>
              {props.authorAvatar && (
                <img
                  src={props.authorAvatar}
                  alt={props.authorName}
                  className='w-16 h-16 rounded-full border-4 border-white'
                />
              )}
              <div>
                <h3 className='text-white text-xl font-medium'>{props.authorName}</h3>
                {props.eventDate && (
                  <div className='flex items-center gap-4 mt-1 text-white/90'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      {props.eventDate}
                    </span>
                    {props.eventLocation && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        {props.eventLocation}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <h1 className='text-5xl md:text-7xl font-bold text-white mb-4'>{props.title}</h1>
            {props.subtitle && <p className='text-2xl text-white/90 mb-6'>{props.subtitle}</p>}
            <p className='text-lg text-white/80 max-w-2xl'>{props.description}</p>
            <div className='flex gap-4 mt-8'>
              <Button size='lg' className='bg-white text-black hover:bg-gray-100' onClick={props.onRegister}>
                Đăng Ký Ngay
              </Button>
              <ShareDialog title={props.title} description={props.description}>
                <Button
                  size='lg'
                  variant='outline'
                  className='border-white text-white hover:bg-white/10'
                >
                  <Share2 className='w-5 h-5 mr-2' />
                  Chia Sẻ
                </Button>
              </ShareDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div ref={contentRef} className='content-section max-w-7xl mx-auto px-8 py-16'>
        <div className='prose prose-lg max-w-none'>
          <p className='text-gray-700 leading-relaxed text-xl'>{props.content}</p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className='gallery-grid max-w-7xl mx-auto px-8 py-16'>
        <h2 className='text-4xl font-bold mb-12 text-gray-900'>Điểm Nổi Bật Sự Kiện</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {props.images.map((image) => (
            <div key={image.id} className='gallery-item group cursor-pointer'>
              <div className='relative overflow-hidden rounded-2xl shadow-lg'>
                <img
                  src={image.url}
                  alt={image.caption}
                  className='w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='absolute bottom-0 left-0 right-0 p-6'>
                    {image.caption && <p className='text-white text-lg mb-3'>{image.caption}</p>}
                    <div className='flex items-center gap-4 text-white'>
                      <button
                        className='flex items-center gap-2 hover:text-red-400 transition-colors'
                        onClick={(e) => {
                          e.stopPropagation()
                          props.onLike?.(image.id)
                        }}
                      >
                        <Heart className='w-5 h-5' />
                        <span>{image.likes || 0}</span>
                      </button>
                      <button
                        className='flex items-center gap-2 hover:text-blue-400 transition-colors'
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

      {/* Related Events */}
      <div className='related-events-section bg-gray-50 py-16'>
        <div className='max-w-7xl mx-auto px-8'>
          <h2 className='text-4xl font-bold mb-12 text-gray-900'>Sự Kiện Liên Quan</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {props.relatedEvents.map((event) => (
              <a
                key={event.id}
                href={event.url}
                className='related-event group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300'
              >
                <img src={event.image} alt={event.title} className='w-full h-48 object-cover' />
                <div className='p-6'>
                  <h3 className='text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors'>
                    {event.title}
                  </h3>
                  <div className='space-y-1 text-gray-600'>
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
      </div>

      {/* Social Links */}
      <div className='bg-white py-16'>
        <div className='max-w-7xl mx-auto px-8'>
          <h2 className='text-3xl font-bold mb-8 text-center text-gray-900'>Kết Nối Với Chúng Tôi</h2>
          <div className='flex justify-center gap-6'>
            {props.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300'
              >
                <span className='capitalize'>{link.platform[0]}</span>
              </a>
            ))}
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

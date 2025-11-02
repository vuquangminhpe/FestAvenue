import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'

import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, MapPin, Calendar, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Template3(props: LandingTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the hero section
      ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        pin: '.hero-content',
        pinSpacing: false
      })

      // Progressive banner reveal
      gsap.to('.hero-banner', {
        scale: 1.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })

      // Timeline items animation
      const timelineItems = document.querySelectorAll('.timeline-item')
      timelineItems.forEach((item, index) => {
        const isEven = index % 2 === 0

        gsap.from(item, {
          x: isEven ? -100 : 100,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1
          }
        })

        // Pin timeline items
        ScrollTrigger.create({
          trigger: item,
          start: 'top 20%',
          end: 'bottom 20%',
          onEnter: () => gsap.to(item, { scale: 1.05, duration: 0.3 }),
          onLeave: () => gsap.to(item, { scale: 1, duration: 0.3 }),
          onEnterBack: () => gsap.to(item, { scale: 1.05, duration: 0.3 }),
          onLeaveBack: () => gsap.to(item, { scale: 1, duration: 0.3 })
        })
      })

      // Progress line animation
      gsap.to('.progress-line', {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline-container',
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: 1
        }
      })

      // Related events card flip
      gsap.from('.event-card', {
        rotateY: 90,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.events-grid',
          start: 'top 70%'
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className='bg-white'>
      {/* Hero Section with Pin */}
      <div className='hero-section relative h-screen'>
        <div className='hero-banner absolute inset-0 overflow-hidden'>
          <img src={props.bannerUrl} alt={props.title} className='w-full h-full object-cover scale-100' />
          <div className='absolute inset-0 bg-black/40' />
        </div>

        <div className='hero-content relative z-10 h-full flex items-center justify-center px-8'>
          <div className='text-center max-w-4xl bg-black/30 backdrop-blur-md rounded-3xl p-12'>
            <h1 className='text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg'>{props.title}</h1>
            {props.subtitle && (
              <p className='text-2xl md:text-3xl text-white/90 mb-8 drop-shadow-md'>{props.subtitle}</p>
            )}
            <p className='text-xl text-white/80 mb-12 drop-shadow-md'>{props.description}</p>
            <div className='flex gap-4 justify-center'>
              <Button size='lg' className='bg-white text-black hover:bg-gray-200 shadow-xl' onClick={props.onRegister}>
                Bắt Đầu
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='border-2 border-white text-white hover:bg-white hover:text-black shadow-xl'
              >
                Tìm Hiểu Thêm
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Story Section */}
      <div className='timeline-container relative py-20 px-8' ref={timelineRef}>
        {/* Center Progress Line */}
        <div className='absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2'>
          <div className='progress-line absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-purple-500 to-pink-500' />
        </div>

        <div className='max-w-7xl mx-auto'>
          {/* Author Info */}
          <div className='timeline-item relative mb-32'>
            <div className='flex items-center justify-center mb-12'>
              <div className='bg-white rounded-2xl shadow-xl p-8 flex items-center gap-6 z-10'>
                {props.authorAvatar && (
                  <img src={props.authorAvatar} alt={props.authorName} className='w-20 h-20 rounded-full' />
                )}
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>{props.authorName}</h3>
                  <div className='flex items-center gap-4 mt-2 text-gray-600'>
                    {props.eventDate && (
                      <span className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {props.eventDate}
                      </span>
                    )}
                    {props.eventLocation && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        {props.eventLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content as Timeline Item */}
          <div className='timeline-item relative mb-32'>
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <div className='md:text-right'>
                <h2 className='text-4xl font-bold mb-6 text-gray-900'>Câu Chuyện Của Chúng Tôi</h2>
                <p className='text-lg text-gray-700 leading-relaxed'>{props.content}</p>
              </div>
              <div className='hidden md:block' />
            </div>
          </div>

          {/* Image Timeline Items */}
          {props.images.map((image, index) => {
            const isEven = index % 2 === 0
            return (
              <div key={image.id} className='timeline-item relative mb-32'>
                <div className='grid md:grid-cols-2 gap-16 items-center'>
                  {isEven ? (
                    <>
                      <div className='hidden md:block' />
                      <div className='group'>
                        <div className='relative overflow-hidden rounded-3xl shadow-2xl'>
                          <img
                            src={image.url}
                            alt={image.caption}
                            className='w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'>
                            <div className='absolute bottom-0 left-0 right-0 p-8'>
                              {image.caption && <p className='text-white text-xl mb-4'>{image.caption}</p>}
                              <div className='flex items-center gap-6 text-white'>
                                <button
                                  className='flex items-center gap-2 hover:scale-110 transition-transform'
                                  onClick={() => props.onLike?.(image.id)}
                                >
                                  <Heart className='w-6 h-6' />
                                  <span className='text-lg'>{image.likes || 0}</span>
                                </button>
                                <button
                                  className='flex items-center gap-2 hover:scale-110 transition-transform'
                                  onClick={() => {
                                    setSelectedImage(image)
                                    setIsCommentModalOpen(true)
                                  }}
                                >
                                  <MessageCircle className='w-6 h-6' />
                                  <span className='text-lg'>{image.comments?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='group'>
                        <div className='relative overflow-hidden rounded-3xl shadow-2xl'>
                          <img
                            src={image.url}
                            alt={image.caption}
                            className='w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'>
                            <div className='absolute bottom-0 left-0 right-0 p-8'>
                              {image.caption && <p className='text-white text-xl mb-4'>{image.caption}</p>}
                              <div className='flex items-center gap-6 text-white'>
                                <button
                                  className='flex items-center gap-2 hover:scale-110 transition-transform'
                                  onClick={() => props.onLike?.(image.id)}
                                >
                                  <Heart className='w-6 h-6' />
                                  <span className='text-lg'>{image.likes || 0}</span>
                                </button>
                                <button
                                  className='flex items-center gap-2 hover:scale-110 transition-transform'
                                  onClick={() => {
                                    setSelectedImage(image)
                                    setIsCommentModalOpen(true)
                                  }}
                                >
                                  <MessageCircle className='w-6 h-6' />
                                  <span className='text-lg'>{image.comments?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='hidden md:block' />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Related Events & Social */}
      <div className='bg-gradient-to-br from-purple-50 to-pink-50 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          {/* Related Events */}
          <div className='mb-16'>
            <h2 className='text-5xl font-bold mb-12 text-center text-gray-900'>Khám Phá Thêm Sự Kiện</h2>
            <div className='events-grid grid grid-cols-1 md:grid-cols-3 gap-8'>
              {props.relatedEvents.map((event) => (
                <a
                  key={event.id}
                  href={event.url}
                  className='event-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300'
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className='relative overflow-hidden'>
                    <img
                      src={event.image}
                      alt={event.title}
                      className='w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                  </div>
                  <div className='p-6'>
                    <h3 className='text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2'>
                      {event.title}
                      <ArrowRight className='w-5 h-5 group-hover:translate-x-2 transition-transform' />
                    </h3>
                    <div className='space-y-2 text-gray-600'>
                      <p className='flex items-center gap-2'>
                        <Calendar className='w-5 h-5' />
                        {event.date}
                      </p>
                      <p className='flex items-center gap-2'>
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
          <div className='text-center'>
            <h3 className='text-3xl font-bold mb-8 text-gray-900'>Giữ Liên Lạc</h3>
            <div className='flex justify-center gap-4'>
              {props.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform duration-300 shadow-lg'
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

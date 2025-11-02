import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LandingTemplateProps, SocialMediaImage } from './types'
import CommentModal from './CommentModal'
import ShareDialog from './ShareDialog'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MapPin, Calendar, ArrowUpRight } from 'lucide-react'
import { generateNameId } from '@/utils/utils'
import path from '@/constants/path'
import { useTop5LatestPostByEventCode } from './hooks/useLandingTemplateQueries'

gsap.registerPlugin(ScrollTrigger)

export default function Template5(props: LandingTemplateProps) {
  const { postId } = useParams()

  const eventCode = postId?.split('eC')[1]
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<SocialMediaImage | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  const { data: latestPosts = [] } = useTop5LatestPostByEventCode(eventCode)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal animation (without SplitText plugin)
      gsap.from('.split-title', {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 1.2,
        ease: 'back.out(1.5)'
      })

      // Smooth scroll parallax for banner
      gsap.to('.smooth-banner', {
        y: (_, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          invalidateOnRefresh: true,
          scrub: 1
        }
      })

      // Text reveal on scroll
      const reveals = document.querySelectorAll('.reveal-line')
      reveals.forEach((line) => {
        gsap.from(line, {
          opacity: 0,
          y: 100,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
            end: 'top 50%',
            scrub: 1
          }
        })
      })

      // Image mask reveal
      gsap.from('.mask-reveal', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.5,
        ease: 'power4.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.gallery-reveal',
          start: 'top 70%'
        }
      })

      // Horizontal scroll section
      const horizontalSections = gsap.utils.toArray('.horizontal-card')
      if (horizontalSections.length > 0) {
        gsap.to(horizontalSections, {
          xPercent: -100 * (horizontalSections.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: '.horizontal-container',
            pin: true,
            scrub: 1,
            snap: 1 / (horizontalSections.length - 1),
            end: () => '+=' + (document.querySelector('.horizontal-container') as HTMLElement)!.offsetWidth
          }
        })
      }

      // Fade in events
      gsap.from('.fade-in-card', {
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.events-container',
          start: 'top 75%'
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className='bg-white'>
      {/* Smooth Scroll Hero */}
      <div className='relative h-screen overflow-hidden'>
        <div className='smooth-banner absolute inset-0 w-full h-[150%]' data-speed='0.5'>
          <img src={props.bannerUrl} alt={props.title} className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-black/30' />
        </div>

        <div className='relative z-10 h-full flex items-center justify-center px-8 text-center'>
          <div className='max-w-5xl'>
            <h1 className='split-title text-6xl md:text-9xl font-bold text-white mb-8'>{props.title}</h1>
            {props.subtitle && <p className='reveal-line text-2xl md:text-4xl text-white/90 mb-6'>{props.subtitle}</p>}
            <p className='reveal-line text-xl text-white/80 max-w-3xl mx-auto mb-12'>{props.description}</p>
            <div className='reveal-line flex gap-6 justify-center'>
              <Button
                size='lg'
                className='bg-white text-black hover:bg-gray-100 text-lg px-8 py-6'
                onClick={props.onRegister}
              >
                Đăng Ký Ngay
              </Button>
              <ShareDialog title={props.title} description={props.description}>
                <Button
                  size='lg'
                  variant='outline'
                  className='border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6'
                >
                  <Share2 className='w-5 h-5 mr-2' />
                  Chia Sẻ
                </Button>
              </ShareDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <div className='max-w-7xl mx-auto px-8 py-20'>
        <div className='reveal-line flex items-center gap-8 justify-center'>
          {props.authorAvatar && (
            <img
              src={props.authorAvatar}
              alt={props.authorName}
              className='w-28 h-28 rounded-full border-4 border-gray-200'
            />
          )}
          <div>
            <h3 className='text-3xl font-bold text-gray-900 mb-3'>{props.authorName}</h3>
            <div className='flex items-center gap-6 text-gray-600 text-lg'>
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
      </div>

      {/* Content Reveal Section */}
      <div className='max-w-5xl mx-auto px-8 py-20'>
        <div className='space-y-8 text-3xl md:text-5xl font-light text-gray-800 leading-relaxed'>
          {props.content.split('. ').map((sentence, index) => (
            <p key={index} className='reveal-line'>
              {sentence}.
            </p>
          ))}
        </div>
      </div>

      {/* Gallery with Mask Reveal */}
      <div className='gallery-reveal max-w-7xl mx-auto px-8 py-20'>
        <h2 className='reveal-line text-5xl md:text-7xl font-bold mb-16 text-gray-900'>Câu Chuyện Hình Ảnh</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
          {props.images.slice(0, 4).map((image) => (
            <div key={image.id} className='mask-reveal group relative overflow-hidden rounded-3xl shadow-2xl'>
              <img
                src={image.url}
                alt={image.caption}
                className='w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <div className='absolute bottom-0 left-0 right-0 p-8'>
                  {image.caption && <p className='text-white text-2xl mb-4 font-semibold'>{image.caption}</p>}
                  <div className='flex items-center gap-8 text-white text-lg'>
                    <button
                      className='flex items-center gap-3 hover:scale-110 transition-transform'
                      onClick={() => props.onLike?.(image.id)}
                    >
                      <Heart className='w-6 h-6' />
                      <span>{image.likes || 0}</span>
                    </button>
                    <button
                      className='flex items-center gap-3 hover:scale-110 transition-transform'
                      onClick={() => {
                        setSelectedImage(image)
                        setIsCommentModalOpen(true)
                      }}
                    >
                      <MessageCircle className='w-6 h-6' />
                      <span>{image.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Scroll Section (if more images) */}
      {props.images.length > 4 && (
        <div className='horizontal-container relative h-screen my-20'>
          <div className='sticky top-0 h-screen flex items-center overflow-hidden'>
            <div className='flex gap-8 px-8'>
              {props.images.slice(4).map((image) => (
                <div key={image.id} className='horizontal-card flex-shrink-0 w-[500px] h-[600px]'>
                  <div className='relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group'>
                    <img src={image.url} alt={image.caption} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent'>
                      <div className='absolute bottom-0 left-0 right-0 p-8'>
                        {image.caption && <p className='text-white text-2xl mb-4 font-semibold'>{image.caption}</p>}
                        <div className='flex items-center gap-8 text-white text-lg'>
                          <button className='flex items-center gap-3' onClick={() => props.onLike?.(image.id)}>
                            <Heart className='w-6 h-6' />
                            <span>{image.likes || 0}</span>
                          </button>
                          <button
                            className='flex items-center gap-3'
                            onClick={() => {
                              setSelectedImage(image)
                              setIsCommentModalOpen(true)
                            }}
                          >
                            <MessageCircle className='w-6 h-6' />
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
        </div>
      )}

      {/* Related Events & Social */}
      <div className='events-container bg-gray-50 py-24'>
        <div className='max-w-7xl mx-auto px-8'>
          <h2 className='reveal-line text-5xl md:text-7xl font-bold mb-16 text-center text-gray-900'>Bài Đăng Khác</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-12 mb-20'>
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
                  className='fade-in-card group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4'
                >
                  <div className='relative overflow-hidden h-72'>
                    <img
                      src={post.bannerPostUrl}
                      alt={post.title}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                    <div className='absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300'>
                      <ArrowUpRight className='w-6 h-6 text-gray-900' />
                    </div>
                  </div>
                  <div className='p-8'>
                    <h3 className='text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors'>
                      {post.title}
                    </h3>
                    <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{post.description}</p>
                    <div className='space-y-3 text-gray-600 text-lg'>
                      <p className='flex items-center gap-3'>
                        <Calendar className='w-5 h-5' />
                        {new Date(post.publishDate).toLocaleDateString('vi-VN')}
                      </p>
                      <div className='flex items-center gap-4 text-sm'>
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
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Social Links */}
          <div className='text-center'>
            <h3 className='reveal-line text-4xl font-bold mb-12 text-gray-900'>Kết Nối</h3>
            <div className='flex justify-center gap-8'>
              {props.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='fade-in-card w-20 h-20 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-bold hover:bg-purple-600 hover:scale-125 transition-all duration-300 shadow-lg'
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

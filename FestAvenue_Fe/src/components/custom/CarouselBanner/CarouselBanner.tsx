/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gsap } from 'gsap'
import { Button } from '../../ui/button'
import Test1 from '../../../../public/avatar2.jpg'
import Test2 from '../../../../public/avenger_endgame.jpg'
import Test3 from '../../../../public/spidermanAcross.jpg'
import Test4 from '../../../../public/johnWick4.png'

interface CarouselItem {
  id: number
  image: string
  author: string
  title: string
  topic: string
  description: string
}

interface CarouselBannerProps {
  items?: CarouselItem[]
}

const defaultItems: CarouselItem[] = [
  {
    id: 1,
    image: Test1,
    author: 'EVENT CONNECT',
    title: 'MOVIE SLIDER',
    topic: 'CINEMA',
    description:
      'Experience the magic of cinema with our curated collection of the latest blockbusters and timeless classics. Immerse yourself in stories that captivate, inspire, and entertain audiences worldwide.'
  },
  {
    id: 2,
    image: Test2,
    author: 'EVENT CONNECT',
    title: 'FEATURED FILMS',
    topic: 'DRAMA',
    description:
      'Discover compelling narratives and powerful performances in our featured film collection. From award-winning dramas to thrilling adventures, find your next favorite movie experience.'
  },
  {
    id: 3,
    image: Test3,
    author: 'EVENT CONNECT',
    title: 'NEW RELEASES',
    topic: 'ACTION',
    description:
      'Stay up to date with the latest releases and upcoming blockbusters. Get exclusive access to trailers, behind-the-scenes content, and early screening opportunities.'
  },
  {
    id: 4,
    image: Test4,
    author: 'EVENT CONNECT',
    title: 'CLASSIC COLLECTION',
    topic: 'VINTAGE',
    description:
      'Revisit the golden age of cinema with our carefully preserved classic collection. Experience the timeless stories that have shaped modern filmmaking and continue to inspire new generations.'
  }
]

const CarouselBanner: React.FC<CarouselBannerProps> = ({ items = defaultItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)
  const timebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const timeRunning = 1800
  const timeAutoNext = 7000

  const createSilkyTransition = (newIdx: number, direction?: 'next' | 'prev') => {
    if (isAnimating || newIdx === currentIndex) return

    setIsAnimating(true)

    const carousel = carouselRef.current
    if (!carousel) {
      setIsAnimating(false)
      return
    }

    const currentSlide = carousel.querySelector(`[data-slide="${currentIndex}"]`)
    const newSlide = carousel.querySelector(`[data-slide="${newIdx}"]`)
    const overlay = overlayRef.current

    if (!currentSlide || !newSlide) {
      setIsAnimating(false)
      return
    }

    // Get elements for animation
    const currentImg = currentSlide.querySelector('img')
    const currentContent = currentSlide.querySelectorAll('.content > div > *')
    const newImg = newSlide.querySelector('img')
    const newContent = newSlide.querySelectorAll('.content > div > *')

    // ULTRA SMOOTH GSAP Timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        // Clean up and update state
        gsap.set([currentSlide, newSlide], { clearProps: 'all' })
        gsap.set([currentImg, newImg], { clearProps: 'all' })
        gsap.set([currentContent, newContent], { clearProps: 'all' })
        if (overlay) gsap.set(overlay, { clearProps: 'all' })

        // Update current index AFTER animation completes
        setCurrentIndex(newIdx)
        setIsAnimating(false)
      }
    })

    // Set initial states
    tl.set(newSlide, { zIndex: 3, opacity: 1 })
      .set(currentSlide, { zIndex: 2 })

      // SPECIAL EFFECT: Magic overlay
      .to(
        overlay,
        {
          duration: 0.4,
          opacity: 0.6,
          scale: 1.1,
          ease: 'power1.inOut'
        },
        0
      )

      // PHASE 1: Silky smooth shrink to center
      .to(
        currentImg,
        {
          duration: 0.8,
          scale: 0.02,
          x: 0,
          y: 0,
          transformOrigin: 'center center',
          opacity: 0,
          filter: 'blur(8px)',
          ease: 'power2.inOut'
        },
        0
      )

      // PHASE 1: Gentle content fade
      .to(
        currentContent,
        {
          duration: 0.6,
          y: direction === 'next' ? -30 : 30,
          opacity: 0,
          scale: 0.95,
          filter: 'blur(4px)',
          stagger: 0.06,
          ease: 'power2.inOut'
        },
        0
      )

      // PHASE 2: New image magical appearance from center
      .fromTo(
        newImg,
        {
          scale: 0.02,
          x: 0,
          y: 0,
          transformOrigin: 'center center',
          opacity: 0,
          filter: 'blur(12px)'
        },
        {
          duration: 1,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'power2.out'
        },
        0.4
      )

      // PHASE 3: Content graceful entrance
      .fromTo(
        newContent,
        {
          y: direction === 'next' ? 50 : -50,
          opacity: 0,
          scale: 0.9,
          filter: 'blur(6px)'
        },
        {
          duration: 0.9,
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          stagger: 0.08,
          ease: 'power2.out'
        },
        0.7
      )

      // Clear overlay
      .to(
        overlay,
        {
          duration: 0.5,
          opacity: 0,
          scale: 1,
          ease: 'power1.inOut'
        },
        0.8
      )

      // Clean up z-index
      .set(currentSlide, { zIndex: 1 }, 1.3)

    // Enhanced progress bar
    if (timebarRef.current) {
      gsap.fromTo(
        timebarRef.current,
        { width: '100%' },
        {
          width: '0%',
          duration: timeRunning / 1000,
          ease: 'linear'
        }
      )
    }
  }

  const handleNext = () => {
    if (isAnimating) return
    const newIndex = (currentIndex + 1) % items.length
    createSilkyTransition(newIndex, 'next')
  }

  const handlePrev = () => {
    if (isAnimating) return
    const newIndex = (currentIndex - 1 + items.length) % items.length
    createSilkyTransition(newIndex, 'prev')
  }

  const handleThumbnailClick = (index: number) => {
    if (isAnimating || index === currentIndex) return
    const direction = index > currentIndex ? 'next' : 'prev'
    createSilkyTransition(index, direction)
  }

  // Auto-play functionality
  useEffect(() => {
    if (isAnimating) return

    const runNextAuto = setTimeout(() => {
      handleNext()
    }, timeAutoNext)

    return () => clearTimeout(runNextAuto)
  }, [currentIndex, isAnimating])

  // Initialize first slide
  useEffect(() => {
    if (carouselRef.current) {
      const firstSlide = carouselRef.current.querySelector(`[data-slide="0"]`)
      if (firstSlide) {
        // Set all slides to proper initial state
        const allSlides = carouselRef.current.querySelectorAll('[data-slide]')
        allSlides.forEach((slide, index) => {
          if (index === 0) {
            gsap.set(slide, { opacity: 1, zIndex: 2 })
          } else {
            gsap.set(slide, { opacity: 0, zIndex: 1 })
          }
        })

        // Initial animation for first slide
        gsap.fromTo(
          firstSlide.querySelector('img'),
          {
            scale: 0.8,
            opacity: 0,
            filter: 'blur(20px)'
          },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'power2.out'
          }
        )

        gsap.fromTo(
          firstSlide.querySelectorAll('.content > div > *'),
          {
            y: 80,
            opacity: 0,
            scale: 0.8,
            filter: 'blur(10px)'
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.15,
            ease: 'power2.out',
            delay: 0.8
          }
        )
      }
    }
  }, [])

  return (
    <>
      <style>{`
        /* Enhanced base styles */
        .carousel {
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .carousel .list .item {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          transform-style: preserve-3d;
        }

        .carousel .list .item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        /* Magic overlay */
        .magic-overlay {
          background: radial-gradient(circle at center, 
            rgba(249, 115, 22, 0.1) 0%, 
            rgba(0, 0, 0, 0.4) 50%, 
            rgba(0, 0, 0, 0.8) 100%);
          backdrop-filter: blur(3px);
        }

        /* Ultra smooth thumbnails */
        .thumbnail .item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-style: preserve-3d;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .thumbnail .item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%) translateY(-100%);
          transition: transform 0.6s ease;
          z-index: 2;
        }

        .thumbnail .item:hover::before {
          transform: translateX(100%) translateY(100%);
        }

        .thumbnail .item:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
          filter: brightness(1.1);
        }

        .thumbnail .item.active {
          border-color: #f97316 !important;
          box-shadow: 
            0 0 30px rgba(249, 115, 22, 0.8),
            0 15px 30px rgba(0,0,0,0.4);
          transform: scale(1.03);
        }

        .thumbnail .item.active::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #f97316, #ea580c, #dc2626, #f97316);
          border-radius: inherit;
          z-index: -1;
          animation: borderFlow 3s linear infinite;
          background-size: 300% 300%;
        }

        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Silk-smooth buttons */
        .navigation-button {
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;
        }

        .navigation-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .navigation-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
          transform: translateX(-100%) translateY(-100%);
          transition: transform 0.6s ease;
        }

        .navigation-button:hover::before {
          transform: translateX(100%) translateY(100%);
        }

        .navigation-button:hover:not(:disabled) {
          transform: scale(1.08);
          backdrop-filter: blur(25px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }

        .navigation-button:active:not(:disabled) {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }

        /* Enhanced progress bar */
        .progress-bar {
          background: linear-gradient(90deg, #f97316, #ea580c, #dc2626);
          background-size: 200% 100%;
          animation: progressFlow 2s linear infinite;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
        }

        @keyframes progressFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .content {
            padding: 0 1rem !important;
            top: 15% !important;
          }
          
          .content > div {
            max-width: 90% !important;
            padding-right: 10% !important;
          }
          
          .title {
            font-size: 3rem !important;
          }
          
          .topic {
            font-size: 3rem !important;
          }
          
          .des {
            font-size: 0.875rem !important;
          }
          
          .thumbnail {
            bottom: 6rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 0.75rem !important;
          }
          
          .thumbnail .item {
            width: 4rem !important;
            height: 5rem !important;
          }
          
          .arrows {
            bottom: 1rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 1rem !important;
          }
          
          .navigation-button {
            width: 3rem !important;
            height: 3rem !important;
          }
        }

        @media (max-width: 480px) {
          .title {
            font-size: 2.5rem !important;
          }
          
          .topic {
            font-size: 2.5rem !important;
          }
          
          .buttons {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .buttons button {
            font-size: 0.875rem !important;
            padding: 0.75rem 1.5rem !important;
          }
        }
      `}</style>

      <div ref={carouselRef} className='carousel relative h-screen w-full overflow-hidden bg-black'>
        {/* Magic transition overlay */}
        <div ref={overlayRef} className='magic-overlay absolute inset-0 z-[50] opacity-0 pointer-events-none' />

        {/* Enhanced progress bar */}
        <div ref={timebarRef} className='progress-bar absolute top-0 left-0 h-1 z-[1000]' style={{ width: '0%' }} />

        {/* Main slider */}
        <div className='list relative w-full h-full'>
          {items.map((item, index) => (
            <div
              key={item.id}
              data-slide={index}
              className='item'
              style={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 2 : 1
              }}
            >
              <img src={item.image} alt={item.title} className='w-full h-full object-cover' />
              <div className='content absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-8 text-white'>
                <div className='max-w-[60%] pr-[30%]'>
                  <div className='author font-bold tracking-[10px] text-sm mb-4 text-white/90 drop-shadow-md'>
                    {item.author}
                  </div>
                  <h1 className='title text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-2 drop-shadow-2xl'>
                    {item.title}
                  </h1>
                  <h2 className='topic text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6 text-orange-500 drop-shadow-2xl'>
                    {item.topic}
                  </h2>
                  <p className='des text-base lg:text-lg mb-8 leading-relaxed text-white/90 drop-shadow-lg'>
                    {item.description}
                  </p>
                  <div className='buttons flex gap-4'>
                    <Button
                      size='lg'
                      className='bg-white text-black hover:bg-white/90 font-medium tracking-wider px-6 lg:px-8 transform hover:scale-105 transition-all duration-300 shadow-xl'
                    >
                      SEE MORE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows with fixed interaction */}
        <div className='arrows absolute bottom-12 right-8 flex flex-col gap-4 z-[300]'>
          <Button
            onClick={handlePrev}
            disabled={isAnimating}
            size='icon'
            className='navigation-button w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl'
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronLeft className='w-7 h-7' />
          </Button>
          <Button
            onClick={handleNext}
            disabled={isAnimating}
            size='icon'
            className='navigation-button w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl'
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronRight className='w-7 h-7' />
          </Button>
        </div>

        {/* Fixed thumbnails with correct active state */}
        <div className='thumbnail absolute bottom-16 right-36 flex flex-col gap-4 z-[200]'>
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className={`item w-24 h-32 lg:w-28 lg:h-36 flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex ? 'active border-orange-500' : 'border-white/20 hover:border-white/60'
              }`}
              style={{
                pointerEvents: isAnimating ? 'none' : 'auto',
                cursor: isAnimating ? 'default' : 'pointer'
              }}
            >
              <img src={item.image} alt={item.title} className='w-full h-full object-cover' />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />
              <div className='content absolute bottom-2 left-2 right-2 text-white'>
                <div className='title font-semibold text-xs truncate drop-shadow-md'>{item.title}</div>
                <div className='description font-light text-xs text-orange-300 truncate'>{item.topic}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default CarouselBanner

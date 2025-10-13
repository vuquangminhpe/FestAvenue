/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../ui/button'
import OptimizedImage from '../OptimizedImage'

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
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1920&q=80',
    author: 'EVENT CONNECT',
    title: 'MOVIE SLIDER',
    topic: 'CINEMA',
    description:
      'Experience the magic of cinema with our curated collection of the latest blockbusters and timeless classics. Immerse yourself in stories that captivate, inspire, and entertain audiences worldwide.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&q=80',
    author: 'EVENT CONNECT',
    title: 'FEATURED FILMS',
    topic: 'DRAMA',
    description:
      'Discover compelling narratives and powerful performances in our featured film collection. From award-winning dramas to thrilling adventures, find your next favorite movie experience.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
    author: 'EVENT CONNECT',
    title: 'NEW RELEASES',
    topic: 'ACTION',
    description:
      'Stay up to date with the latest releases and upcoming blockbusters. Get exclusive access to trailers, behind-the-scenes content, and early screening opportunities.'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80',
    author: 'EVENT CONNECT',
    title: 'CLASSIC COLLECTION',
    topic: 'VINTAGE',
    description:
      'Revisit the golden age of cinema with our carefully preserved classic collection. Experience the timeless stories that have shaped modern filmmaking and continue to inspire new generations.'
  }
]

const CarouselBannerOptimized: React.FC<CarouselBannerProps> = ({ items = defaultItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const timeAutoNext = 7000
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsFirstLoad(false)
    setPreviousIndex(currentIndex)
    setDirection('next')
    setIsAnimating(true)

    // Start animation immediately with double RAF for smoother start
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newIndex = (currentIndex + 1) % items.length
        setCurrentIndex(newIndex)
      })
    })

    // End animation after CSS animation completes (1.2s for image + 1s for content)
    setTimeout(() => {
      setIsAnimating(false)
      setPreviousIndex(null)
    }, 1500)
  }, [isAnimating, currentIndex, items.length])

  const handlePrev = () => {
    if (isAnimating) return
    setIsFirstLoad(false)
    setPreviousIndex(currentIndex)
    setDirection('prev')
    setIsAnimating(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newIndex = (currentIndex - 1 + items.length) % items.length
        setCurrentIndex(newIndex)
      })
    })

    setTimeout(() => {
      setIsAnimating(false)
      setPreviousIndex(null)
    }, 1500)
  }

  const handleThumbnailClick = (index: number) => {
    if (isAnimating || index === currentIndex) return
    setIsFirstLoad(false)
    setPreviousIndex(currentIndex)
    setDirection(index > currentIndex ? 'next' : 'prev')
    setIsAnimating(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentIndex(index)
      })
    })

    setTimeout(() => {
      setIsAnimating(false)
      setPreviousIndex(null)
    }, 1500)
  }

  useEffect(() => {
    // Disable first load animation after initial render
    const timer = setTimeout(() => {
      setIsFirstLoad(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Separate effect for auto-play
  useEffect(() => {
    // Don't start auto-play during animation
    if (isAnimating) return

    // Clear existing timeout
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current)
    }

    // Set new timeout for auto-play
    autoPlayRef.current = setTimeout(() => {
      handleNext()
    }, timeAutoNext)

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current)
      }
    }
  }, [currentIndex, isAnimating, items.length, handleNext])

  return (
    <>
      <style>{`
        /* Ultra-smooth CSS Animations with 60fps optimization */
        @keyframes slideInFromCenter {
          0% {
            transform: scale3d(0.5, 0.5, 1) translate3d(0, 0, 0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        @keyframes slideOutToCenter {
          0% {
            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale3d(0.5, 0.5, 1) translate3d(0, 0, 0);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          0% {
            transform: translate3d(0, 60px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        @keyframes fadeOutUp {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, -40px, 0);
            opacity: 0;
          }
        }

        @keyframes fadeInDown {
          0% {
            transform: translate3d(0, -60px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        @keyframes fadeOutDown {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 40px, 0);
            opacity: 0;
          }
        }

        @keyframes progressBar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        @keyframes overlayPulse {
          0%, 100% {
            opacity: 0;
            transform: scale3d(1, 1, 1);
          }
          40% {
            opacity: 0.5;
            transform: scale3d(1.05, 1.05, 1);
          }
        }

        /* Carousel base styles with hardware acceleration */
        .carousel-optimized {
          perspective: 2000px;
          transform-style: preserve-3d;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .carousel-optimized .item {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .carousel-optimized .item.active {
          z-index: 3;
        }

        .carousel-optimized .item.exiting {
          z-index: 2;
        }

        /* Force GPU acceleration and smooth rendering */
        .carousel-optimized .item-image {
          transform-origin: center center;
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .carousel-optimized .content > div > * {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
        }

        /* Image animations - Active (new image) with smooth easing */
        .carousel-optimized .item.active.animating-next .item-image,
        .carousel-optimized .item.active.animating-prev .item-image {
          animation: slideInFromCenter 1.2s cubic-bezier(0.33, 1, 0.68, 1) forwards;
          animation-delay: 0.3s;
          transform: scale3d(0.5, 0.5, 1) translate3d(0, 0, 0);
          opacity: 0;
        }

        /* Image animations - Exiting (old image) */
        .carousel-optimized .item.exiting.animating-next .item-image,
        .carousel-optimized .item.exiting.animating-prev .item-image {
          animation: slideOutToCenter 0.9s cubic-bezier(0.32, 0, 0.67, 0) forwards;
          transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
          opacity: 1;
        }

        /* Content animations - Active with buttery smooth easing */
        .carousel-optimized .item.active.animating-next .content > div > * {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translate3d(0, 60px, 0);
        }

        .carousel-optimized .item.active.animating-prev .content > div > * {
          animation: fadeInDown 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translate3d(0, -60px, 0);
        }

        /* Content animations - Exiting */
        .carousel-optimized .item.exiting.animating-next .content > div > * {
          animation: fadeOutUp 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        .carousel-optimized .item.exiting.animating-prev .content > div > * {
          animation: fadeOutDown 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        /* Smooth stagger for active content */
        .carousel-optimized .item.active .content > div > *:nth-child(1) {
          animation-delay: 0.6s !important;
        }
        .carousel-optimized .item.active .content > div > *:nth-child(2) {
          animation-delay: 0.7s !important;
        }
        .carousel-optimized .item.active .content > div > *:nth-child(3) {
          animation-delay: 0.8s !important;
        }
        .carousel-optimized .item.active .content > div > *:nth-child(4) {
          animation-delay: 0.9s !important;
        }
        .carousel-optimized .item.active .content > div > *:nth-child(5) {
          animation-delay: 1s !important;
        }

        /* Quick stagger for exiting content */
        .carousel-optimized .item.exiting .content > div > *:nth-child(1) {
          animation-delay: 0s !important;
        }
        .carousel-optimized .item.exiting .content > div > *:nth-child(2) {
          animation-delay: 0.05s !important;
        }
        .carousel-optimized .item.exiting .content > div > *:nth-child(3) {
          animation-delay: 0.1s !important;
        }
        .carousel-optimized .item.exiting .content > div > *:nth-child(4) {
          animation-delay: 0.15s !important;
        }
        .carousel-optimized .item.exiting .content > div > *:nth-child(5) {
          animation-delay: 0.2s !important;
        }

        /* Initial load animation - extra smooth */
        .carousel-optimized .item.initial .item-image {
          animation: slideInFromCenter 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .carousel-optimized .item.initial .content > div > * {
          animation: fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .carousel-optimized .item.initial .content > div > *:nth-child(1) {
          animation-delay: 1s !important;
        }
        .carousel-optimized .item.initial .content > div > *:nth-child(2) {
          animation-delay: 1.15s !important;
        }
        .carousel-optimized .item.initial .content > div > *:nth-child(3) {
          animation-delay: 1.3s !important;
        }
        .carousel-optimized .item.initial .content > div > *:nth-child(4) {
          animation-delay: 1.45s !important;
        }
        .carousel-optimized .item.initial .content > div > *:nth-child(5) {
          animation-delay: 1.6s !important;
        }

        /* Magic overlay with smooth pulse */
        .magic-overlay.animating {
          animation: overlayPulse 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .magic-overlay {
          background: radial-gradient(circle at center, 
            rgba(249, 115, 22, 0.08) 0%, 
            rgba(0, 0, 0, 0.3) 50%, 
            rgba(0, 0, 0, 0.6) 100%);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        /* Progress bar */
        .progress-bar-optimized {
          background: linear-gradient(90deg, #f97316, #ea580c, #dc2626);
          background-size: 200% 100%;
          animation: progressBar 7s linear infinite, progressFlow 2s linear infinite;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
        }

        @keyframes progressFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        /* Thumbnails */
        .thumbnail-optimized .item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-style: preserve-3d;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          will-change: transform;
        }

        .thumbnail-optimized .item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%) translateY(-100%);
          transition: transform 0.6s ease;
          z-index: 2;
        }

        .thumbnail-optimized .item:hover::before {
          transform: translateX(100%) translateY(100%);
        }

        .thumbnail-optimized .item:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
          filter: brightness(1.1);
        }

        .thumbnail-optimized .item.active {
          border-color: #f97316 !important;
          box-shadow: 
            0 0 30px rgba(249, 115, 22, 0.8),
            0 15px 30px rgba(0,0,0,0.4);
          transform: scale(1.03);
        }

        .thumbnail-optimized .item.active::after {
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

        /* Navigation buttons */
        .navigation-button-optimized {
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;
          will-change: transform;
        }

        .navigation-button-optimized:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .navigation-button-optimized::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
          transform: translateX(-100%) translateY(-100%);
          transition: transform 0.6s ease;
        }

        .navigation-button-optimized:hover::before {
          transform: translateX(100%) translateY(100%);
        }

        .navigation-button-optimized:hover:not(:disabled) {
          transform: scale(1.08);
          backdrop-filter: blur(25px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }

        .navigation-button-optimized:active:not(:disabled) {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1rem !important;
            top: 15% !important;
          }
          
          .content-inner {
            max-width: 90% !important;
            padding-right: 10% !important;
          }
          
          .title-text {
            font-size: 3rem !important;
          }
          
          .topic-text {
            font-size: 3rem !important;
          }
          
          .des-text {
            font-size: 0.875rem !important;
          }
          
          .thumbnail-optimized {
            bottom: 6rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 0.75rem !important;
          }
          
          .thumbnail-optimized .item {
            width: 4rem !important;
            height: 5rem !important;
          }
          
          .arrows-container {
            bottom: 1rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 1rem !important;
          }
          
          .navigation-button-optimized {
            width: 3rem !important;
            height: 3rem !important;
          }
        }

        @media (max-width: 480px) {
          .title-text {
            font-size: 2.5rem !important;
          }
          
          .topic-text {
            font-size: 2.5rem !important;
          }
          
          .buttons-container {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .buttons-container button {
            font-size: 0.875rem !important;
            padding: 0.75rem 1.5rem !important;
          }
        }
      `}</style>

      <div className='carousel-optimized relative h-screen w-full overflow-hidden bg-black'>
        {/* Magic transition overlay */}
        <div
          className={`magic-overlay absolute inset-0 z-[50] opacity-0 pointer-events-none ${
            isAnimating ? 'animating' : ''
          }`}
        />

        {/* Enhanced progress bar */}
        <div className='progress-bar-optimized absolute top-0 left-0 h-1 z-[1000]' />

        {/* Main slider */}
        <div className='list relative w-full h-full'>
          {items.map((item, index) => {
            const isActive = index === currentIndex
            const isExiting = previousIndex !== null && index === previousIndex
            const isVisible = isActive || isExiting
            const isInitial = index === 0 && isFirstLoad && !isAnimating

            return (
              <div
                key={item.id}
                className={`item ${isActive ? 'active' : ''} ${isExiting ? 'exiting' : ''} ${
                  isInitial ? 'initial' : ''
                } ${isAnimating && (isActive || isExiting) ? `animating-${direction}` : ''}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  zIndex: isActive ? 3 : isExiting ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                  visibility: isVisible ? 'visible' : 'hidden'
                }}
              >
                <div className='item-image w-full h-full'>
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
                    width={1920}
                    height={1080}
                    className='w-full h-full'
                    priority={index === 0}
                    sizes='100vw'
                    aspectRatio=''
                  />
                </div>
                <div className='content content-wrapper absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-8 text-white'>
                  <div className='content-inner max-w-[60%] pr-[30%]'>
                    <div className='author font-bold tracking-[10px] text-sm mb-4 text-white/90 drop-shadow-md'>
                      {item.author}
                    </div>
                    <h1 className='title title-text text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-2 drop-shadow-2xl'>
                      {item.title}
                    </h1>
                    <h2 className='topic topic-text text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6 text-orange-500 drop-shadow-2xl'>
                      {item.topic}
                    </h2>
                    <p className='des des-text text-base lg:text-lg mb-8 leading-relaxed text-white/90 drop-shadow-lg'>
                      {item.description}
                    </p>
                    <div className='buttons buttons-container flex gap-4'>
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
            )
          })}
        </div>

        {/* Navigation arrows */}
        <div className='arrows arrows-container absolute bottom-12 right-8 flex flex-col gap-4 z-[300]'>
          <Button
            onClick={handlePrev}
            disabled={isAnimating}
            size='icon'
            className='navigation-button-optimized w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl'
          >
            <ChevronLeft className='w-7 h-7' />
          </Button>
          <Button
            onClick={handleNext}
            disabled={isAnimating}
            size='icon'
            className='navigation-button-optimized w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl'
          >
            <ChevronRight className='w-7 h-7' />
          </Button>
        </div>

        {/* Thumbnails */}
        <div className='thumbnail thumbnail-optimized absolute bottom-16 right-36 flex flex-col gap-4 z-[200]'>
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
              <OptimizedImage
                src={item.image}
                alt={item.title}
                width={200}
                height={250}
                className='w-full h-full'
                priority={index < 4}
                sizes='(max-width: 1024px) 64px, 112px'
                aspectRatio=''
              />
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

export default CarouselBannerOptimized

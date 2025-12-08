/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../ui/button'
import OptimizedImage from '../OptimizedImage'
import { useQuery } from '@tanstack/react-query'
import bannerApis from '@/apis/banner.api'
import type { Banner } from '@/types/banner.types'

const CarouselBannerOptimized: React.FC = () => {
  // Fetch banner data
  const { data: bannerData, isLoading } = useQuery({
    queryKey: ['bannerSliderHome'],
    queryFn: () => bannerApis.getBannerSliderHomeActive(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  const items: Banner[] = ((bannerData as any)?.data || []) as Banner[]

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
  }, [isAnimating, currentIndex, items?.length])

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
  }, [currentIndex, isAnimating, items?.length, handleNext])

  // Show loading state
  if (isLoading || items.length === 0) {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .shimmer {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.05) 20%,
              rgba(255, 255, 255, 0.1) 40%,
              rgba(255, 255, 255, 0.05) 60%,
              rgba(255, 255, 255, 0) 100%
            );
            background-size: 1000px 100%;
          }

          .pulse-animation {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
        <div className='relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900'>
          {/* Animated background */}
          <div className='absolute inset-0 overflow-hidden'>
            <div className='absolute w-full h-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 animate-pulse' />
            <div className='shimmer absolute inset-0' />
          </div>

          {/* Loading content */}
          <div className='relative z-10 flex flex-col items-center justify-center h-full px-4'>
            {/* Spinner */}
            <div className='relative mb-8'>
              <div className='w-20 h-20 border-4 border-orange-500/20 rounded-full' />
              <div
                className='absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin'
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </div>

            {/* Text */}
            <div className='text-center space-y-3'>
              {' '}
              <div className='flex items-center justify-center gap-1'>
                <div className='w-2 h-2 bg-orange-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                <div
                  className='w-2 h-2 bg-orange-500 rounded-full animate-bounce'
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className='w-2 h-2 bg-orange-500 rounded-full animate-bounce'
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>

            {/* Skeleton preview */}
            <div className='mt-12 w-full max-w-4xl space-y-4'>
              <div className='h-8 bg-white/10 rounded-lg shimmer pulse-animation' style={{ width: '60%' }} />
              <div className='h-12 bg-white/10 rounded-lg shimmer pulse-animation' style={{ width: '80%' }} />
              <div className='h-6 bg-white/10 rounded-lg shimmer pulse-animation' style={{ width: '70%' }} />
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent' />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        /* Import Vietnamese fonts */
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap');

        /* Custom font styles */
        .topic-text {
          font-family: 'Lobster', cursive;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.5;
          padding-top: 0.3em;
          padding-bottom: 0.3em;
          background: linear-gradient(135deg,
            #FF7979 0%,
            #FF6B6B 15%,
            #E74C3C 35%,
            #C0392B 55%,
            #A93226 70%,
            #8B1A1A 85%,
            #6B1717 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          -webkit-text-stroke: 1.5px rgba(139, 26, 26, 0.6);
          text-stroke: 1.5px rgba(139, 26, 26, 0.6);
          filter: drop-shadow(0 0 15px rgba(231, 76, 60, 0.6))
                  drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.7));
        }

        .title-text {
          font-family: 'Kaushan Script', cursive;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-shadow:
            3px 3px 6px rgba(0, 0, 0, 0.9),
            0 0 20px rgba(0, 0, 0, 0.7),
            -1px -1px 0 rgba(0, 0, 0, 0.5),
            1px 1px 0 rgba(255, 255, 255, 0.1);
          -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.2);
        }

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
                key={`banner-${index}`}
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

                {/* Content overlay with text */}
                <div className='content content-wrapper absolute top-[40%] left-0 z-10 px-8 md:px-16 lg:px-24'>
                  <div className='content-inner max-w-2xl'>
                    {item.topic && (
                      <div className='topic-text text-3xl md:text-4xl lg:text-5xl font-bold mb-3 uppercase tracking-wider'>
                        {item.topic}
                      </div>
                    )}
                    <div className='title-text text-white text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight drop-shadow-2xl'>
                      {item.title}
                    </div>
                    <div className='des-text text-gray-200 text-sm md:text-base lg:text-lg leading-relaxed mb-8 drop-shadow-lg line-clamp-3'>
                      {item.description}
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
              key={`thumbnail-${index}`}
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
                <div className='title font-semibold text-[10px] truncate drop-shadow-md'>{item.title}</div>
                <div className='description font-light text-[9px] text-orange-300 truncate'>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default CarouselBannerOptimized

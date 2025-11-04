import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react'
import LOGO_DEFAULT from '../../../public/Images/FestDefault.png'
interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  className?: string
  aspectRatio?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * OptimizedImage Component
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - WebP/AVIF format support with fallback
 * - Responsive images with srcset
 * - Priority loading for above-the-fold images
 * - Skeleton loading state
 * - Error handling with fallback UI
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  className = '',
  aspectRatio = 'aspect-video',
  sizes,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px' // Preload 100px before viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Generate optimized image URLs (this assumes your backend supports query params for optimization)
  const getOptimizedUrl = (url: string, w?: number, q = quality) => {
    if (!url) return url

    // If URL already has query params
    const hasQuery = url.includes('?')
    const separator = hasQuery ? '&' : '?'

    const params = new URLSearchParams()
    if (w) params.set('w', w.toString())
    params.set('q', q.toString())
    params.set('fm', 'webp') // Request WebP format

    return `${url}${separator}${params.toString()}`
  }

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!width) return undefined

    const widths = [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
    const applicableWidths = widths.filter((w) => w <= width * 2)

    return applicableWidths.map((w) => `${getOptimizedUrl(src, w)} ${w}w`).join(', ')
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {/* Skeleton Loading */}
      {isLoading && isInView && (
        <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse'>
          <div className='w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer' />
        </div>
      )}

      {/* Image */}
      {!hasError && isInView ? (
        <picture>
          {/* AVIF format (best compression) */}
          <source type='image/avif' srcSet={generateSrcSet()?.replace(/fm=webp/g, 'fm=avif')} sizes={sizes} />

          {/* WebP format (good compression) */}
          <source type='image/webp' srcSet={generateSrcSet()} sizes={sizes} />

          {/* Original format (fallback) */}
          <img
            src={getOptimizedUrl(src, width)}
            srcSet={generateSrcSet()}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding='async'
            fetchPriority={priority ? 'high' : 'low'}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      ) : hasError ? (
        <img src={LOGO_DEFAULT} alt='' className='w-full h-full' />
      ) : null}
    </div>
  )
}

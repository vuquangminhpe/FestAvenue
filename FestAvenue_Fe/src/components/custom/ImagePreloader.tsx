import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface ImagePreloaderProps {
  images: Array<{
    href: string
    as?: 'image'
    type?: string
    imageSrcSet?: string
    imageSizes?: string
    fetchPriority?: 'high' | 'low' | 'auto'
  }>
}

/**
 * ImagePreloader Component
 *
 * Preloads critical images to improve LCP (Largest Contentful Paint)
 * Use this for above-the-fold images, hero images, and banner images
 *
 * @example
 * <ImagePreloader
 *   images={[
 *     { href: '/banner.webp', type: 'image/webp', fetchPriority: 'high' },
 *     { href: '/hero.jpg', fetchPriority: 'high' }
 *   ]}
 * />
 */
export default function ImagePreloader({ images }: ImagePreloaderProps) {
  useEffect(() => {
    // Preload images using link rel="preload"
    const preloadLinks: HTMLLinkElement[] = []

    images.forEach((img) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = img.as || 'image'
      link.href = img.href

      if (img.type) link.type = img.type
      if (img.imageSrcSet) link.setAttribute('imagesrcset', img.imageSrcSet)
      if (img.imageSizes) link.setAttribute('imagesizes', img.imageSizes)
      if (img.fetchPriority) link.setAttribute('fetchpriority', img.fetchPriority)

      document.head.appendChild(link)
      preloadLinks.push(link)
    })

    // Cleanup
    return () => {
      preloadLinks.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      })
    }
  }, [images])

  // Also add to Helmet for SSR support
  return (
    <Helmet>
      {images.map((img, index) => (
        <link
          key={index}
          rel='preload'
          as={img.as || 'image'}
          href={img.href}
          type={img.type}
          imageSrcSet={img.imageSrcSet}
          imageSizes={img.imageSizes}
          // @ts-ignore - fetchpriority is valid but not in types yet
          fetchpriority={img.fetchPriority}
        />
      ))}
    </Helmet>
  )
}

import { useEffect, useRef } from 'react'
import VIDEO_FEATURE_1 from '../../../../../../public/video/Feature2.mp4'

interface Feature {
  title: string
  description: string
}

export default function AISearchFeature() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const animateSection = () => {
      if (sectionRef.current && window.gsap && window.ScrollTrigger) {
        // Animate image from left
        if (imageRef.current) {
          window.gsap.fromTo(
            imageRef.current,
            { opacity: 0, x: -100 },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
                end: 'bottom 30%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }

        // Animate content from right
        if (contentRef.current) {
          const items = contentRef.current.querySelectorAll('.feature-item')
          window.gsap.fromTo(
            items,
            { opacity: 0, x: 50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
                end: 'bottom 30%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }
      }
    }

    if (window.gsap && window.ScrollTrigger) {
      animateSection()
    } else {
      const interval = setInterval(() => {
        if (window.gsap && window.ScrollTrigger) {
          animateSection()
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const features: Feature[] = [
    {
      title: 'Tìm Kiếm Văn Bản',
      description: 'Tìm kiếm sự kiện bằng từ khóa với độ chính xác cao, hỗ trợ tiếng Việt và ngôn ngữ quốc tế.'
    },
    {
      title: 'Tìm Kiếm Hình Ảnh',
      description: 'Upload hình ảnh để tìm các sự kiện tương tự với công nghệ AI nhận diện hình ảnh tiên tiến.'
    },
    {
      title: 'Tìm Kiếm Kết Hợp',
      description: 'Kết hợp cả văn bản và hình ảnh để có kết quả tìm kiếm chính xác và phù hợp nhất.'
    },
    {
      title: 'Lọc & Sắp Xếp',
      description: 'Lọc theo danh mục, khoảng thời gian và sắp xếp kết quả theo nhiều tiêu chí khác nhau.'
    }
  ]

  return (
    <section ref={sectionRef} className='relative overflow-hidden min-h-[900px] lg:min-h-[850px]'>
      {/* Video Background */}
      <div className='absolute inset-0 w-full h-full'>
        <video loop autoPlay muted playsInline src={VIDEO_FEATURE_1} className='w-full h-full object-cover' />
        {/* Dark overlay for better text readability */}
        <div className='absolute inset-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0a1628]/70 to-[#0a1628]/40'></div>
      </div>

      <div className='max-w-7xl mx-auto relative z-10 py-24 px-4 sm:px-6 lg:px-8'>
        {/* Content Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[750px] lg:min-h-[700px]'>
          {/* Left - Header & Features */}
          <div ref={contentRef} className='space-y-8'>
            {/* Header */}
            <div ref={imageRef}>
              <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight'>
                Tìm Kiếm Sự Kiện{' '}
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400'>
                  Thông Minh
                </span>
              </h2>
              <p className='text-lg leading-relaxed text-gray-300 max-w-xl'>
                Trải nghiệm công nghệ tìm kiếm tiên tiến với AI đa phương thức. Tìm kiếm sự kiện bằng văn bản, hình ảnh
                hoặc kết hợp cả hai.
              </p>
            </div>

            {/* Features Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='feature-item group bg-white/10 backdrop-blur-md rounded-xl p-5 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-cyan-400/40 hover:scale-[1.02]'
                >
                  <h3 className='text-lg font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-gray-400 leading-relaxed'>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Empty space for video to show through */}
          <div className='hidden lg:block'></div>
        </div>
      </div>
    </section>
  )
}

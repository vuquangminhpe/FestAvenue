import { useEffect, useRef } from 'react'
import BG_FEATURE_1 from '../../../../../../public/Images/Feature1.png'

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
    <section
      ref={sectionRef}
      className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden'
    >
      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-5xl md:text-6xl font-bold mb-6 text-gray-900'>
            Tìm Kiếm Sự Kiện{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-400'>Thông Minh</span>
          </h2>
          <p className='text-xl leading-relaxed max-w-3xl mx-auto text-gray-700'>
            Trải nghiệm công nghệ tìm kiếm tiên tiến với AI đa phương thức. Tìm kiếm sự kiện bằng văn bản, hình ảnh hoặc
            kết hợp cả hai.
          </p>
        </div>

        {/* Main Content - Image Left, Text Right */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left - Feature Image */}
          <div ref={imageRef} className='relative'>
            <div className='relative rounded-3xl overflow-hidden shadow-2xl'>
              <img src={BG_FEATURE_1} alt='AI Search Feature' className='w-full h-auto object-cover' loading='lazy' />
              <div className='absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent'></div>
            </div>

            {/* Decorative Elements */}
            <div className='absolute -top-4 -left-4 w-24 h-24 bg-cyan-200 rounded-full blur-2xl opacity-60'></div>
            <div className='absolute -bottom-4 -right-4 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-60'></div>
          </div>

          {/* Right - Features List */}
          <div ref={contentRef} className='space-y-6'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='feature-item group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200'
              >
                <div className='flex items-start gap-4'>
                  {/* Text Content */}
                  <div className='flex-grow'>
                    <h3 className='text-xl font-bold mb-2 text-gray-900 group-hover:text-cyan-500 transition-colors duration-300'>
                      {feature.title}
                    </h3>
                    <p className='text-gray-600 leading-relaxed'>{feature.description}</p>
                  </div>

                  {/* Arrow Icon */}
                  <div className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <svg
                      className='w-5 h-5 text-cyan-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

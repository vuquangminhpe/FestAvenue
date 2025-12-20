import { useEffect, useRef } from 'react'
import { Box } from 'lucide-react'
import BG_FEATURE_2 from '../../../../../../public/Images/Feature2.png'
import Home_1 from '../../../../../../public/Images/Home_1.png'
import Home_2 from '../../../../../../public/Images/Home_2.png'
import Home_3 from '../../../../../../public/Images/Home_3.png'
interface Feature {
  image: string
  title: string
  description: string
}

export default function SeatManagementFeature() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const animateSection = () => {
      if (sectionRef.current && window.gsap && window.ScrollTrigger) {
        const items = sectionRef.current.querySelectorAll('.zigzag-item')

        window.gsap.fromTo(
          items,
          {
            opacity: 0,
            x: (_index: number, target: Element) => (items && Array.from(items).indexOf(target) % 2 === 0 ? -100 : 100)
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.2,
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
      image: Home_1,
      title: 'AI Phát Hiện Tự Động',
      description: 'Upload ảnh hoặc video sơ đồ ghế, AI sẽ tự động phát hiện và tạo cấu trúc ghế ngồi chính xác với AI.'
    },
    {
      image: Home_2,
      title: 'Chỉnh Sửa Kéo Thả',
      description:
        'Giao diện trực quan với công cụ vẽ đa dạng: polygon, hình tròn, tam giác, ngôi sao và nhiều hơn nữa để thiết kế sơ đồ ghế chuyên nghiệp.'
    },

    {
      image: Home_3,
      title: 'Tích Hợp Loại Vé',
      description:
        'Liên kết từng khu vực ghế với các loại vé khác nhau, quản lý giá và số lượng dễ dàng với hệ thống tự động và thông minh.'
    }
  ]

  return (
    <section
      ref={sectionRef}
      className='py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden'
      style={{
        backgroundImage: `url(${BG_FEATURE_2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className='absolute inset-0 bg-gradient-to-br from-orange-900/80 via-amber-900/75 to-yellow-900/80'></div>
      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='text-center mb-20'>
          <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full mb-6 shadow-lg border border-white/30'>
            <Box className='w-5 h-5' />
            <span className='font-semibold'>Technology</span>
          </div>
          <h2 className='text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg'>
            Quản Lý Ghế Ngồi <span className='text-yellow-300'>Hiện Đại</span>
          </h2>
          <p className='text-xl leading-relaxed max-w-3xl mx-auto text-gray-100 drop-shadow-md'>
            Thiết kế và quản lý sơ đồ ghế ngồi chuyên nghiệp với công nghệ AI và giao diện 3D độc đáo.
          </p>
        </div>

        {/* Zigzag Layout */}
        <div className='space-y-24'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`zigzag-item flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12`}
            >
              {/* Image Side */}
              <div className='flex-1 w-full'>
                <div className='relative group'>
                  {/* Decorative Background */}
                  <div
                    className={`absolute -inset-4 bg-gradient-to-br ${
                      index % 2 === 0 ? 'from-orange-200 to-amber-200' : 'from-amber-200 to-yellow-200'
                    } rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                  ></div>

                  {/* Main Image */}
                  <div className='relative rounded-3xl overflow-hidden shadow-2xl'>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className='w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700'
                      loading='lazy'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className='flex-1 w-full'>
                <div className={`${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                  {/* Number Badge */}
                  <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 rounded-full font-bold text-xl mb-6 shadow-lg'>
                    {index + 1}
                  </div>

                  {/* Title */}
                  <h3 className='text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg'>{feature.title}</h3>

                  {/* Description */}
                  <p className='text-lg text-gray-100 leading-relaxed mb-8 drop-shadow-md'>{feature.description}</p>

                  {/* Features List */}
                  <div className='space-y-3'>
                    {['Tính năng AI mạnh mẽ', 'Tiết kiệm thời gian', 'Chính xác cao'].map((item, i) => (
                      <div key={i} className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full'></div>
                        <span className='text-white font-medium drop-shadow-md'>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

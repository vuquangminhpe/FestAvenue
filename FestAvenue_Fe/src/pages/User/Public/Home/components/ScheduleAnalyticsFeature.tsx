import { useEffect, useRef } from 'react'
import BG_FEATURE_3 from '../../../../../../public/Images/Feature3.png'

export default function ScheduleAnalyticsFeature() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const animateSection = () => {
      if (sectionRef.current && window.gsap && window.ScrollTrigger) {
        const bentoItems = sectionRef.current.querySelectorAll('.bento-item')

        window.gsap.fromTo(
          bentoItems,
          { opacity: 0, scale: 0.8, rotateY: -15 },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.2)',
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

  return (
    <section
      ref={sectionRef}
      className='py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden'
      style={{
        backgroundImage: `url(${BG_FEATURE_3})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated Grid Background */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-5xl md:text-6xl font-bold mb-6 text-black'>
            Lịch Trình &{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400'>
              Thống Kê
            </span>
          </h2>
          <p className='text-xl leading-relaxed max-w-3xl mx-auto text-black'>
            Quản lý lịch trình sự kiện hiệu quả và theo dõi hiệu suất qua các biểu đồ phân tích chi tiết.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'>
          {/* Large Feature 1 - Calendar Management */}
          <div className='bento-item md:col-span-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-emerald-400/50 transition-all duration-500 group relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
            <div className='relative z-10'>
              <h3 className='text-3xl font-bold text-black mb-4'>Quản Lý Lịch</h3>
              <p className='text-black text-lg leading-relaxed mb-6'>
                Giao diện lịch trực quan với khả năng kéo thả, tạo và chỉnh sửa lịch trình dễ dàng. Đồng bộ tự động với
                toàn bộ team.
              </p>
              <img
                src='https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400'
                alt='Calendar Management'
                className='w-full h-48 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500'
                loading='lazy'
              />
            </div>
          </div>

          {/* Feature 2 - Task Assignment */}
          <div className='bento-item bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 group relative overflow-hidden'>
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
            <div className='relative z-10 h-full flex flex-col'>
              <h3 className='text-2xl font-bold text-black mb-3'>Phân Công Nhiệm Vụ</h3>
              <p className='text-black leading-relaxed flex-grow'>
                Giao nhiệm vụ cho từng thành viên trong team với thông báo và nhắc nhở tự động.
              </p>
              <div className='mt-6 flex -space-x-3'>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-slate-900'
                  ></div>
                ))}
                <div className='w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold'>
                  +12
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Charts */}
          <div className='bento-item bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-500 group relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
            <div className='relative z-10 h-full flex flex-col'>
              <h3 className='text-2xl font-bold text-black mb-3'>Biểu Đồ Phân Tích</h3>
              <p className='text-black leading-relaxed mb-4'>
                Theo dõi số liệu sự kiện, doanh thu, vé bán qua các biểu đồ trực quan.
              </p>
              <img
                src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300'
                alt='Analytics Dashboard'
                className='w-full h-32 object-cover rounded-lg shadow-lg mt-auto group-hover:scale-105 transition-transform duration-500'
                loading='lazy'
              />
            </div>
          </div>

          {/* Large Feature 4 - Real-time Tracking */}
          <div className='bento-item md:col-span-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-amber-400/50 transition-all duration-500 group relative overflow-hidden'>
            <div className='absolute bottom-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
            <div className='relative z-10 grid md:grid-cols-2 gap-8 items-center'>
              <div>
                <h3 className='text-3xl font-bold text-black mb-4'>Theo Dõi Thời Gian Thực</h3>
                <p className='text-black text-lg leading-relaxed mb-6'>
                  Cập nhật dữ liệu về trạng thái sự kiện, bán vé và hoạt động của team.
                </p>
              </div>
              <div>
                <img
                  src='https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=500&h=500'
                  alt='Real-time Tracking'
                  className='w-full h-64 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500'
                  loading='lazy'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

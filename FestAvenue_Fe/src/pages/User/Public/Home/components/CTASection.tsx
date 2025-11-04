import path from '@/constants/path'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadGSAP = async () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        script.async = true
        document.head.appendChild(script)

        script.onload = () => {
          const scrollTriggerScript = document.createElement('script')
          scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'
          scrollTriggerScript.async = true
          document.head.appendChild(scrollTriggerScript)

          scrollTriggerScript.onload = () => {
            if (window.gsap && window.ScrollTrigger) {
              window.gsap.registerPlugin(window.ScrollTrigger)
              animateSection()
            }
          }
        }
      } else if (window.gsap && window.ScrollTrigger) {
        animateSection()
      }
    }

    const animateSection = () => {
      if (sectionRef.current) {
        window.gsap.fromTo(
          sectionRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 20%',
              end: 'bottom 50%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    }

    loadGSAP()
  }, [])

  return (
    <section ref={sectionRef} className='py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 to-blue-100'>
      <div className='max-w-4xl mx-auto text-center'>
        <h2 className='text-5xl font-bold text-gray-900 mb-6'>Còn Nhiều Dịch Vụ Khác Đang Chờ Đón Bạn</h2>
        <p className='text-xl text-gray-600 mb-10'>
          Hãy đến với chúng tôi ngày hôm nay để trải nghiệm nền tảng quản lý sự kiện toàn diện nhất
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={() => navigate(path.auth.signup)}
            className='px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg cursor-pointer font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform '
          >
            Đăng Ký Ngay
          </button>
          <button
            onClick={() => navigate(path.events)}
            className='px-10 py-5 bg-white text-cyan-600 text-lg font-semibold rounded-xl border-2 cursor-pointer border-cyan-600 hover:bg-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl transform '
          >
            Khám Phá Sự Kiện
          </button>
        </div>
      </div>
    </section>
  )
}

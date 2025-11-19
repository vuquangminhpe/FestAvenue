import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import { useNavigate } from 'react-router'
import { Calendar, User } from 'lucide-react'
import path from '@/constants/path'
import { generateNameId } from '@/utils/utils'
import type { ReqFilterOwnerEvent } from '@/types/event.types'
import OptimizedImage from '@/components/custom/OptimizedImage'

export default function FeaturedEvents() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)

  const { data: featuredEvents, isLoading } = useQuery({
    queryKey: ['featuredEvents'],
    queryFn: async () => {
      const response = await eventApis.getTop20EventFeaturedEvent()
      return response?.data || []
    }
  })

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
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    }

    loadGSAP()
  }, [])

  if (isLoading) {
    return (
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 to-blue-100'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600'></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 to-blue-100'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>Sự Kiện Nổi Bật Nhất</h2>
          <p className='text-lg text-gray-600'>Khám phá những sự kiện được yêu thích nhất hiện nay</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {(featuredEvents as any)?.data?.slice(0, 8)?.map((event: ReqFilterOwnerEvent, index: number) => (
            <div
              key={event.id}
              className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-6 overflow-hidden cursor-pointer'
              onClick={() =>
                navigate(
                  `${path.user.event.root}/${generateNameId({
                    id: event.eventCode,
                    name: event.organization.name,
                    id_2: event.eventName
                  })}`
                )
              }
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className='relative overflow-hidden'>
                <OptimizedImage
                  src={event.logoUrl}
                  alt={event.eventName}
                  width={600}
                  height={400}
                  className='h-48 w-full'
                  sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
                />

                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent'></div>
              </div>

              <div className='p-5'>
                <h3 className='font-bold text-xl mb-3 line-clamp-2 text-gray-900'>{event.eventName}</h3>

                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-cyan-600' />
                    <span className='line-clamp-1'>{event.organization?.name || 'FestAvenue'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-cyan-600' />
                    <span>
                      {event.startTimeEventTime
                        ? new Date(event.startTimeEventTime).toLocaleDateString('vi-VN')
                        : 'Chưa có ngày'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {featuredEvents && featuredEvents.length > 8 && (
          <div className='text-center mt-12'>
            <button
              onClick={() => navigate(path.events)}
              className='px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl'
            >
              Xem Tất Cả Sự Kiện
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

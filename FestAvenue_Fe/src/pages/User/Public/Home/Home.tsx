'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import categoryApis from '@/apis/categories.api'
import CarouselBannerOptimized from '@/components/custom/CarouselBanner/CarouselBannerOptimized'
import SmartSEO from '@/components/SEO/SmartSEO'
import { pageSEO } from '@/components/SEO/SEO'
import ImagePreloader from '@/components/custom/ImagePreloader'
import FeaturedEvents from './components/FeaturedEvents'
import AISearchFeature from './components/AISearchFeature'
import SeatManagementFeature from './components/SeatManagementFeature'
import ScheduleAnalyticsFeature from './components/ScheduleAnalyticsFeature'
import CTASection from './components/CTASection'

const Home = () => {
  const categoriesRef = useRef<HTMLDivElement>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApis.getCategoryActive()
  })

  // Load GSAP and ScrollTrigger
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
            }
          }
        }
      }
    }
    loadGSAP()
  }, [])

  // Animate categories on scroll
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger && categoriesRef.current) {
      window.gsap.fromTo(
        categoriesRef.current.querySelectorAll('.category-item'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }
  }, [categories])

  return (
    <>
      <SmartSEO {...pageSEO.home} />
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .hover-lift {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateZ(0);
          will-change: transform, box-shadow;
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <div className='min-h-screen bg-gray-50 relative overflow-hidden'>
        {/* Preload critical images for better LCP */}
        <ImagePreloader
          images={
            categories?.data?.slice(0, 8).map((cat) => ({
              href: cat.imageUrl,
              type: 'image/webp',
              fetchPriority: 'high' as const
            })) || []
          }
        />

        <div className='relative z-10'>
          {/* Hero Section with Banner */}
          <section className='relative'>
            <div className='w-full'>
              <CarouselBannerOptimized />
            </div>
          </section>

          {/* Featured Events Section */}
          <FeaturedEvents />

          {/* Feature Section 1 - AI Search */}
          <AISearchFeature />

          {/* Feature Section 2 - Seat Management */}
          <SeatManagementFeature />

          {/* Feature Section 3 - Schedule & Analytics */}
          <ScheduleAnalyticsFeature />

          {/* CTA Section */}
          <CTASection />
        </div>
      </div>
    </>
  )
}

export default Home

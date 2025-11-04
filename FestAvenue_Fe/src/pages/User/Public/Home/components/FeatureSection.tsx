import { useEffect, useRef } from 'react'

interface Feature {
  image: string
  title: string
  description: string
}

interface FeatureSectionProps {
  mainTitle: string
  mainDescription: string
  features: [Feature, Feature, Feature, Feature]
  bgColor: 'light' | 'dark'
}

export default function FeatureSection({
  mainTitle,
  mainDescription,
  features,
  bgColor
}: FeatureSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

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
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'bottom 25%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    }

    loadGSAP()
  }, [])

  const bgClass = bgColor === 'light' ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-cyan-900 to-blue-900'
  const textClass = bgColor === 'light' ? 'text-gray-900' : 'text-white'
  const descClass = bgColor === 'light' ? 'text-gray-600' : 'text-gray-200'

  return (
    <section ref={sectionRef} className={`py-20 px-4 sm:px-6 lg:px-8 ${bgClass}`}>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className={`text-5xl font-bold mb-6 ${textClass}`}>{mainTitle}</h2>
          <p className={`text-xl leading-relaxed max-w-3xl mx-auto ${descClass}`}>{mainDescription}</p>
        </div>

        {/* Diamond Layout */}
        <div className='relative max-w-6xl mx-auto'>
          {/* Feature 1 - Top */}
          <div className='flex flex-col lg:flex-row items-center gap-8 mb-12 lg:mb-16'>
            <div className='flex-1 lg:text-right'>
              <h3 className={`text-2xl font-bold mb-3 ${textClass}`}>{features[0].title}</h3>
              <p className={`text-base ${descClass}`}>{features[0].description}</p>
            </div>
            <div className='w-64 h-64 flex-shrink-0'>
              <div className='w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300'>
                <img
                  src={features[0].image}
                  alt={features[0].title}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
              </div>
            </div>
            <div className='flex-1 lg:hidden'>
              {/* Spacer for mobile */}
            </div>
          </div>

          {/* Features 2 & 3 - Middle (Left & Right) */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-12 lg:mb-16'>
            {/* Feature 2 - Left */}
            <div className='flex flex-col items-center lg:items-end text-center lg:text-right'>
              <div className='w-56 h-56 mb-6'>
                <div className='w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300'>
                  <img
                    src={features[1].image}
                    alt={features[1].title}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${textClass}`}>{features[1].title}</h3>
              <p className={`text-base ${descClass}`}>{features[1].description}</p>
            </div>

            {/* Feature 3 - Right */}
            <div className='flex flex-col items-center lg:items-start text-center lg:text-left'>
              <div className='w-56 h-56 mb-6'>
                <div className='w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300'>
                  <img
                    src={features[2].image}
                    alt={features[2].title}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${textClass}`}>{features[2].title}</h3>
              <p className={`text-base ${descClass}`}>{features[2].description}</p>
            </div>
          </div>

          {/* Feature 4 - Bottom */}
          <div className='flex flex-col lg:flex-row items-center gap-8'>
            <div className='flex-1 lg:hidden'>
              {/* Spacer for mobile */}
            </div>
            <div className='w-64 h-64 flex-shrink-0'>
              <div className='w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300'>
                <img
                  src={features[3].image}
                  alt={features[3].title}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
              </div>
            </div>
            <div className='flex-1'>
              <h3 className={`text-2xl font-bold mb-3 ${textClass}`}>{features[3].title}</h3>
              <p className={`text-base ${descClass}`}>{features[3].description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

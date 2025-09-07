/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react'

import { Heart, MapPin, Calendar, Clock, Star, X, ArrowRight, Loader2, Filter } from 'lucide-react'
import MouseAnimate from '@/components/custom/MouseAnimate'

// Animation hook for scroll-triggered animations
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible] as const
}

// Image loading component with skeleton
const ImageWithLoading: React.FC<{
  src: string
  alt: string
  className?: string
  aspectRatio?: string
}> = ({ src, alt, className = '', aspectRatio = 'aspect-video' }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-xl ${aspectRatio} ${className}`}>
      {isLoading && (
        <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse'>
          <div className='w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer'></div>
        </div>
      )}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
        />
      ) : (
        <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
          <div className='text-center text-gray-500'>
            <div className='w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center'>📷</div>
            <p className='text-sm'>Image not available</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Button component with soft colors
const SoftButton: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}> = ({ children, variant = 'primary', size = 'md', className = '', onClick, disabled = false }) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-medium transition-transform duration-300 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-gradient-to-r from-blue-400 to-cyan-200 text-white shadow-lg hover:shadow-xl focus:ring-purple-300',
    secondary: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg hover:shadow-xl focus:ring-blue-300',
    outline: 'border-2  bg-white '
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const Home = () => {
  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'))
    }

    setTimeout(handleResize, 100)

    return () => {}
  }, [])

  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [currentFilter, setCurrentFilter] = useState('All')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState(8)
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth)

  // Animation refs
  const [heroRef, heroVisible] = useIntersectionObserver(0.2)
  const [categoriesRef, categoriesVisible] = useIntersectionObserver(0.2)
  const [eventsRef, eventsVisible] = useIntersectionObserver(0.2)
  const [destinationsRef, destinationsVisible] = useIntersectionObserver(0.2)
  const [testimonialsRef, testimonialsVisible] = useIntersectionObserver(0.2)

  const categories = [
    { name: 'Music', icon: '', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300' },
    { name: 'Business', icon: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300' },
    {
      name: 'Nightlife',
      icon: '',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300'
    },
    { name: 'Holidays', icon: '', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300' },
    {
      name: 'Food & Drink',
      icon: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300'
    },
    {
      name: 'Education',
      icon: '',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300'
    },
    { name: 'Gaming', icon: '', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300' },
    { name: 'Health', icon: '', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300' }
  ]

  const events = [
    {
      id: 1,
      title: 'Enjoy the magic of vinyl records',
      date: 'Friday, Mar 15',
      time: '09:30 pm',
      location: 'Great Falls, Montana',
      price: 'Free',
      organizer: 'Gillette',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300',
      category: 'Music'
    },
    {
      id: 2,
      title: 'Let you go insane!',
      date: 'Saturday, Oct 22',
      time: '10:41 pm',
      location: 'Park avenue Garden, NYC',
      price: 'Free',
      organizer: 'Tigertz Fundzone',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300',
      category: 'Music'
    },
    {
      id: 3,
      title: 'Master the Media World Successfully',
      date: 'Saturday, Oct 22',
      time: '02:34 am',
      location: 'Syracuse, Connecticut',
      price: '$109',
      organizer: 'Techno Learn',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300',
      category: 'Business'
    },
    {
      id: 4,
      title: 'Aging & Progression in Tech',
      date: 'Monday, Jan 16',
      time: '04:55 pm',
      location: 'Lafayette, California',
      price: '$159',
      organizer: 'Louis Vuitton',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300',
      category: 'Education'
    },
    {
      id: 5,
      title: 'Code camping in your town now',
      date: 'Wednesday, May 10',
      time: '07:15 pm',
      location: 'Stockton, New Hampshire',
      price: '$75',
      organizer: 'Acme Co.',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300',
      category: 'Education'
    },
    {
      id: 6,
      title: 'Coder Expo',
      date: 'Sunday, Jun 4',
      time: '07:38 am',
      location: 'Stockton, New Hampshire',
      price: '$89',
      organizer: 'Barone LLC.',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300',
      category: 'Technology'
    },
    {
      id: 7,
      title: 'Learn art the way never before',
      date: 'Sunday, May 21',
      time: '03:48 am',
      location: 'Lafayette, California',
      price: '$99',
      organizer: 'Abstergo ltd.',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300',
      category: 'Art'
    },
    {
      id: 8,
      title: 'The magic of art',
      date: 'Friday, Jun 8',
      time: '05:48 pm',
      location: 'Stockton, New Hampshire',
      price: '$129',
      organizer: 'Bifora Enterprises',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300',
      category: 'Art'
    },
    {
      id: 9,
      title: 'Learn content creating efficiently',
      date: 'Friday, Jun 8',
      time: '07:38 am',
      location: 'Mills phi/T/3 phi',
      price: '$79',
      organizer: 'Albert Flores',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300',
      category: 'Business'
    },
    {
      id: 10,
      title: 'Experience AR like never before',
      date: 'Sunday, May 2',
      time: '01:05 am',
      location: 'Lafayette, California',
      price: '$199',
      organizer: 'Arlene McCoy',
      image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=300',
      category: 'Technology'
    },
    {
      id: 11,
      title: 'Yoga se hi Hoga!!',
      date: 'Friday, Sep 15',
      time: 'Mills phi/T/3 phi',
      location: '02:22 am',
      price: '$89',
      organizer: 'Acme Co.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300',
      category: 'Health'
    },
    {
      id: 12,
      title: 'Color the world with Black and white',
      date: 'Friday, Jun 23',
      time: 'Mills phi/T/3 phi',
      location: '02:10 pm',
      price: '$149',
      organizer: 'BinKond Ltd.',
      image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=400&h=300',
      category: 'Art'
    }
  ]
  const destinations = [
    { name: 'Chicago', image: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=400&h=300' },
    { name: 'Las Vegas', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300' },
    { name: 'Miami', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300' }
  ]

  const testimonials = [
    {
      name: 'Theresa Webb',
      rating: 4,
      feedback: 'Lorem ipsum dolor sit amet consectetur. Eget consequatur sed vitae tristique veniam.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b76c?w=100&h=100'
    },
    {
      name: 'Jacob Jones',
      rating: 5,
      feedback: 'Lorem ipsum dolor sit amet consectetur. Eget consequatur sed vitae tristique veniam.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100'
    },
    {
      name: 'Devon Lane',
      rating: 4,
      feedback: 'Lorem ipsum dolor sit amet consectetur. Eget consequatur sed vitae tristique veniam.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100'
    },
    {
      name: 'Cody Fisher',
      rating: 5,
      feedback: 'Lorem ipsum dolor sit amet consectetur. Eget consequatur sed vitae tristique veniam.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100'
    }
  ]

  const interests = [
    'Badminton',
    'Cricket',
    'Music',
    'Cooking',
    'Travelling',
    'Dancing',
    'Art',
    'Designing',
    'Political Science',
    'Party',
    'Singing',
    'EDM',
    'Fashion',
    'Athletics',
    'Basketball',
    'Sports',
    'Gaming',
    'Drama',
    'Social Work',
    'Business',
    'Charity'
  ]
  useEffect(() => {
    let timeoutId = null as any

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth)
      }, 150)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])
  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setVisibleEvents((prev) => prev + 4)
    setIsLoadingMore(false)
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes scale-up {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
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

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }


        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .glass-dark {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
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

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .stagger-1 {
          animation-delay: 0.1s;
        }
        .stagger-2 {
          animation-delay: 0.2s;
        }
        .stagger-3 {
          animation-delay: 0.3s;
        }
        .stagger-4 {
          animation-delay: 0.4s;
        }
        .stagger-5 {
          animation-delay: 0.5s;
        }
        .stagger-6 {
          animation-delay: 0.6s;
        }
        .stagger-7 {
          animation-delay: 0.7s;
        }
        .stagger-8 {
          animation-delay: 0.8s;
        }
      `}</style>

      <div className='min-h-screen bg-gray-50 relative overflow-hidden'>
        {/* Mouse Animation Background */}
        <MouseAnimate
          number_point={viewportWidth >= 800 ? 100 : 20}
          className='pointer-events-none w-full max-h-[500px] z-50'
        />

        <div className='relative z-10'>
          {/* Hero Section with Banner */}
          <section
            ref={heroRef}
            className={`relative transition-transform duration-1000 transform ${
              heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className='w-full'>
              {/* Main Banner */}
              <div className='relative  overflow-hidden shadow-2xl mb-12 h-[500px] bg-gradient-to-r from-purple-200 via-blue-300 to-indigo-200'>
                <div className='absolute inset-0 bg-black/30'></div>
                <div className='relative z-10 flex items-center justify-between h-full px-8 lg:px-16'>
                  <div className='text-white max-w-2xl'>
                    <div className='inline-block glass-dark rounded-full px-4 py-2 mb-6'>
                      <span className='text-sm font-medium'>Featured Event</span>
                    </div>
                    <h1 className='text-4xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in-up'>YUVAN</h1>
                    <p className='text-xl lg:text-2xl mb-2 opacity-90 animate-fade-in-up stagger-1'>
                      LIVE IN SINGAPORE 2025
                    </p>
                    <p className='text-lg mb-2 opacity-80 animate-fade-in-up stagger-2'>SINGAPORE INDOOR STADIUM</p>
                    <p className='text-2xl lg:text-3xl font-bold mb-6 animate-fade-in-up stagger-3'>14 OCTOBER</p>
                    <div className='flex items-center gap-4 animate-fade-in-up stagger-4'>
                      <SoftButton size='lg' className='shadow-xl animate-glow'>
                        Book Now
                      </SoftButton>
                      <p className='text-sm opacity-80'>
                        TICKETS AT
                        <br />
                        <span className='text-lg font-bold'>SISTIC</span>
                      </p>
                    </div>
                  </div>
                  <div className='hidden lg:block animate-float'>
                    <ImageWithLoading
                      src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400'
                      alt='YUVAN Concert'
                      className='w-64 h-64 rounded-2xl shadow-2xl'
                      aspectRatio='aspect-square'
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section
            ref={categoriesRef}
            className={`py-16 px-4 sm:px-6 lg:px-8 transition-transform duration-1000 delay-200 transform ${
              categoriesVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className='max-w-7xl mx-auto'>
              <h2 className='text-3xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up'>Categories</h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-6'>
                {categories.map((category, index) => (
                  <div
                    key={category.name}
                    className={`group cursor-pointer transition-transform duration-1000 ease-out hover:scale-105 hover-lift ${
                      categoriesVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } stagger-${(index % 8) + 1}`}
                  >
                    <div className='relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
                      <ImageWithLoading
                        src={category.image}
                        alt={category.name}
                        className='h-32 w-full'
                        aspectRatio=''
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                      <div className='absolute bottom-0 left-0 right-0 p-4 text-center'>
                        <div className='text-2xl mb-1 animate-float'>{category.icon}</div>
                        <p className='text-white font-medium text-sm'>{category.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section
            ref={eventsRef}
            className={`py-16 px-4 sm:px-6 lg:px-8 bg-white transition-transform duration-1000 delay-300 transform ${
              eventsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className='max-w-7xl mx-auto'>
              <div className='flex items-center justify-between mb-8'>
                <h2 className='text-3xl font-bold text-gray-900 animate-fade-in-up'>
                  Browsing events in New York City
                </h2>
                <SoftButton
                  variant='outline'
                  onClick={() => setShowPersonalizationModal(true)}
                  className='flex items-center gap-2 '
                >
                  <Filter className='w-4 h-4' />
                  Personalize
                </SoftButton>
              </div>

              {/* Filter Tabs */}
              <div className='flex flex-wrap gap-4 mb-8'>
                {['All', 'For You', 'Online', 'Today', 'Free', 'Music', 'Community', 'Charity', 'Sports'].map(
                  (filter, index) => (
                    <button
                      key={filter}
                      onClick={() => setCurrentFilter(filter)}
                      className={`px-6 py-2 rounded-full font-medium transition-transform duration-1000 ease-out hover:scale-105 animate-fade-in-up stagger-${
                        (index % 5) + 1
                      } ${
                        currentFilter === filter
                          ? 'bg-gradient-to-r from-blue-400 to-cyan-200 text-white shadow-lg animate-glow'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              {/* Events Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                {events.slice(0, visibleEvents).map((event, index) => (
                  <div
                    key={event.id}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-500 ease-out hover:scale-105 hover-lift overflow-hidden ${
                      eventsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } stagger-${(index % 4) + 1}`}
                  >
                    <div className='relative'>
                      <ImageWithLoading src={event.image} alt={event.title} className='h-48 w-full' />
                      <button className='absolute top-4 right-4 p-2 glass rounded-full hover:bg-white transition-colors duration-200'>
                        <Heart className='w-5 h-5 text-gray-600' />
                      </button>
                      <div className='absolute bottom-4 left-4 right-4'>
                        <SoftButton size='sm' className='w-full'>
                          Xem
                        </SoftButton>
                      </div>
                    </div>
                    <div className='p-6'>
                      <h3 className='font-bold text-lg mb-2 line-clamp-2 transition-colors duration-200'>
                        {event.title}
                      </h3>
                      <div className='space-y-2 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4' />
                          <span>{event.date}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>{event.time}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4' />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className='flex items-center justify-between mt-4'>
                        <span className='font-bold text-lg'>{event.price}</span>
                        <span className='text-sm text-gray-500'>{event.organizer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleEvents < events.length && (
                <div className='text-center'>
                  <SoftButton
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    size='lg'
                    className='relative overflow-hidden'
                  >
                    {isLoadingMore ? (
                      <div className='flex items-center gap-3'>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        <span>Loading amazing events...</span>
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer'></div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span>See More Events</span>
                        <ArrowRight className='w-5 h-5' />
                      </div>
                    )}
                  </SoftButton>
                </div>
              )}
            </div>
          </section>

          {/* Top Destinations */}
          <section
            ref={destinationsRef}
            className={`py-16 px-4 sm:px-6 lg:px-8 transition-transform duration-1000 delay-400 transform ${
              destinationsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className='max-w-7xl mx-auto'>
              <div className='flex items-center justify-between mb-8'>
                <h2 className='text-3xl font-bold text-gray-900 animate-fade-in-up'>Top Destinations in USA</h2>
                <button className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 animate-fade-in-up stagger-1'>
                  <ArrowRight className='w-6 h-6' />
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {destinations.map((destination, index) => (
                  <div
                    key={destination.name}
                    className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-500 ease-out hover:scale-105 hover-lift h-64 ${
                      destinationsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } stagger-${index + 1}`}
                  >
                    <ImageWithLoading src={destination.image} alt={destination.name} className='h-full w-full' />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                    <div className='absolute bottom-6 left-6'>
                      <h3 className='text-white text-2xl font-bold'>{destination.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            ref={testimonialsRef}
            className={`py-16 px-4 sm:px-6 lg:px-8 bg-white transition-transform duration-1000 delay-500 transform ${
              testimonialsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className='max-w-7xl mx-auto'>
              <div className='flex items-center justify-between mb-8'>
                <h2 className='text-3xl font-bold text-gray-900 animate-fade-in-up'>What people said...</h2>
                <button className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 animate-fade-in-up stagger-1'>
                  <ArrowRight className='w-6 h-6' />
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.name}
                    className={`bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-transform duration-500 ease-out hover:scale-105 hover-lift ${
                      testimonialsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } stagger-${index + 1}`}
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <ImageWithLoading
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className='w-12 h-12 rounded-full'
                        aspectRatio='aspect-square'
                      />
                      <div>
                        <h4 className='font-semibold text-gray-900'>{testimonial.name}</h4>
                        <div className='flex items-center gap-1'>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className='text-gray-600 text-sm leading-relaxed'>{testimonial.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Personalization Modal */}
          {showPersonalizationModal && (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-up shadow-2xl'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900'>Let's make it personal!</h3>
                  <button
                    onClick={() => setShowPersonalizationModal(false)}
                    className='p-2 hover:bg-gray-100 rounded-full transition-colors duration-200'
                  >
                    <X className='w-6 h-6' />
                  </button>
                </div>
                <p className='text-gray-600 mb-6'>
                  Select your interests to get event suggestions based on what you love
                </p>
                <div className='flex flex-wrap gap-3 mb-8'>
                  {interests.map((interest, index) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-transform duration-300 ease-out hover:scale-105 animate-fade-in-up stagger-${
                        (index % 8) + 1
                      } ${
                        selectedInterests.includes(interest)
                          ? 'bg-gradient-to-r from-blue-400 to-cyan-200 text-white shadow-lg animate-glow'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                <div className='flex justify-center'>
                  <SoftButton onClick={() => setShowPersonalizationModal(false)} size='lg' className='animate-glow'>
                    Save Preferences ({selectedInterests.length} selected)
                  </SoftButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Home

'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import categoryApis from '@/apis/categories.api'
import CarouselBannerOptimized from '@/components/custom/CarouselBanner/CarouselBannerOptimized'
import SmartSEO from '@/components/SEO/SmartSEO'
import { pageSEO } from '@/components/SEO/SEO'
import OptimizedImage from '@/components/custom/OptimizedImage'
import ImagePreloader from '@/components/custom/ImagePreloader'
import FeaturedEvents from './components/FeaturedEvents'
import FeatureSection from './components/FeatureSection'
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
              <div className='relative overflow-hidden shadow-2xl mb-12 h-auto bg-gradient-to-r from-purple-200 via-blue-300 to-indigo-200'>
                <CarouselBannerOptimized />
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section ref={categoriesRef} className='py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50'>
            <div className='max-w-7xl mx-auto'>
              <h2 className='text-4xl font-bold text-center mb-12 text-gray-900'>Danh Mục Sự Kiện</h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-6'>
                {categories?.data?.map((category, index) => (
                  <div
                    key={category.name}
                    className='category-item group cursor-pointer transition-transform duration-300 ease-out hover:scale-105 hover-lift'
                  >
                    <div className='relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
                      <OptimizedImage
                        src={category.imageUrl}
                        alt={category.name}
                        width={400}
                        height={320}
                        className='h-32 w-full'
                        aspectRatio=''
                        priority={index < 8}
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 12.5vw'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                      <div className='absolute bottom-0 left-0 right-0 p-4 text-center'>
                        <p className='text-white font-medium text-sm'>{category.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Events Section */}
          <FeaturedEvents />

          {/* Feature Section 1 - AI Search */}
          <FeatureSection
            mainTitle='Tìm Kiếm Sự Kiện Thông Minh với AI'
            mainDescription='Trải nghiệm công nghệ tìm kiếm tiên tiến với AI đa phương thức. Tìm kiếm sự kiện bằng văn bản, hình ảnh hoặc kết hợp cả hai để có kết quả chính xác nhất.'
            features={[
              {
                image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=600',
                title: 'Tìm Kiếm Văn Bản',
                description: 'Tìm kiếm sự kiện bằng từ khóa với độ chính xác cao, hỗ trợ tiếng Việt và ngôn ngữ quốc tế.'
              },
              {
                image: 'https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?w=600&h=600',
                title: 'Tìm Kiếm Hình Ảnh',
                description: 'Upload hình ảnh để tìm các sự kiện tương tự với công nghệ AI nhận diện hình ảnh tiên tiến.'
              },
              {
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=600',
                title: 'Tìm Kiếm Kết Hợp',
                description: 'Kết hợp cả văn bản và hình ảnh để có kết quả tìm kiếm chính xác và phù hợp nhất.'
              },
              {
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=600',
                title: 'Lọc & Sắp Xếp',
                description: 'Lọc theo danh mục, khoảng thời gian và sắp xếp kết quả theo nhiều tiêu chí khác nhau.'
              }
            ]}
            bgColor='dark'
          />

          {/* Feature Section 2 - Seat Management */}
          <FeatureSection
            mainTitle='Quản Lý Ghế Ngồi Hiện Đại & Trực Quan'
            mainDescription='Thiết kế và quản lý sơ đồ ghế ngồi chuyên nghiệp với công nghệ AI và giao diện 3D độc đáo, mang lại trải nghiệm đặt vé tuyệt vời.'
            features={[
              {
                image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=600',
                title: 'AI Phát Hiện Tự Động',
                description: 'Upload ảnh hoặc video sơ đồ ghế, AI sẽ tự động phát hiện và tạo cấu trúc ghế ngồi.'
              },
              {
                image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&h=600',
                title: 'Chỉnh Sửa Kéo Thả',
                description: 'Giao diện trực quan với công cụ vẽ đa dạng: polygon, hình tròn, tam giác, ngôi sao và nhiều hơn nữa.'
              },
              {
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=600',
                title: 'Xem Ghế 3D',
                description: 'Người dùng có thể xem và chọn ghế trong không gian 3D sinh động, tạo trải nghiệm đặt vé độc đáo.'
              },
              {
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600',
                title: 'Tích Hợp Loại Vé',
                description: 'Liên kết từng khu vực ghế với các loại vé khác nhau, quản lý giá và số lượng dễ dàng.'
              }
            ]}
            bgColor='light'
          />

          {/* Feature Section 3 - Schedule & Analytics */}
          <FeatureSection
            mainTitle='Lịch Trình & Thống Kê Toàn Diện'
            mainDescription='Quản lý lịch trình sự kiện hiệu quả và theo dõi hiệu suất qua các biểu đồ phân tích chi tiết, giúp bạn tối ưu hóa chiến lược kinh doanh.'
            features={[
              {
                image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=600',
                title: 'Quản Lý Lịch',
                description: 'Giao diện lịch trực quan với khả năng kéo thả, tạo và chỉnh sửa lịch trình dễ dàng.'
              },
              {
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600',
                title: 'Phân Công Nhiệm Vụ',
                description: 'Giao nhiệm vụ cho từng thành viên trong team với thông báo và nhắc nhở tự động.'
              },
              {
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600',
                title: 'Biểu Đồ Phân Tích',
                description: 'Theo dõi số liệu sự kiện, doanh thu, vé bán qua các biểu đồ trực quan và dễ hiểu.'
              },
              {
                image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=600',
                title: 'Theo Dõi Thời Gian Thực',
                description: 'Cập nhật dữ liệu real-time về trạng thái sự kiện, bán vé và hoạt động của team.'
              }
            ]}
            bgColor='dark'
          />

          {/* CTA Section */}
          <CTASection />
        </div>
      </div>
    </>
  )
}

export default Home

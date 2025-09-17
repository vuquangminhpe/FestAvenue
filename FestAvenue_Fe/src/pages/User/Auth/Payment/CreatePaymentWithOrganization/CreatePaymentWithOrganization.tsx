import { useRef, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { gsap } from 'gsap'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, QrCode, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Shield, Crown, Clock } from 'lucide-react'
import paymentApis from '@/apis/payment.api'
import VietQRBanking from '@/components/custom/QR/QRSection'
import type { bodyCreatePaymentWithOrganization } from '@/types/payment.types'
import { SubDescriptionStatus } from '@/constants/enum'
import { getIdFromNameId } from '@/utils/utils'
import { toast } from 'sonner'
import packageApis from '@/apis/package.api'
import type { getPackageByStatusRes } from '@/types/package.types'

export default function CreatePaymentWithOrganization() {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState<1 | 2 | 'success'>(1)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [organizationInfo, setOrganizationInfo] = useState<{
    organizationId: string
    packageId: string
    name: string
  } | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const { data: getDataPackage } = useQuery({
    queryKey: ['getDataPackage'],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: true })
  })
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const encodedData = Array.from(searchParams.keys())[0]

    if (encodedData) {
      try {
        const getNameOrga = encodedData.split('-')[1]
        const parsedData = getIdFromNameId(encodedData)

        const [orgId, packageId] = parsedData.split('_')
        setOrganizationInfo({
          organizationId: orgId,
          packageId: packageId,
          name: getNameOrga
        })
      } catch (error) {
        console.error('Error parsing URL parameters:', error)
      }
    }
  }, [location])
  const paymentPriceInDataPackage = (getDataPackage?.data as any)?.filter(
    (data: getPackageByStatusRes) => data?.id === organizationInfo?.packageId
  )

  const createPaymentMutation = useMutation({
    mutationFn: (body: bodyCreatePaymentWithOrganization) => paymentApis.createPaymentWithOrganization(body),
    onSuccess: (data) => {
      setPaymentData(data?.data)
      setCurrentStep(2)
      setIsExpired(false)

      // Initialize countdown timer
      if (data?.data?.expirationTime) {
        const expirationTime = new Date(data.data.expirationTime).getTime()
        const currentTime = new Date().getTime()
        const timeRemaining = Math.max(0, expirationTime - currentTime)
        setTimeLeft(Math.floor(timeRemaining / 1000)) // Convert to seconds
      }
      if (step1Ref.current && step2Ref.current) {
        gsap.to(step1Ref.current, {
          x: -100,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out'
        })

        gsap.fromTo(
          step2Ref.current,
          {
            x: 100,
            opacity: 0,
            display: 'block'
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            delay: 0.3
          }
        )
      }
    },
    onError: (error) => {
      console.error('Payment creation failed:', error)
    }
  })

  const checkStatusMutation = useMutation({
    mutationFn: () => paymentApis.getPaymentStatusByOrganization(organizationInfo?.organizationId as string),
    onSuccess: (data) => {
      if (data?.data?.subDescription.status === SubDescriptionStatus.Paymented) {
        setCurrentStep('success')
        if (step2Ref.current && successRef.current) {
          gsap.to(step2Ref.current, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          })

          gsap.fromTo(
            successRef.current,
            {
              scale: 0,
              opacity: 0,
              display: 'flex'
            },
            {
              scale: 1,
              opacity: 1,
              duration: 1.5,
              ease: 'elastic.out(1, 0.5)',
              delay: 0.5
            }
          )

          // Enhanced fireworks animation
          const createFireworks = () => {
            const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#ec4899']
            const shapes = ['circle', 'star', 'diamond', 'square']

            // Create multiple firework bursts
            for (let burst = 0; burst < 5; burst++) {
              const burstX = Math.random() * window.innerWidth
              const burstY = Math.random() * (window.innerHeight * 0.4) + 100

              setTimeout(() => {
                // Create explosion effect
                for (let i = 0; i < 15; i++) {
                  const particle = document.createElement('div')
                  const color = colors[Math.floor(Math.random() * colors.length)]
                  const shape = shapes[Math.floor(Math.random() * shapes.length)]
                  const size = Math.random() * 8 + 6

                  particle.style.position = 'fixed'
                  particle.style.left = burstX + 'px'
                  particle.style.top = burstY + 'px'
                  particle.style.width = size + 'px'
                  particle.style.height = size + 'px'
                  particle.style.backgroundColor = color
                  particle.style.pointerEvents = 'none'
                  particle.style.zIndex = '9999'
                  particle.style.boxShadow = `0 0 ${size}px ${color}`

                  // Different shapes
                  if (shape === 'circle') {
                    particle.style.borderRadius = '50%'
                  } else if (shape === 'star') {
                    particle.style.borderRadius = '50% 0'
                    particle.style.transform = 'rotate(45deg)'
                  } else if (shape === 'diamond') {
                    particle.style.borderRadius = '0'
                    particle.style.transform = 'rotate(45deg)'
                  } else {
                    particle.style.borderRadius = '2px'
                  }

                  document.body.appendChild(particle)

                  // Random explosion direction
                  const angle = (i / 15) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
                  const velocity = Math.random() * 200 + 100
                  const gravity = Math.random() * 500 + 300

                  gsap.to(particle, {
                    x: Math.cos(angle) * velocity,
                    y: Math.sin(angle) * velocity + gravity,
                    rotation: Math.random() * 720,
                    scale: 0,
                    opacity: 0,
                    duration: 2 + Math.random(),
                    ease: 'power2.out',
                    onComplete: () => particle.remove()
                  })
                }

                // Add sparkle trail effect
                for (let j = 0; j < 8; j++) {
                  setTimeout(() => {
                    const sparkle = document.createElement('div')
                    sparkle.style.position = 'fixed'
                    sparkle.style.left = burstX + (Math.random() - 0.5) * 100 + 'px'
                    sparkle.style.top = burstY + (Math.random() - 0.5) * 100 + 'px'
                    sparkle.style.width = '4px'
                    sparkle.style.height = '4px'
                    sparkle.style.backgroundColor = '#ffffff'
                    sparkle.style.borderRadius = '50%'
                    sparkle.style.pointerEvents = 'none'
                    sparkle.style.zIndex = '9999'
                    sparkle.style.boxShadow = '0 0 10px #ffffff'

                    document.body.appendChild(sparkle)

                    gsap.to(sparkle, {
                      scale: 0,
                      opacity: 0,
                      duration: 0.5,
                      ease: 'power2.out',
                      onComplete: () => sparkle.remove()
                    })
                  }, j * 100)
                }
              }, burst * 300)
            }

            // Add falling golden confetti
            setTimeout(() => {
              for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div')
                confetti.style.position = 'fixed'
                confetti.style.left = Math.random() * window.innerWidth + 'px'
                confetti.style.top = '-20px'
                confetti.style.width = Math.random() * 6 + 4 + 'px'
                confetti.style.height = Math.random() * 6 + 4 + 'px'
                confetti.style.backgroundColor = ['#ffd700', '#ffed4e', '#f59e0b', '#eab308'][
                  Math.floor(Math.random() * 4)
                ]
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
                confetti.style.pointerEvents = 'none'
                confetti.style.zIndex = '9998'

                document.body.appendChild(confetti)

                gsap.to(confetti, {
                  y: window.innerHeight + 50,
                  x: (Math.random() - 0.5) * 200,
                  rotation: Math.random() * 720,
                  duration: Math.random() * 3 + 2,
                  ease: 'power1.out',
                  onComplete: () => confetti.remove()
                })
              }
            }, 1000)
          }

          createFireworks()
        }
      }
    }
  })

  const handleCreatePayment = () => {
    if (organizationInfo) {
      createPaymentMutation.mutate({
        organizationId: organizationInfo.organizationId,
        packageId: organizationInfo.packageId
      })
    }
  }

  const handleCheckStatus = () => {
    if (paymentData?.paymentId) {
      checkStatusMutation.mutateAsync(paymentData.paymentId)
    }
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (currentStep === 2 && timeLeft > 0 && !isExpired) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time expired
            setIsExpired(true)
            setCurrentStep(1)
            setPaymentData(null)

            // Show toast notification
            toast.error('Hết hạn thời gian chuyển khoản. Vui lòng tạo lại mã chuyển khoản mới.', {
              duration: 5000
            })

            // Animate back to step 1
            if (step2Ref.current && step1Ref.current) {
              gsap.to(step2Ref.current, {
                x: 100,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
              })

              gsap.fromTo(
                step1Ref.current,
                {
                  x: -100,
                  opacity: 0,
                  display: 'block'
                },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                  delay: 0.3
                }
              )
            }

            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [currentStep, timeLeft, isExpired])

  // Initial animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' })
    }
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' ref={containerRef}>
      <Helmet>
        <title>Thanh toán gói dịch vụ - FestAvenue</title>
        <meta name='description' content='Thanh toán gói dịch vụ cho tổ chức' />
      </Helmet>

      {/* Header */}
      <div className='bg-gradient-to-r from-cyan-400 to-blue-300 py-16 relative overflow-hidden'>
        <div className='absolute inset-0 bg-white/10 opacity-30'></div>
        <div className='container mx-auto px-4 relative z-10'>
          <div className='flex items-center gap-4 mb-6'>
            <Button
              variant='ghost'
              onClick={() => navigate(-1)}
              className='text-white hover:bg-white/20 backdrop-blur-sm'
            >
              <ArrowLeft className='h-5 w-5 mr-2' />
              Quay lại
            </Button>
          </div>
          <div className='flex items-center gap-4'>
            <div className='p-4 bg-white/20 backdrop-blur-sm rounded-xl'>
              <CreditCard className='h-8 w-8 text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold text-white mb-2'>Thanh toán gói dịch vụ</h1>
              <p className='text-cyan-100 text-lg'>{organizationInfo?.name && `Tổ chức: ${organizationInfo.name}`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          {/* Progress Steps */}
          <div className='flex items-center justify-center mb-12'>
            <div className='flex items-center space-x-8'>
              <div
                className={`flex items-center space-x-3 ${
                  (typeof currentStep === 'number' && currentStep >= 1) || currentStep === 'success'
                    ? 'text-cyan-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    (typeof currentStep === 'number' && currentStep >= 1) || currentStep === 'success'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  1
                </div>
                <span className='font-semibold'>Tạo thanh toán</span>
              </div>
              <div
                className={`w-16 h-1 ${
                  (typeof currentStep === 'number' && currentStep >= 2) || currentStep === 'success'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-300'
                    : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`flex items-center space-x-3 ${
                  (typeof currentStep === 'number' && currentStep >= 2) || currentStep === 'success'
                    ? 'text-cyan-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    (typeof currentStep === 'number' && currentStep >= 2) || currentStep === 'success'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  2
                </div>
                <span className='font-semibold'>Quét mã QR</span>
              </div>
              <div
                className={`w-16 h-1 ${
                  currentStep === 'success' ? 'bg-gradient-to-r from-cyan-400 to-blue-300' : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`flex items-center space-x-3 ${
                  currentStep === 'success' ? 'text-cyan-500' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === 'success' ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white' : 'bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className='h-5 w-5' />
                </div>
                <span className='font-semibold'>Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Step 1: Create Payment */}
          <div ref={step1Ref} style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Card className='border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-cyan-400 to-blue-300 rounded-md text-white'>
                <CardTitle className='flex justify-center items-center text-center text-xl'>
                  Tạo yêu cầu thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className='p-8'>
                <div className='text-center space-y-6'>
                  <div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-6'>
                    <Crown className='h-12 w-12 text-cyan-600' />
                  </div>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-800 mb-2'>Nâng cấp gói dịch vụ</h3>
                    <p className='text-gray-600 text-lg'>
                      Nhấn nút bên dưới để tạo yêu cầu thanh toán và nâng cấp gói dịch vụ cho tổ chức của bạn
                    </p>
                  </div>
                  <Button
                    onClick={handleCreatePayment}
                    disabled={createPaymentMutation.isPending || !organizationInfo}
                    className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white px-8 py-4 text-lg font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-500 transition-all duration-300 shadow-xl cursor-pointer'
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <RefreshCw className='h-5 w-5 mr-2 animate-spin' />
                        Đang tạo...
                      </>
                    ) : (
                      <>Tạo thanh toán</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: QR Code */}
          <div ref={step2Ref} style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <Card className='border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-cyan-400 to-blue-300 rounded-md text-white'>
                <CardTitle className='flex justify-center items-center text-xl'>
                  <QrCode className='h-6 w-6 mr-3' />
                  Quét mã QR để thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className='p-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
                  {/* QR Code */}
                  <div className='text-center'>
                    <div className='inline-block'>
                      {paymentData && (
                        <VietQRBanking
                          amount={paymentPriceInDataPackage?.[0].price}
                          content={`${paymentData.code}`}
                          accountNumber='0979781768'
                          bankCode='MB'
                          accountName='VU QUANG MINH'
                        />
                      )}
                    </div>
                    <div className='mt-6 space-y-3'>
                      <Badge className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white px-4 py-2 text-sm font-semibold'>
                        Mã thanh toán: {paymentData?.code}
                      </Badge>

                      {/* Countdown Timer */}
                      {timeLeft > 0 && (
                        <div className='flex items-center justify-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg p-3'>
                          <Clock
                            className={`h-5 w-5 ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}
                          />
                          <span className={`font-bold text-lg ${timeLeft <= 60 ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatTime(timeLeft)}
                          </span>
                          <span className='text-orange-700 text-sm font-medium'>
                            {timeLeft <= 60 ? 'Sắp hết hạn!' : 'Thời gian còn lại'}
                          </span>
                        </div>
                      )}

                      {paymentData?.expirationTime && (
                        <p className='text-gray-600 text-sm'>
                          Hết hạn: {new Date(paymentData.expirationTime).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-2xl font-bold text-gray-800 mb-4 flex items-center'>
                        <AlertCircle className='h-6 w-6 mr-2 text-cyan-600' />
                        Hướng dẫn thanh toán
                      </h3>
                      <ol className='space-y-3 text-gray-700'>
                        <li className='flex items-start'>
                          <span className='inline-flex items-center justify-center w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full text-sm font-bold mr-3 mt-0.5'>
                            1
                          </span>
                          Mở ứng dụng ngân hàng trên điện thoại
                        </li>
                        <li className='flex items-start'>
                          <span className='inline-flex items-center justify-center w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full text-sm font-bold mr-3 mt-0.5'>
                            2
                          </span>
                          Chọn chức năng quét mã QR
                        </li>
                        <li className='flex items-start'>
                          <span className='inline-flex items-center justify-center w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full text-sm font-bold mr-3 mt-0.5'>
                            3
                          </span>
                          Quét mã QR phía bên trái
                        </li>
                        <li className='flex items-start'>
                          <span className='inline-flex items-center justify-center w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full text-sm font-bold mr-3 mt-0.5'>
                            4
                          </span>
                          Xác nhận thanh toán trong ứng dụng
                        </li>
                      </ol>
                    </div>

                    <div className='pt-6 border-t'>
                      <Button
                        onClick={handleCheckStatus}
                        disabled={checkStatusMutation.isPending}
                        className='w-full bg-gradient-to-r from-cyan-400 to-blue-300 text-white py-4 text-lg font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                      >
                        {checkStatusMutation.isPending ? (
                          <>
                            <RefreshCw className='h-5 w-5 mr-2 animate-spin' />
                            Đang kiểm tra...
                          </>
                        ) : (
                          <>
                            <Shield className='h-5 w-5 mr-2' />
                            Kiểm tra trạng thái chuyển tiền
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Screen */}
          <div
            ref={successRef}
            style={{ display: currentStep === 'success' ? 'flex' : 'none' }}
            className='flex-col items-center justify-center text-center space-y-8'
          >
            <Card className='border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden max-w-2xl w-full'>
              <CardContent className='p-12'>
                <div className='space-y-6'>
                  <div className='inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 mx-auto'>
                    <CheckCircle2 className='h-16 w-16 text-white' />
                  </div>
                  <div>
                    <h2 className='text-4xl font-bold text-gray-800 mb-4'>Thanh toán thành công! </h2>
                    <p className='text-xl text-gray-600 mb-8'>
                      Gói dịch vụ của bạn đã được kích hoạt thành công. Bạn có thể sử dụng đầy đủ tính năng ngay bây
                      giờ.
                    </p>
                  </div>
                  <div className='flex gap-4 justify-center'>
                    <Button
                      onClick={() => navigate(-1)}
                      className='bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                    >
                      Quay lại tổ chức
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

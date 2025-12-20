import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gsap } from 'gsap'
import {
  Package as PackageIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Check,
  RefreshCw
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import VietQRBanking from '@/components/custom/QR/QRSection'

import packageApis from '@/apis/package.api'
import paymentApis from '@/apis/payment.api'
import path from '@/constants/path'
import type { Package } from '@/types/package.types'
import { PaymentStatus } from '@/types/payment.types'
import { toast } from 'sonner'
import { getIdFromNameId } from '@/utils/utils'

export default function PaymentEvent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const eventId = getIdFromNameId(location.search).split('?')[1]

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isTimeout, setIsTimeout] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)
  const qrSectionRef = useRef<HTMLDivElement>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch packages
  const packagesQuery = useQuery({
    queryKey: ['packages', true],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: true }),
    enabled: !selectedPackage
  })

  const packages = (packagesQuery.data?.data || []) as Package[]

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: paymentApis.createPaymentPackage,
    onSuccess: (data) => {
      if (data?.data) {
        const { code, paymentId, expirationTime } = data.data

        setPaymentId(paymentId)
        setQrCode(code)
        setPaymentAmount(selectedPackage?.totalPrice || 0)

        // Calculate timeout from expirationTime
        const expTime = new Date(expirationTime).getTime()
        const currentTime = Date.now()
        const calculatedTimeRemaining = expTime - currentTime

        if (calculatedTimeRemaining > 0) {
          setTimeRemaining(calculatedTimeRemaining)
          startCountdown(calculatedTimeRemaining)
          toast.success('Tạo thanh toán thành công! Vui lòng quét mã QR để thanh toán.')
        } else {
          setIsTimeout(true)
          setPaymentError('Mã QR đã hết hạn')
        }
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể tạo thanh toán')
      setPaymentError('Không thể tạo thanh toán. Vui lòng thử lại.')
    }
  })

  // Manual check payment status
  const handleCheckPaymentStatus = async () => {
    if (!paymentId) {
      toast.error('Không tìm thấy mã thanh toán')
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await paymentApis.getStatusPaymentByPaymentId(paymentId)
      const status = response?.data?.data

      if (status === PaymentStatus.Completed) {
        handlePaymentSuccess()
      } else if (status === PaymentStatus.Failed || status === PaymentStatus.Cancelled) {
        handlePaymentFailure()
      } else if (status === PaymentStatus.Pending) {
        toast.info('Thanh toán đang chờ xử lý')
      } else {
        toast.warning('Trạng thái thanh toán không xác định')
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error)
      toast.error(error?.message || 'Không thể kiểm tra trạng thái thanh toán')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const startCountdown = (initialTime: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    const startTime = Date.now()
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = initialTime - elapsed

      if (remaining <= 0) {
        setTimeRemaining(0)
        setIsTimeout(true)
        stopCountdown()
        toast.error('Hết thời gian thanh toán!')
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  const handlePaymentSuccess = () => {
    stopCountdown()
    toast.success('Thanh toán thành công!')
    setTimeout(() => {
      navigate(path.user.my.payment)
    }, 2000)
  }

  const handlePaymentFailure = () => {
    stopCountdown()
    setPaymentError('Thanh toán thất bại. Vui lòng thử lại.')
    toast.error('Thanh toán thất bại!')
  }

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg)

    // Animate to payment section
    setTimeout(() => {
      if (qrSectionRef.current) {
        qrSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleCreatePayment = async () => {
    if (!eventId || !selectedPackage) {
      toast.error('Thiếu thông tin cần thiết')
      return
    }

    // Check if package is free (0 VND)
    if (selectedPackage.totalPrice === 0) {
      toast.success('Gói miễn phí! Đang kích hoạt cho sự kiện...')

      // Create free payment and redirect immediately
      createPaymentMutation.mutateAsync(
        {
          eventCode: eventId,
          packageId: selectedPackage.id
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['myEvents'] })
              toast.success('Kích hoạt gói thành công!')
              navigate(path.user.my.events)
            }, 1500)
          }
        }
      )
      return
    }

    setPaymentError(null)
    setIsTimeout(false)
    createPaymentMutation.mutateAsync({
      eventCode: eventId,
      packageId: selectedPackage.id
    })
  }

  const handleRetryPayment = () => {
    setPaymentId(null)
    setQrCode(null)
    setPaymentError(null)
    setIsTimeout(false)
    setTimeRemaining(0)
    handleCreatePayment()
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
    }
  }, [])

  useEffect(() => {
    if (packagesRef.current && packages.length > 0) {
      const cards = packagesRef.current.querySelectorAll('.package-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.4)'
        }
      )
    }
  }, [packages])

  useEffect(() => {
    if (qrSectionRef.current && qrCode) {
      gsap.fromTo(
        qrSectionRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        }
      )
    }
  }, [qrCode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown()
    }
  }, [])

  if (!eventId) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-4'>Không tìm thấy thông tin sự kiện</p>
            <Button onClick={() => navigate(path.user.my.events)} className='w-full'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Quay lại danh sách sự kiện
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8 px-4'>
      <Helmet>
        <title>Thanh toán gói dịch vụ - FestAvenue</title>
      </Helmet>

      <div ref={containerRef} className='max-w-6xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <Button variant='ghost' onClick={() => navigate(path.user.my.events)} className='mb-4 -ml-2'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Quay lại
            </Button>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
              Chọn gói dịch vụ
            </h1>
            <p className='text-gray-600 mt-2'>Chọn gói phù hợp nhất cho sự kiện của bạn</p>
          </div>

          {qrCode && (
            <div className='hidden lg:flex items-center gap-4 bg-white px-6 py-4 rounded-xl border-2 border-cyan-200 shadow-lg'>
              <Clock className='w-6 h-6 text-cyan-600' />
              <div>
                <p className='text-sm text-gray-600'>Thời gian còn lại</p>
                <p className='text-2xl font-bold text-cyan-600'>{formatTime(timeRemaining)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Package Selection */}
        {!qrCode && (
          <div ref={packagesRef}>
            {packagesQuery.isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className='animate-pulse'>
                    <CardHeader>
                      <div className='h-6 bg-gray-200 rounded w-3/4 mb-2'></div>
                      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    </CardHeader>
                    <CardContent>
                      <div className='h-32 bg-gray-200 rounded'></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : packages.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <PackageIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-700 mb-2'>Chưa có gói dịch vụ nào</h3>
                  <p className='text-gray-500'>Vui lòng quay lại sau</p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`package-card relative overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${
                      selectedPackage?.id === pkg.id
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {/* Selected Indicator */}
                    {selectedPackage?.id === pkg.id && (
                      <div className='absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full p-2 shadow-lg'>
                        <Check className='w-5 h-5' />
                      </div>
                    )}

                    {/* Popular Badge - based on priority */}
                    {pkg.priority >= 5 && (
                      <div className='absolute top-4 left-4'>
                        <Badge className='bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0'>
                          <Sparkles className='w-3 h-3 mr-1' />
                          Phổ biến
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className='text-2xl flex items-center gap-2'>
                        <PackageIcon className='w-6 h-6 text-cyan-600' />
                        {pkg.name}
                      </CardTitle>
                      <CardDescription className='text-base mt-2'>{pkg.description}</CardDescription>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      {/* Price */}
                      <div className='bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg p-4 text-center'>
                        <p className='text-sm text-gray-600 mb-1'>Giá gói</p>
                        <p className='text-3xl font-bold text-cyan-700'>{formatCurrency(pkg.totalPrice)}</p>
                      </div>

                      {/* Features */}
                      <div className='space-y-2'>
                        <p className='text-sm font-semibold text-gray-700'>Dịch vụ bao gồm:</p>
                        <ul className='space-y-2'>
                          {pkg.servicePackages?.slice(0, 5).map((service, idx) => (
                            <li key={idx} className='flex items-start gap-2 text-sm text-gray-600'>
                              <CheckCircle2 className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                              <span>{service.name}</span>
                            </li>
                          ))}
                          {pkg.servicePackages && pkg.servicePackages.length > 5 && (
                            <li className='text-sm text-cyan-600 font-medium'>
                              +{pkg.servicePackages.length - 5} dịch vụ khác
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Select Button */}
                      <Button
                        className={`w-full ${
                          selectedPackage?.id === pkg.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-cyan-500 hover:to-blue-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectPackage(pkg)
                        }}
                      >
                        {selectedPackage?.id === pkg.id ? (
                          <>
                            <Check className='w-4 h-4 mr-2' />
                            Đã chọn
                          </>
                        ) : (
                          'Chọn gói này'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirm Selection Button */}
        {selectedPackage && !qrCode && (
          <div className='flex justify-center'>
            <Card className='max-w-2xl w-full border-2 border-cyan-200 shadow-xl'>
              <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
                <CardTitle className='text-center'>Xác nhận thanh toán</CardTitle>
              </CardHeader>
              <CardContent className='pt-6 space-y-4'>
                <div className='flex items-center justify-between py-3 border-b'>
                  <span className='text-gray-600'>Gói đã chọn:</span>
                  <span className='font-semibold text-lg'>{selectedPackage.name}</span>
                </div>
                <div className='flex items-center justify-between py-3 border-b'>
                  <span className='text-gray-600'>Số tiền:</span>
                  <span className='font-bold text-2xl text-cyan-600'>{formatCurrency(selectedPackage.totalPrice)}</span>
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    variant='outline'
                    className='flex-1'
                    onClick={() => {
                      setSelectedPackage(null)
                      setPaymentError(null)
                    }}
                  >
                    Chọn lại
                  </Button>
                  <Button
                    className='flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                    onClick={handleCreatePayment}
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CreditCard className='w-4 h-4 mr-2' />
                        Thanh toán ngay
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Payment Section */}
        {qrCode && selectedPackage && (
          <div ref={qrSectionRef} className='space-y-6'>
            {/* Mobile Timer */}
            <div className='lg:hidden flex items-center justify-center gap-4 bg-white px-6 py-4 rounded-xl border-2 border-cyan-200 shadow-lg'>
              <Clock className='w-6 h-6 text-cyan-600' />
              <div>
                <p className='text-sm text-gray-600'>Thời gian còn lại</p>
                <p className='text-2xl font-bold text-cyan-600'>{formatTime(timeRemaining)}</p>
              </div>
            </div>

            {/* Error/Timeout Alert */}
            {(paymentError || isTimeout) && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertTriangle className='h-5 w-5 text-red-600' />
                <AlertDescription className='ml-2'>
                  <p className='font-semibold text-red-800'>{isTimeout ? 'Hết thời gian thanh toán!' : paymentError}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    className='mt-3 border-red-300 text-red-700 hover:bg-red-100'
                    onClick={handleRetryPayment}
                    disabled={createPaymentMutation.isPending}
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    Tạo lại thanh toán
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Info & QR */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Payment Info */}
              <Card className='border-2 border-cyan-200'>
                <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
                  <CardTitle className='flex items-center gap-2'>
                    <PackageIcon className='w-5 h-5 text-cyan-600' />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6 space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Gói dịch vụ:</span>
                      <span className='font-semibold'>{selectedPackage.name}</span>
                    </div>

                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Số tiền:</span>
                      <span className='font-bold text-xl text-cyan-600'>{formatCurrency(paymentAmount)}</span>
                    </div>

                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Mã giao dịch:</span>
                      <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
                        {paymentId?.slice(0, 12)}...
                      </span>
                    </div>

                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Trạng thái:</span>
                      <Badge className='bg-yellow-100 text-yellow-800 border-yellow-300'>
                        <Clock className='w-3 h-3 mr-1' />
                        Đang chờ thanh toán
                      </Badge>
                    </div>
                  </div>

                  <Alert className='bg-blue-50 border-blue-200'>
                    <AlertDescription className='text-sm text-blue-800'>
                      <p className='font-semibold mb-2'>Hướng dẫn thanh toán:</p>
                      <ol className='list-decimal list-inside space-y-1 text-xs'>
                        <li>Mở ứng dụng ngân hàng của bạn</li>
                        <li>Quét mã QR bên cạnh</li>
                        <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                        <li>Đợi hệ thống xác nhận (tự động)</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  {/* Check Payment Status Button */}
                  <div className='space-y-3'>
                    <Button
                      className='w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6'
                      onClick={handleCheckPaymentStatus}
                      disabled={isCheckingStatus}
                    >
                      {isCheckingStatus ? (
                        <>
                          <RefreshCw className='w-5 h-5 mr-2 animate-spin' />
                          Đang kiểm tra...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-5 h-5 mr-2' />
                          Kiểm tra trạng thái thanh toán
                        </>
                      )}
                    </Button>
                    <p className='text-xs text-center text-gray-500'>
                      Sau khi chuyển khoản thành công, bấm nút trên để kiểm tra
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card className='border-2 border-cyan-200 flex items-center justify-center'>
                <CardContent className='pt-6'>
                  <VietQRBanking amount={paymentAmount} content={qrCode} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

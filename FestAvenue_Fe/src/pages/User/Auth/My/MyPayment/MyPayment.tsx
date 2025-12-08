import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap } from 'gsap'
import {
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Receipt,
  Package,
  RefreshCw,
  TrendingUp,
  Eye,
  FileText,
  Ticket
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import userApi from '@/apis/user.api'
import type { getPaymentForUserData } from '@/types/user.types'
import { SeatStatus } from '@/types/user.types'
import { useUsersStore } from '@/contexts/app.context'
import EventTicketQRSection from '@/components/custom/QR/EventTicketQRSection'

const filterSchema = z.object({
  status: z.string().optional(),
  transactionFromDate: z.string().optional(),
  transactionToDate: z.string().optional(),
  createdFromDate: z.string().optional(),
  createdToDate: z.string().optional(),
  orderBy: z.string().optional(),
  pageSize: z.number().min(1).max(100).optional()
})

type FilterFormData = z.infer<typeof filterSchema>

export default function MyPayment() {
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<getPaymentForUserData | null>(null)
  const [showPaymentDetail, setShowPaymentDetail] = useState(false)
  const [, setShowQRSection] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: 'all',
      transactionFromDate: '',
      transactionToDate: '',
      createdFromDate: '',
      createdToDate: '',
      orderBy: 'createdAt',
      pageSize: 20
    }
  })

  // // Prepare query body
  // const getQueryBody = (formData: FilterFormData): bodyGetPaymentForUser => ({
  //   status: formData.status === 'all' ? '' : formData.status || '',
  //   transactionFromDate: formData.transactionFromDate || '',
  //   transactionToDate: formData.transactionToDate || '',
  //   createdFromDate: formData.createdFromDate || '',
  //   createdToDate: formData.createdToDate || '',
  //   pagination: {
  //     orderBy: formData.orderBy || 'createdAt',
  //     pageIndex,
  //     isPaging: true,
  //     pageSize: formData.pageSize || 20
  //   }
  // })
  const user = useUsersStore()
  // Fetch payments
  const paymentsQuery = useQuery({
    queryKey: ['payments', user?.isProfile?.id],
    queryFn: () => userApi.getPaymentForUser(user?.isProfile?.id as string),
    enabled: !!user?.isProfile?.id
  })

  // Filter out payments with no seats
  const payments = (paymentsQuery?.data?.data || []).filter((payment) => payment?.seats && payment.seats.length > 0)

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
    }
  }, [])

  useEffect(() => {
    if (statsRef.current && !paymentsQuery.isLoading) {
      const cards = statsRef.current.querySelectorAll('.stat-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        }
      )
    }
  }, [paymentsQuery.isLoading])

  useEffect(() => {
    if (tableRef.current && payments.length > 0) {
      const rows = tableRef.current.querySelectorAll('.payment-row')
      gsap.fromTo(
        rows,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out'
        }
      )
    }
  }, [payments])
  console.log(payments)

  // Calculate statistics
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    successful: payments.filter((p) => p.seats?.some((seat) => seat.seatStatus === SeatStatus.Scanned)).length,
    successfulAmount: payments
      .filter((p) => p?.seats?.some((seat) => seat.seatStatus === SeatStatus.Scanned))
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (payment: getPaymentForUserData) => {
    setSelectedPayment(payment)
    setShowPaymentDetail(true)
  }

  return (
    <div ref={containerRef} className='space-y-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
            Lịch sử thanh toán
          </h1>
          <p className='text-gray-600 mt-1'>Quản lý và theo dõi các giao dịch thanh toán của bạn</p>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => paymentsQuery.refetch()}
            disabled={paymentsQuery.isLoading}
            className='flex items-center gap-2'
          >
            <RefreshCw className={`w-4 h-4 ${paymentsQuery.isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div ref={statsRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='stat-card bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-cyan-700'>Tổng giao dịch</p>
                <p className='text-2xl font-bold text-cyan-900'>{stats.total}</p>
              </div>
              <div className='p-3 bg-cyan-100 rounded-full'>
                <Receipt className='w-6 h-6 text-cyan-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-700'>Thành công</p>
                <p className='text-2xl font-bold text-green-900'>{stats.successful}</p>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <CheckCircle className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-blue-700'>Tổng tiền</p>
                <p className='text-xl font-bold text-blue-900'>{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <DollarSign className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-purple-700'>Đã thanh toán</p>
                <p className='text-xl font-bold text-purple-900'>{formatCurrency(stats.successfulAmount)}</p>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <TrendingUp className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='w-5 h-5' />
            Danh sách giao dịch
            {paymentsQuery.isLoading && <RefreshCw className='w-4 h-4 animate-spin ml-2' />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsQuery.isLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='animate-pulse'>
                  <div className='flex items-center space-x-4 p-4 border rounded-lg'>
                    <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                    <div className='h-6 bg-gray-200 rounded w-20'></div>
                    <div className='h-4 bg-gray-200 rounded w-24'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <FileText className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có giao dịch nào</h3>
              <p className='text-gray-500'>Các giao dịch thanh toán của bạn sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div ref={tableRef} className='space-y-3'>
              {payments.map((payment: getPaymentForUserData, index) => {
                const seats = payment?.seats || []
                const firstSeat = seats.length > 0 ? seats[0] : null
                return (
                  <div
                    key={`${payment.event.eventCode}-${index}`}
                    className='payment-row flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:shadow-md transition-all duration-200 group'
                  >
                    <div className='flex items-center space-x-4 flex-1'>
                      <div className='p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full group-hover:from-cyan-200 group-hover:to-blue-200 transition-all duration-200'>
                        {payment.event.package ? (
                          <Package className='w-6 h-6 text-cyan-600' />
                        ) : (
                          <Receipt className='w-6 h-6 text-cyan-600' />
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <p className='font-semibold text-gray-900 truncate'>{payment.event.eventName}</p>
                          <Badge variant='outline' className='text-xs'>
                            {payment.event.eventCode}
                          </Badge>
                        </div>

                        <div className='flex flex-col lg:flex-row lg:items-center lg:gap-6 text-sm text-gray-600 space-y-1 lg:space-y-0'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {firstSeat?.paymentTime ? formatDate(firstSeat.paymentTime) : 'Chưa thanh toán'}
                          </div>

                          {payment.event.package && (
                            <div className='flex items-center gap-1'>
                              <Package className='w-3 h-3' />
                              {payment.event.package}
                            </div>
                          )}

                          <div className='flex items-center gap-1 text-blue-600'>
                            <Ticket className='w-3 h-3' />
                            {seats.length} ghế
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col lg:flex-row lg:items-center gap-3 mt-3 lg:mt-0'>
                      <div className='text-right'>
                        <p className='text-xl font-bold text-gray-900'>{formatCurrency(payment.amount)}</p>
                        {payment.event.refundAmount && payment.event.refundAmount > 0 && (
                          <p className='text-sm text-red-600'>Hoàn: {formatCurrency(payment.event.refundAmount)}</p>
                        )}
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        className='hover:bg-cyan-50 hover:text-cyan-700'
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {payments.length > 0 && (
            <div className='flex items-center justify-between mt-6 pt-4 border-t'>
              <p className='text-sm text-gray-600'>Hiển thị {payments.length} giao dịch</p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={pageIndex === 0 || paymentsQuery.isLoading}
                >
                  Trước
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPageIndex((prev) => prev + 1)}
                  disabled={payments.length < (form.getValues('pageSize') || 20) || paymentsQuery.isLoading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog open={showPaymentDetail} onOpenChange={setShowPaymentDetail}>
        <DialogContent className='!max-w-6xl sm:!max-w-6xl'>
          <EventTicketQRSection
            ticketData={selectedPayment as any}
            handleClose={() => {
              setShowQRSection(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

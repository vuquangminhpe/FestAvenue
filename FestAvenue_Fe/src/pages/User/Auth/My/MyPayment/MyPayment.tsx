import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap } from 'gsap'
import {
  Calendar,
  DollarSign,
  Filter,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Package,
  Search,
  RefreshCw,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import userApi from '@/apis/user.api'
import type { bodyGetPaymentForUser, getPaymentForUserData } from '@/types/user.types'

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

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Thành công' },
  { value: '0', label: 'Thất bại' },
  { value: '2', label: 'Đang xử lý' },
  { value: '3', label: 'Đã hoàn tiền' }
]

const orderByOptions = [
  { value: 'createdAt', label: 'Ngày tạo mới nhất' },
  { value: 'amount', label: 'Số tiền cao nhất' },
  { value: 'transactionDate', label: 'Ngày giao dịch mới nhất' }
]

export default function MyPayment() {
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<getPaymentForUserData | null>(null)
  const [showPaymentDetail, setShowPaymentDetail] = useState(false)
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

  // Prepare query body
  const getQueryBody = (formData: FilterFormData): bodyGetPaymentForUser => ({
    status: formData.status === 'all' ? '' : formData.status || '',
    transactionFromDate: formData.transactionFromDate || '',
    transactionToDate: formData.transactionToDate || '',
    createdFromDate: formData.createdFromDate || '',
    createdToDate: formData.createdToDate || '',
    pagination: {
      orderBy: formData.orderBy || 'createdAt',
      pageIndex,
      isPaging: true,
      pageSize: formData.pageSize || 20
    }
  })

  // Fetch payments
  const paymentsQuery = useQuery({
    queryKey: ['payments', form.watch(), pageIndex],
    queryFn: () => userApi.getPaymentForUser(getQueryBody(form.getValues())),
    enabled: true
  })

  const payments = paymentsQuery.data?.data?.result || []

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

  // Calculate statistics
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    successful: payments.filter((p) => p.status === 1).length,
    successfulAmount: payments.filter((p) => p.status === 1).reduce((sum, payment) => sum + payment.amount, 0)
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

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Thành công
          </Badge>
        )
      case 0:
        return (
          <Badge variant='destructive'>
            <XCircle className='w-3 h-3 mr-1' />
            Thất bại
          </Badge>
        )
      case 2:
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Clock className='w-3 h-3 mr-1' />
            Đang xử lý
          </Badge>
        )
      case 3:
        return (
          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
            <RefreshCw className='w-3 h-3 mr-1' />
            Đã hoàn tiền
          </Badge>
        )
      default:
        return <Badge variant='secondary'>Không xác định</Badge>
    }
  }

  const handleSearch = (data: FilterFormData) => {
    setPageIndex(0)
    console.log(data)
  }

  const resetFilters = () => {
    form.reset({
      status: 'all',
      transactionFromDate: '',
      transactionToDate: '',
      createdFromDate: '',
      createdToDate: '',
      orderBy: 'createdAt',
      pageSize: 20
    })
    setPageIndex(0)
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

      {/* Filters */}
      <Card className='border-cyan-200'>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-6'>
              {/* Basic Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn trạng thái' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='orderBy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sắp xếp theo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderByOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='pageSize'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số bản ghi</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                          <SelectItem value='100'>100</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Range Filters */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-gray-700 border-b pb-2'>Lọc theo ngày</h4>

                {/* Transaction Date Range */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='transactionFromDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Từ ngày giao dịch</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='transactionToDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đến ngày giao dịch</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Created Date Range */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='createdFromDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Từ ngày tạo</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='createdToDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đến ngày tạo</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  type='submit'
                  disabled={paymentsQuery.isLoading}
                  className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                >
                  <Search className='w-4 h-4 mr-2' />
                  Tìm kiếm
                </Button>
                <Button type='button' variant='outline' onClick={resetFilters}>
                  Đặt lại
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
              {payments.map((payment: getPaymentForUserData) => (
                <div
                  key={payment.id}
                  className='payment-row flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:shadow-md transition-all duration-200 group'
                >
                  <div className='flex items-center space-x-4 flex-1'>
                    <div className='p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full group-hover:from-cyan-200 group-hover:to-blue-200 transition-all duration-200'>
                      {payment.packageId ? (
                        <Package className='w-6 h-6 text-cyan-600' />
                      ) : (
                        <Receipt className='w-6 h-6 text-cyan-600' />
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-semibold text-gray-900 truncate'>ID: {payment.id.slice(0, 8)}...</p>
                        {payment.transactionId && (
                          <Badge variant='outline' className='text-xs'>
                            {payment.transactionId.slice(0, 6)}...
                          </Badge>
                        )}
                      </div>

                      <div className='flex flex-col lg:flex-row lg:items-center lg:gap-6 text-sm text-gray-600 space-y-1 lg:space-y-0'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {formatDate(payment.transactionDate)}
                        </div>

                        {payment.packageId && (
                          <div className='flex items-center gap-1'>
                            <Package className='w-3 h-3' />
                            Package: {payment.packageId.slice(0, 8)}...
                          </div>
                        )}

                        {payment.discount > 0 && (
                          <div className='flex items-center gap-1 text-green-600'>
                            <TrendingUp className='w-3 h-3' />
                            Giảm giá: {formatCurrency(payment.discount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col lg:flex-row lg:items-center gap-3 mt-3 lg:mt-0'>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-gray-900'>{formatCurrency(payment.amount)}</p>
                      {payment.refundAmount > 0 && (
                        <p className='text-sm text-red-600'>Hoàn: {formatCurrency(payment.refundAmount)}</p>
                      )}
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                      {getStatusBadge(payment.status)}
                      {payment.refundDate && (
                        <p className='text-xs text-gray-500'>Hoàn tiền: {formatDate(payment.refundDate)}</p>
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
              ))}
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
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Receipt className='w-5 h-5 text-cyan-600' />
              Chi tiết giao dịch
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className='space-y-6'>
              {/* Header Info */}
              <div className='flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>ID: {selectedPayment.id}</h3>
                  {selectedPayment.transactionId && (
                    <p className='text-sm text-gray-600'>Mã giao dịch: {selectedPayment.transactionId}</p>
                  )}
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-cyan-600'>{formatCurrency(selectedPayment.amount)}</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Payment Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm font-medium text-gray-700'>Thông tin thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Số tiền:</span>
                      <span className='font-semibold'>{formatCurrency(selectedPayment.amount)}</span>
                    </div>

                    {selectedPayment.discount > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Giảm giá:</span>
                        <span className='font-semibold text-green-600'>
                          -{formatCurrency(selectedPayment.discount)}
                        </span>
                      </div>
                    )}

                    {selectedPayment.refundAmount > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Số tiền hoàn:</span>
                        <span className='font-semibold text-red-600'>
                          {formatCurrency(selectedPayment.refundAmount)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Ngày giao dịch:</span>
                      <span className='font-semibold'>{formatDate(selectedPayment.transactionDate)}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Ngày tạo:</span>
                      <span className='font-semibold'>{formatDate(selectedPayment.createdAt)}</span>
                    </div>

                    {selectedPayment.updatedAt && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Ngày cập nhật:</span>
                        <span className='font-semibold'>{formatDate(selectedPayment.updatedAt)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm font-medium text-gray-700'>Thông tin bổ sung</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Trạng thái:</span>
                      <div>{getStatusBadge(selectedPayment.status)}</div>
                    </div>

                    {selectedPayment.packageId && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Package ID:</span>
                        <span className='font-semibold'>{selectedPayment.packageId}</span>
                      </div>
                    )}

                    {selectedPayment.eventId && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Event ID:</span>
                        <span className='font-semibold'>{selectedPayment.eventId}</span>
                      </div>
                    )}

                    {selectedPayment.organizationId && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Organization ID:</span>
                        <span className='font-semibold'>{selectedPayment.organizationId}</span>
                      </div>
                    )}

                    {selectedPayment.ticketId && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Ticket ID:</span>
                        <span className='font-semibold'>{selectedPayment.ticketId}</span>
                      </div>
                    )}

                    {selectedPayment.ticketType && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Loại vé:</span>
                        <span className='font-semibold'>{selectedPayment.ticketType}</span>
                      </div>
                    )}

                    {selectedPayment.moduleIds && selectedPayment.moduleIds.length > 0 && (
                      <div>
                        <span className='text-sm text-gray-600'>Module IDs:</span>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {selectedPayment.moduleIds.map((moduleId, index) => (
                            <Badge key={index} variant='outline' className='text-xs'>
                              {moduleId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Refund Information */}
              {selectedPayment.refundAmount > 0 && (
                <Card className='border-orange-200 bg-orange-50'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm font-medium text-orange-700 flex items-center gap-2'>
                      <RefreshCw className='w-4 h-4' />
                      Thông tin hoàn tiền
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Số tiền hoàn:</span>
                      <span className='font-semibold text-orange-600'>
                        {formatCurrency(selectedPayment.refundAmount)}
                      </span>
                    </div>

                    {selectedPayment.refundDate && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Ngày hoàn tiền:</span>
                        <span className='font-semibold'>{formatDate(selectedPayment.refundDate)}</span>
                      </div>
                    )}

                    {selectedPayment.refundReason && (
                      <div>
                        <span className='text-sm text-gray-600'>Lý do hoàn tiền:</span>
                        <p className='mt-1 text-sm font-medium bg-white p-2 rounded border'>
                          {selectedPayment.refundReason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button variant='outline' onClick={() => setShowPaymentDetail(false)}>
                  Đóng
                </Button>
                <Button
                  className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                  onClick={() => {
                    // Có thể thêm chức năng in hoặc xuất PDF ở đây
                    console.log('Export payment details:', selectedPayment)
                  }}
                >
                  <FileText className='w-4 h-4 mr-2' />
                  Xuất báo cáo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

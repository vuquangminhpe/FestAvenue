import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap } from 'gsap'
import {
  Calendar,
  DollarSign,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  FileText,
  Building2,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  Users
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

import eventApis from '@/apis/event.api'
import type { bodyCreateWithDrawal } from '@/types/event.types'
import { toast } from 'sonner'

const withdrawalRequestSchema = z.object({
  eventCode: z.string().min(1, 'Vui lòng chọn sự kiện'),
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  bankAccountNumber: z
    .string()
    .min(1, 'Số tài khoản không được để trống')
    .regex(/^[0-9]{6,20}$/, 'Số tài khoản phải có 6-20 chữ số'),
  bankName: z
    .string()
    .min(1, 'Tên ngân hàng không được để trống')
    .max(100, 'Tên ngân hàng không được quá 100 ký tự')
    .regex(/^[\p{L}\p{N}\s]+$/u, 'Tên ngân hàng không hợp lệ')
})

type WithdrawalRequestFormData = z.infer<typeof withdrawalRequestSchema>

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return (
        <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>
          <Clock className='w-3 h-3 mr-1' />
          Chờ xử lý
        </Badge>
      )
    case 1:
      return (
        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Đã chấp nhận
        </Badge>
      )
    case 2:
      return (
        <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
          <XCircle className='w-3 h-3 mr-1' />
          Đã từ chối
        </Badge>
      )
    default:
      return <Badge>Không xác định</Badge>
  }
}

export default function PostEventWithdrawal() {
  const [selectedEventCode, setSelectedEventCode] = useState<string>('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const form = useForm<WithdrawalRequestFormData>({
    resolver: zodResolver(withdrawalRequestSchema),
    defaultValues: {
      eventCode: '',
      email: '',
      phoneNumber: '',
      bankAccountNumber: '',
      bankName: ''
    }
  })

  // Fetch ended events
  const endedEventsQuery = useQuery({
    queryKey: ['endedEvents'],
    queryFn: () => eventApis.getEventEndTimeByUser(),
    staleTime: 5 * 60 * 1000
  })

  // Fetch withdrawal request detail
  const withdrawalDetailQuery = useQuery({
    queryKey: ['withdrawalDetail', selectedEventCode],
    queryFn: () => eventApis.getWithDrawalRequestByEventCode(selectedEventCode),
    enabled: !!selectedEventCode && showDetailDialog,
    staleTime: 1 * 60 * 1000
  })

  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: (data: bodyCreateWithDrawal) => eventApis.createWithDrawalRequest(data),
    onSuccess: () => {
      toast.success('Tạo yêu cầu rút tiền thành công!')
      queryClient.invalidateQueries({ queryKey: ['endedEvents'] })
      queryClient.invalidateQueries({ queryKey: ['withdrawalDetail'] })
      setShowCreateDialog(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền')
    }
  })

  const onSubmit = (data: WithdrawalRequestFormData) => {
    createWithdrawalMutation.mutate(data)
  }

  const handleCreateWithdrawal = (eventCode: string) => {
    setSelectedEventCode(eventCode)
    form.setValue('eventCode', eventCode)
    setShowCreateDialog(true)
  }

  const handleViewDetail = (eventCode: string) => {
    setSelectedEventCode(eventCode)
    setShowDetailDialog(true)
  }

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      })
    }
  }, [])

  const endedEvents = endedEventsQuery.data?.data || []

  return (
    <div ref={containerRef} className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Xử lý sau sự kiện hoàn thành</h1>
          <p className='text-gray-500 mt-1'>Quản lý yêu cầu rút tiền từ các sự kiện đã kết thúc</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Sự kiện đã kết thúc</p>
                <p className='text-2xl font-bold text-gray-900'>{endedEvents.length}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center'>
                <Wallet className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Yêu cầu đã tạo</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {endedEvents.filter((e: any) => e.hasWithdrawalRequest).length}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Chờ xử lý</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {endedEvents.filter((e: any) => e.withdrawalStatus === 0).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sự kiện đã kết thúc</CardTitle>
          <CardDescription>Các sự kiện đã hoàn thành có thể tạo yêu cầu rút tiền</CardDescription>
        </CardHeader>
        <CardContent>
          {endedEventsQuery.isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : endedEvents.length === 0 ? (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>Bạn chưa có sự kiện nào đã kết thúc</AlertDescription>
            </Alert>
          ) : (
            <div className='space-y-4'>
              {endedEvents.map((event: any) => (
                <Card key={event.eventCode} className='hover:shadow-md transition-shadow'>
                  <CardContent className='pt-6'>
                    <div className='flex flex-col lg:flex-row gap-4'>
                      {/* Event Image */}
                      <div className='w-full lg:w-48 h-32 flex-shrink-0'>
                        <img
                          src={event.logoUrl || event.bannerUrl || '/placeholder-event.png'}
                          alt={event.eventName}
                          className='w-full h-full object-cover rounded-lg'
                        />
                      </div>

                      {/* Event Info */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <h3 className='text-lg font-semibold text-gray-900'>{event.eventName}</h3>
                            <p className='text-sm text-gray-500 mt-1'>Mã sự kiện: {event.eventCode}</p>
                          </div>
                          {event.hasWithdrawalRequest && getStatusBadge(event.withdrawalStatus)}
                        </div>

                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                          <div className='flex items-center gap-2 text-sm'>
                            <Calendar className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-600'>
                              {event.endTimeEventTime
                                ? new Date(event.endTimeEventTime).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <Users className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-600'>{event.totalTicketSold || 0} vé đã bán</span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <DollarSign className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-600 font-semibold'>
                              {(event.totalAmountForTicket || 0).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <Building2 className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-600'>{event.organization?.name || 'N/A'}</span>
                          </div>
                        </div>

                        <div className='flex gap-2 mt-4'>
                          {!event.hasWithdrawalRequest ? (
                            <Button
                              onClick={() => handleCreateWithdrawal(event.eventCode)}
                              className='bg-blue-600 hover:bg-blue-700'
                            >
                              <Wallet className='w-4 h-4 mr-2' />
                              Tạo yêu cầu rút tiền
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleViewDetail(event.eventCode)}
                              variant='outline'
                              className='border-blue-600 text-blue-600 hover:bg-blue-50'
                            >
                              <FileText className='w-4 h-4 mr-2' />
                              Xem chi tiết yêu cầu
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Withdrawal Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu rút tiền</DialogTitle>
            <DialogDescription>Vui lòng điền đầy đủ thông tin để tạo yêu cầu rút tiền từ sự kiện</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email liên hệ <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='example@email.com'
                          {...field}
                          className='pl-10'
                          disabled={createWithdrawalMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số điện thoại <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Phone className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='0123456789'
                          {...field}
                          className='pl-10'
                          disabled={createWithdrawalMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bankName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên ngân hàng <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Building2 className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='Vietcombank, BIDV, Techcombank...'
                          {...field}
                          className='pl-10'
                          disabled={createWithdrawalMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bankAccountNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số tài khoản ngân hàng <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <CreditCard className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='1234567890'
                          {...field}
                          className='pl-10'
                          disabled={createWithdrawalMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className='bg-blue-50 border-blue-200'>
                <AlertCircle className='h-4 w-4 text-blue-600' />
                <AlertDescription className='text-blue-800'>
                  Vui lòng kiểm tra kỹ thông tin ngân hàng trước khi gửi. Yêu cầu rút tiền sẽ được xử lý trong vòng 24
                  giờ.
                </AlertDescription>
              </Alert>

              <div className='flex gap-2 justify-end pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowCreateDialog(false)}
                  disabled={createWithdrawalMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={createWithdrawalMutation.isPending}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  {createWithdrawalMutation.isPending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-4 h-4 mr-2' />
                      Tạo yêu cầu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu rút tiền</DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu rút tiền của bạn</DialogDescription>
          </DialogHeader>

          {withdrawalDetailQuery.isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : withdrawalDetailQuery.data?.data ? (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-xl font-semibold'>{withdrawalDetailQuery.data.data.eventName}</h3>
                  <p className='text-sm text-gray-500'>Mã: {withdrawalDetailQuery.data.data.eventCode}</p>
                </div>
                {getStatusBadge(withdrawalDetailQuery.data.data.status)}
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Người yêu cầu</h4>
                  <p className='text-base font-semibold'>{withdrawalDetailQuery.data.data.fullName}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Email</h4>
                  <p className='text-base'>{withdrawalDetailQuery.data.data.email}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Số điện thoại</h4>
                  <p className='text-base'>{withdrawalDetailQuery.data.data.phoneNumber}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Tổ chức</h4>
                  <p className='text-base'>{withdrawalDetailQuery.data.data.organization?.name || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                <h4 className='font-semibold text-gray-900'>Thông tin ngân hàng</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Ngân hàng</p>
                    <p className='font-medium'>{withdrawalDetailQuery.data.data.bankName}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Số tài khoản</p>
                    <p className='font-medium font-mono'>{withdrawalDetailQuery.data.data.bankAccountNumber}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='bg-blue-50 p-4 rounded-lg space-y-3'>
                <h4 className='font-semibold text-gray-900'>Thông tin tài chính</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Số vé đã bán</p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {withdrawalDetailQuery.data.data.totalTicketSold?.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Tổng tiền</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {withdrawalDetailQuery.data.data.totalAmountForTicket?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </div>

              {withdrawalDetailQuery.data.data.noteByAdmin && (
                <>
                  <Separator />
                  <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-gray-900 mb-2 flex items-center gap-2'>
                      <AlertCircle className='w-5 h-5 text-yellow-600' />
                      Ghi chú từ Admin
                    </h4>
                    <p className='text-sm text-gray-700'>{withdrawalDetailQuery.data.data.noteByAdmin}</p>
                  </div>
                </>
              )}

              {withdrawalDetailQuery.data.data.status === 2 && withdrawalDetailQuery.data.data.reasonReject && (
                <>
                  <Separator />
                  <div className='bg-red-50 border border-red-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-red-900 mb-2 flex items-center gap-2'>
                      <XCircle className='w-5 h-5 text-red-600' />
                      Lý do từ chối
                    </h4>
                    <p className='text-sm text-red-700'>{withdrawalDetailQuery.data.data.reasonReject}</p>
                  </div>
                </>
              )}

              {withdrawalDetailQuery.data.data.linkExcel && (
                <>
                  <Separator />
                  <div className='bg-green-50 border border-green-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-green-900 mb-2 flex items-center gap-2'>
                      <Receipt className='w-5 h-5 text-green-600' />
                      File Excel chi tiết
                    </h4>
                    <a
                      href={withdrawalDetailQuery.data.data.linkExcel}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline flex items-center gap-1'
                    >
                      <FileText className='w-4 h-4' />
                      Tải xuống file Excel
                    </a>
                  </div>
                </>
              )}

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-500'>Ngày tạo</p>
                  <p className='font-medium'>
                    {withdrawalDetailQuery.data.data.timeCreated
                      ? new Date(withdrawalDetailQuery.data.data.timeCreated).toLocaleString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-gray-500'>Ngày phản hồi</p>
                  <p className='font-medium'>
                    {withdrawalDetailQuery.data.data.timeResponse
                      ? new Date(withdrawalDetailQuery.data.data.timeResponse).toLocaleString('vi-VN')
                      : 'Chưa phản hồi'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>Không tìm thấy thông tin yêu cầu rút tiền</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

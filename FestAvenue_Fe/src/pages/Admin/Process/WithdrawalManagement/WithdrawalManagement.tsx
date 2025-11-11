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
  Filter,
  Search,
  RefreshCw,
  FileText,
  Building2,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  Upload,
  Users,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { adminEventApis } from '@/apis/event.api'
import type { bodyAcceptRequestWithDrawal, bodyRejectRequestWithDrawal, WithdrawalRequest } from '@/types/event.types'
import { toast } from 'sonner'

const filterSchema = z.object({
  searchText: z.string().optional(),
  fromDateStartRequest: z.string().optional(),
  toDateStartRequest: z.string().optional(),
  fromDateResolveRequest: z.string().optional(),
  toDateResolveRequest: z.string().optional(),
  withdrawalRequestStatuses: z.array(z.number()).optional(),
  pageSize: z.number().min(1).max(100).optional()
})

const acceptSchema = z.object({
  withdrawalRequestId: z.string().min(1, 'ID yêu cầu không hợp lệ'),
  linkExcel: z
    .string()
    .min(1, 'Link Excel không được để trống')
    .url('Link Excel không hợp lệ')
    .max(500, 'Link không được quá 500 ký tự'),
  noteByAdmin: z
    .string()
    .max(1000, 'Ghi chú không được quá 1000 ký tự')
    .optional()
})

const rejectSchema = z.object({
  withdrawalRequestId: z.string().min(1, 'ID yêu cầu không hợp lệ'),
  reason: z
    .string()
    .min(10, 'Lý do từ chối phải có ít nhất 10 ký tự')
    .max(1000, 'Lý do không được quá 1000 ký tự'),
  envidenceRejectImageUrl: z
    .string()
    .url('Link ảnh không hợp lệ')
    .max(500, 'Link không được quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  noteByAdmin: z
    .string()
    .max(1000, 'Ghi chú không được quá 1000 ký tự')
    .optional()
})

type FilterFormData = z.infer<typeof filterSchema>
type AcceptFormData = z.infer<typeof acceptSchema>
type RejectFormData = z.infer<typeof rejectSchema>

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: '0', label: 'Chờ xử lý' },
  { value: '1', label: 'Đã chấp nhận' },
  { value: '2', label: 'Đã từ chối' }
]

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

export default function WithdrawalManagement() {
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const filterForm = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchText: '',
      fromDateStartRequest: '',
      toDateStartRequest: '',
      fromDateResolveRequest: '',
      toDateResolveRequest: '',
      withdrawalRequestStatuses: [],
      pageSize: 20
    }
  })

  const acceptForm = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      withdrawalRequestId: '',
      linkExcel: '',
      noteByAdmin: ''
    }
  })

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      withdrawalRequestId: '',
      reason: '',
      envidenceRejectImageUrl: '',
      noteByAdmin: ''
    }
  })

  const selectedStatus = filterForm.watch('withdrawalRequestStatuses')

  // Fetch withdrawal requests
  const withdrawalRequestsQuery = useQuery({
    queryKey: ['withdrawalRequests', filterForm.watch(), pageIndex],
    queryFn: () => {
      const formData = filterForm.getValues()
      return adminEventApis.getListWithDrawalRequestWithPagingAndFilter({
        searchText: formData.searchText || undefined,
        fromDateStartRequest: formData.fromDateStartRequest || undefined,
        toDateStartRequest: formData.toDateStartRequest || undefined,
        fromDateResolveRequest: formData.fromDateResolveRequest || undefined,
        toDateResolveRequest: formData.toDateResolveRequest || undefined,
        withdrawalRequestStatuses: selectedStatus && selectedStatus.length > 0 ? selectedStatus : undefined,
        pagination: {
          pageIndex,
          isPaging: true,
          pageSize: formData.pageSize || 20
        }
      })
    },
    staleTime: 1 * 60 * 1000
  })

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (data: bodyAcceptRequestWithDrawal) => adminEventApis.acceptWithDrawalRequestByAdmin(data),
    onSuccess: () => {
      toast.success('Chấp nhận yêu cầu rút tiền thành công!')
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] })
      setShowAcceptDialog(false)
      acceptForm.reset()
      setSelectedRequest(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận yêu cầu')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (data: bodyRejectRequestWithDrawal) => adminEventApis.rejectWithDrawalRequestByAdmin(data),
    onSuccess: () => {
      toast.success('Từ chối yêu cầu rút tiền thành công!')
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] })
      setShowRejectDialog(false)
      rejectForm.reset()
      setSelectedRequest(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu')
    }
  })

  const onAcceptSubmit = (data: AcceptFormData) => {
    acceptMutation.mutate(data)
  }

  const onRejectSubmit = (data: RejectFormData) => {
    rejectMutation.mutate(data)
  }

  const handleViewDetail = (request: WithdrawalRequest) => {
    setSelectedRequest(request)
    setShowDetailDialog(true)
  }

  const handleAccept = (request: WithdrawalRequest) => {
    setSelectedRequest(request)
    acceptForm.setValue('withdrawalRequestId', request.withdrawalRequestId)
    setShowAcceptDialog(true)
  }

  const handleReject = (request: WithdrawalRequest) => {
    setSelectedRequest(request)
    rejectForm.setValue('withdrawalRequestId', request.withdrawalRequestId)
    setShowRejectDialog(true)
  }

  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      filterForm.setValue('withdrawalRequestStatuses', [])
    } else {
      filterForm.setValue('withdrawalRequestStatuses', [parseInt(value)])
    }
    setPageIndex(0)
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

  const requests = withdrawalRequestsQuery.data?.data?.result || []
  const pagination = withdrawalRequestsQuery.data?.data?.pagination
  const totalPages = pagination?.totalPage || 0

  // Calculate stats
  const stats = {
    total: pagination?.total || 0,
    pending: requests.filter((r: WithdrawalRequest) => r.status === 0).length,
    accepted: requests.filter((r: WithdrawalRequest) => r.status === 1).length,
    rejected: requests.filter((r: WithdrawalRequest) => r.status === 2).length
  }

  return (
    <div ref={containerRef} className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Quản lý rút tiền</h1>
          <p className='text-gray-500 mt-1'>Xử lý các yêu cầu rút tiền từ người dùng</p>
        </div>
        <Button
          onClick={() => withdrawalRequestsQuery.refetch()}
          variant='outline'
          size='sm'
          disabled={withdrawalRequestsQuery.isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${withdrawalRequestsQuery.isFetching ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center'>
                <Wallet className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Tổng yêu cầu</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center'>
                <Clock className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Chờ xử lý</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Đã chấp nhận</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-red-50 to-red-100 border-red-200'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center'>
                <XCircle className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Đã từ chối</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={filterForm.control}
                name='searchText'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tìm kiếm</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input placeholder='Tên sự kiện, email, SĐT...' {...field} className='pl-10' />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select
                  value={
                    selectedStatus && selectedStatus.length > 0 ? selectedStatus[0].toString() : 'all'
                  }
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormField
                control={filterForm.control}
                name='fromDateStartRequest'
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
                control={filterForm.control}
                name='toDateStartRequest'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đến ngày tạo</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={filterForm.control}
                name='fromDateResolveRequest'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ ngày xử lý</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={filterForm.control}
                name='toDateResolveRequest'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đến ngày xử lý</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex gap-2 mt-4'>
              <Button
                type='button'
                onClick={() => {
                  filterForm.reset()
                  setPageIndex(0)
                }}
                variant='outline'
              >
                Xóa bộ lọc
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu rút tiền</CardTitle>
          <CardDescription>
            Hiển thị {requests.length} / {stats.total} yêu cầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalRequestsQuery.isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : requests.length === 0 ? (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>Không tìm thấy yêu cầu rút tiền nào</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sự kiện</TableHead>
                      <TableHead>Người yêu cầu</TableHead>
                      <TableHead>Thông tin liên hệ</TableHead>
                      <TableHead className='text-right'>Số tiền</TableHead>
                      <TableHead className='text-center'>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className='text-center'>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request: WithdrawalRequest) => (
                      <TableRow key={request.withdrawalRequestId}>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{request.eventName}</p>
                            <p className='text-xs text-gray-500'>{request.eventCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{request.fullName}</p>
                            <p className='text-xs text-gray-500'>{request.organization?.name || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <p className='text-xs flex items-center gap-1'>
                              <Mail className='w-3 h-3' />
                              {request.email}
                            </p>
                            <p className='text-xs flex items-center gap-1'>
                              <Phone className='w-3 h-3' />
                              {request.phoneNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div>
                            <p className='font-bold text-green-600'>
                              {request.totalAmountForTicket?.toLocaleString('vi-VN')} VNĐ
                            </p>
                            <p className='text-xs text-gray-500'>{request.totalTicketSold} vé</p>
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <p className='text-sm'>
                            {request.timeCreated ? new Date(request.timeCreated).toLocaleDateString('vi-VN') : 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2 justify-center'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleViewDetail(request)}
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                            {request.status === 0 && (
                              <>
                                <Button
                                  size='sm'
                                  onClick={() => handleAccept(request)}
                                  className='bg-green-600 hover:bg-green-700'
                                >
                                  <CheckCircle className='w-4 h-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  onClick={() => handleReject(request)}
                                  className='bg-red-600 hover:bg-red-700'
                                >
                                  <XCircle className='w-4 h-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <p className='text-sm text-gray-500'>
                    Trang {pageIndex + 1} / {totalPages}
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={pageIndex === 0}
                    >
                      <ChevronLeft className='w-4 h-4' />
                      Trước
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Sau
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu rút tiền</DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu rút tiền</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-xl font-semibold'>{selectedRequest.eventName}</h3>
                  <p className='text-sm text-gray-500'>Mã: {selectedRequest.eventCode}</p>
                </div>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Người yêu cầu</h4>
                  <p className='text-base font-semibold'>{selectedRequest.fullName}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Email</h4>
                  <p className='text-base'>{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Số điện thoại</h4>
                  <p className='text-base'>{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-1'>Tổ chức</h4>
                  <p className='text-base'>{selectedRequest.organization?.name || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                <h4 className='font-semibold text-gray-900'>Thông tin ngân hàng</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Ngân hàng</p>
                    <p className='font-medium'>{selectedRequest.bankName}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Số tài khoản</p>
                    <p className='font-medium font-mono'>{selectedRequest.bankAccountNumber}</p>
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
                      {selectedRequest.totalTicketSold?.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Tổng tiền</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {selectedRequest.totalAmountForTicket?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </div>

              {selectedRequest.noteByAdmin && (
                <>
                  <Separator />
                  <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-gray-900 mb-2 flex items-center gap-2'>
                      <AlertCircle className='w-5 h-5 text-yellow-600' />
                      Ghi chú từ Admin
                    </h4>
                    <p className='text-sm text-gray-700'>{selectedRequest.noteByAdmin}</p>
                  </div>
                </>
              )}

              {selectedRequest.status === 2 && selectedRequest.reasonReject && (
                <>
                  <Separator />
                  <div className='bg-red-50 border border-red-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-red-900 mb-2 flex items-center gap-2'>
                      <XCircle className='w-5 h-5 text-red-600' />
                      Lý do từ chối
                    </h4>
                    <p className='text-sm text-red-700'>{selectedRequest.reasonReject}</p>
                  </div>
                </>
              )}

              {selectedRequest.linkExcel && (
                <>
                  <Separator />
                  <div className='bg-green-50 border border-green-200 p-4 rounded-lg'>
                    <h4 className='font-semibold text-green-900 mb-2 flex items-center gap-2'>
                      <FileText className='w-5 h-5 text-green-600' />
                      File Excel chi tiết
                    </h4>
                    <a
                      href={selectedRequest.linkExcel}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chấp nhận yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp link Excel chi tiết và ghi chú (nếu có)
            </DialogDescription>
          </DialogHeader>

          <Form {...acceptForm}>
            <form onSubmit={acceptForm.handleSubmit(onAcceptSubmit)} className='space-y-4'>
              <FormField
                control={acceptForm.control}
                name='linkExcel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Link Excel <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Upload className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='https://example.com/excel-file.xlsx'
                          {...field}
                          className='pl-10'
                          disabled={acceptMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={acceptForm.control}
                name='noteByAdmin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Ghi chú thêm cho yêu cầu rút tiền...'
                        {...field}
                        rows={4}
                        disabled={acceptMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className='bg-green-50 border-green-200'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <AlertDescription className='text-green-800'>
                  Sau khi chấp nhận, người dùng sẽ nhận được thông báo và có thể tải file Excel chi tiết.
                </AlertDescription>
              </Alert>

              <div className='flex gap-2 justify-end pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowAcceptDialog(false)}
                  disabled={acceptMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={acceptMutation.isPending}
                  className='bg-green-600 hover:bg-green-700'
                >
                  {acceptMutation.isPending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-4 h-4 mr-2' />
                      Chấp nhận
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do từ chối rõ ràng
            </DialogDescription>
          </DialogHeader>

          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className='space-y-4'>
              <FormField
                control={rejectForm.control}
                name='reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lý do từ chối <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Vui lòng mô tả lý do từ chối yêu cầu rút tiền...'
                        {...field}
                        rows={4}
                        disabled={rejectMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rejectForm.control}
                name='envidenceRejectImageUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link ảnh minh chứng (nếu có)</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Upload className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='https://example.com/evidence.png'
                          {...field}
                          className='pl-10'
                          disabled={rejectMutation.isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rejectForm.control}
                name='noteByAdmin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Ghi chú thêm...'
                        {...field}
                        rows={3}
                        disabled={rejectMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className='bg-red-50 border-red-200'>
                <XCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>
                  Sau khi từ chối, người dùng sẽ nhận được thông báo kèm lý do từ chối.
                </AlertDescription>
              </Alert>

              <div className='flex gap-2 justify-end pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowRejectDialog(false)}
                  disabled={rejectMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={rejectMutation.isPending}
                  className='bg-red-600 hover:bg-red-700'
                >
                  {rejectMutation.isPending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <XCircle className='w-4 h-4 mr-2' />
                      Từ chối
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

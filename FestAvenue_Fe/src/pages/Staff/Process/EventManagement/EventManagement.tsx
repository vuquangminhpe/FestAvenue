import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { staffEventApis } from '@/apis/event.api'
import { EventStatusValues } from '@/types/event.types'
import type { EventSearchFilter, EventTemp } from '@/types/event.types'
import { Search, Calendar, MapPin, Users, Eye, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { Helmet } from 'react-helmet-async'

export default function StaffEventManagement() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('pending')
  const [selectedEvent, setSelectedEvent] = useState<EventTemp | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approveMessage, setApproveMessage] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')

  const getStatusFilter = (tab: string) => {
    switch (tab) {
      case 'pending':
        return EventStatusValues.Draft
      case 'approved':
        return EventStatusValues.ContinueSetup
      default:
        return 0
    }
  }

  const searchFilter: EventSearchFilter = {
    search: searchQuery,
    categoryId: undefined,
    statuses: getStatusFilter(activeTab) as any,
    pagination: {
      orderBy: 'createdAt',
      pageIndex: 1,
      isPaging: true,
      pageSize: 50
    }
  }

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['staffEvents', searchQuery, activeTab],
    queryFn: () => staffEventApis.getEventTempWithFilterPagingForStaff(searchFilter)
  })

  const approveMutation = useMutation({
    mutationFn: (data: { eventTempId: string; message: string }) => staffEventApis.approveEventForStaff(data),
    onSuccess: () => {
      toast.success('Đã phê duyệt sự kiện thành công')
      queryClient.invalidateQueries({ queryKey: ['staffEvents'] })
      setShowApproveDialog(false)
      setSelectedEvent(null)
      setApproveMessage('')
    },
    onError: () => {
      toast.error('Lỗi khi phê duyệt sự kiện')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (data: { eventTempId: string; message: string }) => staffEventApis.rejectEventForStaff(data),
    onSuccess: () => {
      toast.success('Đã từ chối sự kiện')
      queryClient.invalidateQueries({ queryKey: ['staffEvents'] })
      setShowRejectDialog(false)
      setSelectedEvent(null)
      setRejectMessage('')
    },
    onError: () => {
      toast.error('Lỗi khi từ chối sự kiện')
    }
  })

  const events = eventsData?.data || []
  const totalEvents = eventsData?.pagination?.total || 0

  const handleApprove = () => {
    if (!selectedEvent) return
    if (!approveMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn phản hồi')
      return
    }

    approveMutation.mutate({
      eventTempId: selectedEvent.id,
      message: approveMessage
    })
  }

  const handleReject = () => {
    if (!selectedEvent) return
    if (!rejectMessage.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }

    rejectMutation.mutate({
      eventTempId: selectedEvent.id,
      message: rejectMessage
    })
  }

  const renderEventCard = (eventTemp: EventTemp) => {
    const eventData = eventTemp.eventData

    return (
      <Card key={eventTemp.id} className='p-6 hover:shadow-lg transition-shadow duration-300'>
        <div className='flex gap-6'>
          {/* Event Image */}
          <div className='w-48 h-32 flex-shrink-0'>
            {eventData.bannerUrl ? (
              <img src={eventData.bannerUrl} alt={eventData.name} className='w-full h-full object-cover rounded-lg' />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center'>
                <Calendar className='w-12 h-12 text-slate-400' />
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className='flex-1'>
            <div className='flex items-start justify-between mb-3'>
              <div className='flex-1'>
                <h3 className='text-xl font-bold text-slate-800 mb-1'>{eventData.name}</h3>
                <p className='text-sm text-slate-600 line-clamp-2'>{eventData.shortDescription}</p>
              </div>
              <Badge
                className={`${
                  eventTemp.eventTempStatus === EventStatusValues.Draft
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-green-100 text-green-700 border-green-300'
                } border ml-4`}
              >
                {eventTemp.eventTempStatus === EventStatusValues.Draft ? 'Chờ duyệt' : 'Đã duyệt'}
              </Badge>
            </div>

            <div className='grid grid-cols-3 gap-4 mb-4'>
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <Calendar className='w-4 h-4' />
                <span>
                  {eventData.startDate
                    ? format(new Date(eventData.startDate), 'dd MMM yyyy', { locale: vi })
                    : 'Chưa có'}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <MapPin className='w-4 h-4' />
                <span className='truncate'>{eventData.location?.address?.city || 'Chưa có'}</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <Users className='w-4 h-4' />
                <span>{eventData.capacity} người</span>
              </div>
            </div>

            {/* Organization Info */}
            <div className='mb-4 p-3 bg-slate-50 rounded-lg'>
              <p className='text-xs text-slate-500 mb-1'>Tổ chức:</p>
              <p className='text-sm font-medium text-slate-700'>{eventData.organization?.name}</p>
            </div>

            {/* Actions - Only show for pending events */}
            {eventTemp.eventTempStatus === EventStatusValues.Draft && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setSelectedEvent(eventTemp)
                    // Show detail dialog here if needed
                  }}
                >
                  <Eye className='w-4 h-4 mr-1' />
                  Xem chi tiết
                </Button>
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700 text-white'
                  onClick={() => {
                    setSelectedEvent(eventTemp)
                    setShowApproveDialog(true)
                  }}
                >
                  <CheckCircle2 className='w-4 h-4 mr-1' />
                  Phê duyệt
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => {
                    setSelectedEvent(eventTemp)
                    setShowRejectDialog(true)
                  }}
                >
                  <XCircle className='w-4 h-4 mr-1' />
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className='w-full'>
      <Helmet>
        <title>Quản lý sự kiện - Staff Panel</title>
      </Helmet>

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-slate-800'>Quản lý sự kiện</h1>
            <p className='text-slate-600 mt-1'>Xét duyệt và quản lý các sự kiện từ người dùng</p>
          </div>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
          <Input
            placeholder='Tìm kiếm sự kiện...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3 mb-6'>
          <TabsTrigger value='all'>Tất cả ({totalEvents})</TabsTrigger>
          <TabsTrigger value='pending'>
            <AlertTriangle className='w-4 h-4 mr-2' />
            Chờ duyệt
          </TabsTrigger>
          <TabsTrigger value='approved'>
            <CheckCircle2 className='w-4 h-4 mr-2' />
            Đã duyệt
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
            </div>
          ) : events?.length === 0 ? (
            <Card className='p-12 text-center'>
              <Calendar className='w-16 h-16 text-slate-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-slate-700 mb-2'>Không có sự kiện nào</h3>
              <p className='text-slate-500'>Chưa có sự kiện cần xét duyệt</p>
            </Card>
          ) : (
            <div className='space-y-4'>{events.map((eventTemp) => renderEventCard(eventTemp))}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phê duyệt sự kiện</DialogTitle>
            <DialogDescription>Gửi tin nhắn phản hồi cho người tạo sự kiện</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold text-slate-800 mb-2'>Sự kiện: {selectedEvent?.eventData?.name}</p>
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700 mb-2 block'>Tin nhắn phản hồi</label>
              <Textarea
                placeholder='Nhập tin nhắn cho người tạo sự kiện...'
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
                rows={4}
                className='resize-none'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowApproveDialog(false)} disabled={approveMutation.isPending}>
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending || !approveMessage.trim()}
              className='bg-green-600 hover:bg-green-700'
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  Phê duyệt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối sự kiện</DialogTitle>
            <DialogDescription>Vui lòng cho biết lý do từ chối sự kiện này</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold text-slate-800 mb-2'>Sự kiện: {selectedEvent?.eventData?.name}</p>
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700 mb-2 block'>Lý do từ chối</label>
              <Textarea
                placeholder='Nhập lý do từ chối sự kiện...'
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                rows={4}
                className='resize-none'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowRejectDialog(false)} disabled={rejectMutation.isPending}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectMessage.trim()}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className='w-4 h-4 mr-2' />
                  Từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

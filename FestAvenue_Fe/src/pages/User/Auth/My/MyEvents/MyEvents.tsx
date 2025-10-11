import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventApis } from '@/apis/event.api'
import { EventStatusValues } from '@/types/event.types'
import type { EventSearchFilter, EventStatusValue, EventTemp } from '@/types/event.types'
import { Plus, Search, Calendar, MapPin, Users, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import path from '@/constants/path'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'

const statusConfig = {
  [EventStatusValues.Draft]: {
    label: 'Bản nháp',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: AlertCircle,
    description: 'Chờ gửi duyệt'
  },
  [EventStatusValues.ContinueSetup]: {
    label: 'Tiếp tục thiết lập',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Clock,
    description: 'Đã được chấp nhận, chờ chọn gói'
  },
  [EventStatusValues.Active]: {
    label: 'Đang hoạt động',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2,
    description: 'Sự kiện đang hoạt động'
  },
  [EventStatusValues.Pending]: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: Clock,
    description: 'Đang chờ staff xét duyệt'
  },
  [EventStatusValues.Canceled]: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    description: 'Sự kiện đã bị hủy'
  }
}

export default function MyEvents() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')

  const getStatusFilter = (tab: string): EventStatusValue | undefined => {
    switch (tab) {
      case 'draft':
        return EventStatusValues.Draft
      case 'pending':
        return EventStatusValues.Pending
      case 'approved':
        return EventStatusValues.ContinueSetup
      case 'active':
        return EventStatusValues.Active
      default:
        return undefined
    }
  }

  const statusFilter = getStatusFilter(activeTab)
  const searchFilter: EventSearchFilter = {
    search: searchQuery,
    categoryId: undefined,
    ...(statusFilter !== undefined && { statuses: statusFilter }),
    pagination: {
      orderBy: 'createdAt',
      pageIndex: 1,
      isPaging: true,
      pageSize: 20
    }
  } as any

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['myEvents', searchQuery, activeTab],
    queryFn: () => eventApis.getEventTempWithFilterPagingForEventOwner(searchFilter)
  })

  const events = eventsData?.data || []
  const totalEvents = eventsData?.pagination?.total || 0

  const renderEventCard = (eventTemp: EventTemp) => {
    const status = statusConfig[eventTemp.eventTempStatus as keyof typeof statusConfig]
    const StatusIcon = status?.icon || AlertCircle
    const eventData = eventTemp.eventData

    return (
      <Card key={eventTemp.id} className='p-6 hover:shadow-lg transition-shadow duration-300 border border-slate-200'>
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
              <div>
                <h3 className='text-xl font-bold text-slate-800 mb-1'>{eventData.name}</h3>
                <p className='text-sm text-slate-600 line-clamp-2'>{eventData.shortDescription}</p>
              </div>
              <Badge className={`${status?.color} border flex items-center gap-1 px-3 py-1`}>
                <StatusIcon className='w-3 h-3' />
                {status?.label}
              </Badge>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
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
                <span className='truncate'>{eventData.location?.address?.city || 'Chưa có địa điểm'}</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <Users className='w-4 h-4' />
                <span>{eventData.capacity} người</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <Clock className='w-4 h-4' />
                <span>Tạo: {format(new Date(eventTemp.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
            </div>

            {/* Message Response */}
            {eventTemp.messageResponse && (
              <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Phản hồi từ staff:</strong> {eventTemp.messageResponse}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => navigate(`${path.user.event.root}/${eventTemp.eventId}`)}
              >
                Xem chi tiết
              </Button>
              {eventTemp.eventTempStatus === EventStatusValues.Draft && (
                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={() => navigate(`${path.user.event.create_event}?eventId=${eventTemp.id}`)}
                >
                  Tiếp tục chỉnh sửa
                </Button>
              )}
              {eventTemp.eventTempStatus === EventStatusValues.ContinueSetup && (
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => navigate(`${path.user.payment.payment_event}?eventId=${eventTemp.eventId}`)}
                >
                  Chọn gói sự kiện
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <Helmet>
        <title>Sự kiện của tôi - FestAvenue</title>
      </Helmet>

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-slate-800'>Sự kiện của tôi</h1>
            <p className='text-slate-600 mt-1'>Quản lý và theo dõi các sự kiện bạn đã tạo</p>
          </div>
          <Button
            onClick={() => navigate(path.user.event.create_event)}
            className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white'
          >
            <Plus className='w-4 h-4 mr-2' />
            Tạo sự kiện mới
          </Button>
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
        <TabsList className='grid w-full grid-cols-5 mb-6'>
          <TabsTrigger value='all'>Tất cả ({totalEvents})</TabsTrigger>
          <TabsTrigger value='draft'>Bản nháp</TabsTrigger>
          <TabsTrigger value='pending'>Chờ duyệt</TabsTrigger>
          <TabsTrigger value='approved'>Đã duyệt</TabsTrigger>
          <TabsTrigger value='active'>Đang hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
            </div>
          ) : events.length === 0 ? (
            <Card className='p-12 text-center'>
              <Calendar className='w-16 h-16 text-slate-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-slate-700 mb-2'>Chưa có sự kiện nào</h3>
              <p className='text-slate-500 mb-4'>Bắt đầu tạo sự kiện đầu tiên của bạn</p>
              <Button
                onClick={() => navigate(path.user.event.create_event)}
                className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400'
              >
                <Plus className='w-4 h-4 mr-2' />
                Tạo sự kiện mới
              </Button>
            </Card>
          ) : (
            <div className='space-y-4'>{events.map((eventTemp) => renderEventCard(eventTemp))}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

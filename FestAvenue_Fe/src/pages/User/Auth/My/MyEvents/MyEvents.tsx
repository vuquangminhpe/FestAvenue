import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventApis } from '@/apis/event.api'
import { EventStatusValues } from '@/types/event.types'
import type { EventSearchFilter, EventStatusValue, createEvent } from '@/types/event.types'
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Edit
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import path from '@/constants/path'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { generateNameId } from '@/utils/utils'

const statusConfig = {
  [EventStatusValues.Draft]: {
    label: 'Bản nháp',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: AlertCircle,
    description: 'Chờ gửi duyệt'
  },
  [EventStatusValues.Pending]: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: Clock,
    description: 'Đang chờ staff xét duyệt'
  },
  [EventStatusValues.SelectPackage]: {
    label: 'Chọn gói',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: CheckCircle2,
    description: 'Sự kiện đã được chấp nhận, chờ chọn gói'
  },
  [EventStatusValues.Active]: {
    label: 'Đang hoạt động',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2,
    description: 'Sự kiện đang hoạt động'
  },
  [EventStatusValues.Reject]: {
    label: 'Đã từ chối',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    description: 'Sự kiện bị staff từ chối'
  },
  [EventStatusValues.Canceled]: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: XCircle,
    description: 'Sự kiện đã bị hủy bỏ'
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
      case 'selectPackage':
        return EventStatusValues.SelectPackage
      case 'active':
        return EventStatusValues.Active
      case 'rejected':
        return EventStatusValues.Reject
      case 'canceled':
        return EventStatusValues.Canceled
      default:
        return undefined
    }
  }

  const statusFilter = getStatusFilter(activeTab)
  const searchFilter: EventSearchFilter = {
    search: searchQuery?.length > 0 ? searchQuery : undefined,
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
    queryFn: () => eventApis.getEventWithFilterPaging(searchFilter)
  })

  const events = (eventsData?.data as any)?.result || []

  const totalEvents = (eventsData?.data as any)?.data?.pagination?.total || 0

  const renderTableRow = (eventData: createEvent & { id?: string; createdAt?: string }) => {
    const status = statusConfig[eventData.status as keyof typeof statusConfig]
    const StatusIcon = status?.icon || AlertCircle

    return (
      <TableRow key={eventData.id} className='hover:bg-slate-50'>
        {/* Event Image & Name */}
        <TableCell className='font-medium'>
          <div className='flex items-center gap-3'>
            <div className='w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden'>
              {eventData.bannerUrl ? (
                <img src={eventData.bannerUrl} alt={eventData.name} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
                  <Calendar className='w-6 h-6 text-slate-400' />
                </div>
              )}
            </div>
            <div className='min-w-0'>
              <p className='font-semibold text-slate-800 truncate'>{eventData.name}</p>
              <p className='text-sm text-slate-600 truncate'>{eventData.shortDescription}</p>
            </div>
          </div>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Badge className={`${status?.color} border flex items-center gap-1 px-3 py-1 w-fit`}>
            <StatusIcon className='w-3 h-3' />
            {status?.label}
          </Badge>
        </TableCell>

        {/* Start Date */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Calendar className='w-4 h-4' />
            <span>
              {eventData.startDate ? format(new Date(eventData.startDate), 'dd MMM yyyy', { locale: vi }) : 'Chưa có'}
            </span>
          </div>
        </TableCell>

        {/* Location */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <MapPin className='w-4 h-4' />
            <span className='truncate'>{eventData.location?.address?.city || 'Chưa có địa điểm'}</span>
          </div>
        </TableCell>

        {/* Capacity */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Users className='w-4 h-4' />
            <span>{eventData.capacity}</span>
          </div>
        </TableCell>

        {/* Created Date */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Clock className='w-4 h-4' />
            <span>
              {eventData.createdAt ? format(new Date(eventData.createdAt), 'dd/MM/yyyy', { locale: vi }) : '-'}
            </span>
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                navigate(
                  `${path.user.event.root}/${generateNameId({
                    id: eventData?.id as string,
                    name: `${eventData?.organization.name}_${eventData?.name}`
                  })}`
                )
              }
            >
              <Eye className='w-4 h-4' />
            </Button>
            {eventData.status === EventStatusValues.Draft && (
              <Button
                size='sm'
                variant='outline'
                className='bg-blue-50 hover:bg-blue-100'
                onClick={() => navigate(`${path.user.event.create_event}?eventId=${eventData.id}`)}
              >
                <Edit className='w-4 h-4' />
              </Button>
            )}
            {eventData.status === EventStatusValues.SelectPackage && (
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700'
                onClick={() => navigate(`${path.user.payment.payment_event}?eventId=${eventData.id}`)}
              >
                Chọn gói
              </Button>
            )}
            {eventData.status === EventStatusValues.Active && (
              <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() =>
                  navigate(
                    `${path.user.event_owner.user_management}?${generateNameId({
                      id: eventData.id as string,
                      name: `${eventData.organization}-${eventData.name}`
                    })}`
                  )
                }
              >
                Quản lí
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
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
        <TabsList className='grid w-full grid-cols-7 mb-6'>
          <TabsTrigger value='all'>Tất cả ({totalEvents})</TabsTrigger>
          <TabsTrigger value='draft'>Bản nháp</TabsTrigger>
          <TabsTrigger value='pending'>Chờ duyệt</TabsTrigger>
          <TabsTrigger value='selectPackage'>Chọn gói</TabsTrigger>
          <TabsTrigger value='active'>Đang hoạt động</TabsTrigger>
          <TabsTrigger value='rejected'>Đã từ chối</TabsTrigger>
          <TabsTrigger value='canceled'>Đã hủy</TabsTrigger>
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
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[350px]'>Sự kiện</TableHead>
                    <TableHead className='w-[150px]'>Trạng thái</TableHead>
                    <TableHead className='w-[150px]'>Ngày bắt đầu</TableHead>
                    <TableHead className='w-[150px]'>Địa điểm</TableHead>
                    <TableHead className='w-[100px]'>Sức chứa</TableHead>
                    <TableHead className='w-[120px]'>Ngày tạo</TableHead>
                    <TableHead className='w-[180px]'>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{events?.map((eventTemp: any) => renderTableRow(eventTemp))}</TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

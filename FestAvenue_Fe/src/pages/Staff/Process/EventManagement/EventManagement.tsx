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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { staffEventApis, type sendApproveEventWithOrg } from '@/apis/event.api'
import { EventTempStatusValues } from '@/types/event.types'
import type { EventSearchStaffFilter } from '@/types/event.types'
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { Helmet } from 'react-helmet-async'
import LeafletMap from '@/components/custom/MapLeaflet/MapLeadflet'

export default function StaffEventManagement() {
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('pending')
  const [selectedEvent, setSelectedEvent] = useState<sendApproveEventWithOrg | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approveMessage, setApproveMessage] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')

  const getStatusFilter = (tab: string): number[] => {
    switch (tab) {
      case 'pending':
        return [EventTempStatusValues.Draft]
      case 'approved':
        return [EventTempStatusValues.ContinueSetup]
      case 'all':
        return [] // Trả về mảng rỗng cho tất cả
      default:
        return []
    }
  }

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['staffEvents', searchQuery, activeTab],
    queryFn: () => {
      const searchFilter: EventSearchStaffFilter = {
        search: searchQuery,
        categoryId: undefined,
        eventStatuses: getStatusFilter(activeTab) as any,
        pagination: {
          orderBy: 'createdAt',
          pageIndex: 1,
          isPaging: true,
          pageSize: 50
        }
      }
      return staffEventApis.getEventTempWithFilterPagingForStaff(searchFilter)
    }
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

  const events = (eventsData?.data as any)?.result || []
  const totalEvents = (eventsData?.data as any)?.pagination?.total || 0

  const handleApprove = () => {
    if (!selectedEvent) return
    if (!approveMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn phản hồi')
      return
    }

    approveMutation.mutate({
      eventTempId: (selectedEvent as any).id,
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
      eventTempId: (selectedEvent as any).id,
      message: rejectMessage
    })
  }

  const parseEventData = (eventTemp: sendApproveEventWithOrg) => {
    // Parse eventData if it's a JSON string
    let eventData
    try {
      eventData =
        typeof (eventTemp as any).eventData === 'string'
          ? JSON.parse((eventTemp as any).eventData)
          : (eventTemp as any).eventData
    } catch (error) {
      console.error('Error parsing eventData:', error)
      eventData = {}
    }

    // Map the parsed data to proper structure
    return {
      id: eventData.Id || '',
      name: eventData.Name || '',
      description: eventData.Description || '',
      shortDescription: eventData.ShortDescription || '',
      eventType: eventData.EventType || 0,
      categoryId: eventData.CategoryId || '',
      status: eventData.Status || 0,
      visibility: eventData.Visibility || 0,
      capacity: eventData.Capacity || 0,
      startDate: eventData.StartDate || '',
      endDate: eventData.EndDate || '',
      registrationStartDate: eventData.RegistrationStartDate || '',
      registrationEndDate: eventData.RegistrationEndDate || '',
      logoUrl: eventData.LogoUrl || '',
      bannerUrl: eventData.BannerUrl || '',
      trailerUrl: eventData.TrailerUrl || '',
      website: eventData.Website || '',
      publicContactEmail: eventData.PublicContactEmail || '',
      publicContactPhone: eventData.PublicContactPhone || '',
      location: {
        address: {
          street: eventData.Location?.Address?.Street || '',
          city: eventData.Location?.Address?.City || '',
          state: eventData.Location?.Address?.State || '',
          postalCode: eventData.Location?.Address?.PostalCode || '',
          country: eventData.Location?.Address?.Country || ''
        },
        coordinates: {
          latitude: eventData.Location?.Coordinates?.Latitude || 0,
          longitude: eventData.Location?.Coordinates?.Longitude || 0
        }
      },
      hashtags: eventData.Hashtags || [],
      createBy: eventData.CreateBy || '',
      organization: eventData.organization
    }
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
            <div className='border rounded-lg overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50'>
                    <TableHead className='w-20'>Banner</TableHead>
                    <TableHead className='min-w-[200px]'>Tên sự kiện</TableHead>
                    <TableHead>Tổ chức</TableHead>
                    <TableHead className='w-40'>Email liên hệ</TableHead>
                    <TableHead className='w-32'>Ngày bắt đầu</TableHead>
                    <TableHead className='w-32'>Địa điểm</TableHead>
                    <TableHead className='w-24'>Sức chứa</TableHead>
                    <TableHead className='w-28'>Trạng thái</TableHead>
                    <TableHead className='w-48 text-center'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((eventTemp: any) => {
                    const mappedEventData = parseEventData(eventTemp)
                    const eventStatus = eventTemp.eventTempStatus ?? eventTemp.status

                    return (
                      <TableRow key={eventTemp.eventId} className='hover:bg-slate-50'>
                        {/* Banner */}
                        <TableCell>
                          {mappedEventData.bannerUrl ? (
                            <img
                              src={mappedEventData.bannerUrl}
                              alt={mappedEventData.name}
                              className='w-16 h-12 object-cover rounded'
                            />
                          ) : (
                            <div className='w-16 h-12 bg-slate-200 rounded flex items-center justify-center'>
                              <Calendar className='w-6 h-6 text-slate-400' />
                            </div>
                          )}
                        </TableCell>

                        {/* Event Name */}
                        <TableCell>
                          <div>
                            <p className='font-semibold text-slate-800'>{mappedEventData.name}</p>
                            <p className='text-sm text-slate-500 line-clamp-1'>{mappedEventData.shortDescription}</p>
                          </div>
                        </TableCell>

                        {/* Organization */}
                        <TableCell>
                          <p className='text-sm text-slate-700'>
                            {mappedEventData?.organization?.name || 'Chưa có thông tin'}
                          </p>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <p className='text-sm text-slate-600 truncate'>
                            {mappedEventData.publicContactEmail || 'Chưa có'}
                          </p>
                        </TableCell>

                        {/* Start Date */}
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-slate-600'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {mappedEventData.startDate
                                ? format(new Date(mappedEventData.startDate), 'dd/MM/yyyy', { locale: vi })
                                : 'Chưa có'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-slate-600'>
                            <MapPin className='w-4 h-4 flex-shrink-0' />
                            <span className='truncate'>{mappedEventData.location?.address?.city || 'Chưa có'}</span>
                          </div>
                        </TableCell>

                        {/* Capacity */}
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-slate-600'>
                            <Users className='w-4 h-4' />
                            <span>{mappedEventData.capacity}</span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            className={`${
                              eventStatus === EventTempStatusValues.Draft
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                : 'bg-green-100 text-green-700 border-green-300'
                            } border`}
                          >
                            {eventStatus === EventTempStatusValues.Draft ? 'Chờ duyệt' : 'Đã duyệt'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className='flex gap-1 justify-center'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                setSelectedEvent(eventTemp)
                                setShowDetailDialog(true)
                              }}
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                            {eventStatus === EventTempStatusValues.Draft && (
                              <>
                                <Button
                                  size='sm'
                                  className='bg-green-600 hover:bg-green-700 text-white'
                                  onClick={() => {
                                    setSelectedEvent(eventTemp)
                                    setShowApproveDialog(true)
                                  }}
                                >
                                  <CheckCircle2 className='w-4 h-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='destructive'
                                  onClick={() => {
                                    setSelectedEvent(eventTemp)
                                    setShowRejectDialog(true)
                                  }}
                                >
                                  <XCircle className='w-4 h-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className='w-[90vw] !max-w-[750px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Xem chi tiết sự kiện</DialogTitle>
            <DialogDescription>Thông tin chi tiết về sự kiện</DialogDescription>
          </DialogHeader>

          {selectedEvent &&
            (() => {
              const mappedEventData = parseEventData(selectedEvent)
              const eventStatus = (selectedEvent as any).eventTempStatus ?? (selectedEvent as any).status
              return (
                <div className='space-y-6'>
                  {/* Banner Image */}
                  {mappedEventData.bannerUrl && (
                    <div className='w-full h-48 rounded-lg overflow-hidden'>
                      <img
                        src={mappedEventData.bannerUrl}
                        alt={mappedEventData.name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-slate-500'>Tên sự kiện</label>
                      <p className='text-base font-semibold text-slate-800'>{mappedEventData.name}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-slate-500'>Tổ chức</label>
                      <p className='text-base text-slate-800'>{mappedEventData.organization?.name || 'Chưa có'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className='text-sm font-medium text-slate-500'>Mô tả ngắn</label>
                    <p className='text-base text-slate-800'>{mappedEventData.shortDescription}</p>
                  </div>

                  {/* Contact Info */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center gap-2'>
                      <Mail className='w-4 h-4 text-slate-400' />
                      <div className='flex-1'>
                        <label className='text-sm font-medium text-slate-500'>Email liên hệ</label>
                        <p className='text-base text-slate-800'>{mappedEventData.publicContactEmail || 'Chưa có'}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-slate-400' />
                      <div className='flex-1'>
                        <label className='text-sm font-medium text-slate-500'>Số điện thoại</label>
                        <p className='text-base text-slate-800'>{mappedEventData.publicContactPhone || 'Chưa có'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-slate-400' />
                      <div>
                        <label className='text-sm font-medium text-slate-500'>Ngày bắt đầu</label>
                        <p className='text-base text-slate-800'>
                          {mappedEventData.startDate
                            ? format(new Date(mappedEventData.startDate), 'dd/MM/yyyy', { locale: vi })
                            : 'Chưa có'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-slate-400' />
                      <div>
                        <label className='text-sm font-medium text-slate-500'>Địa điểm</label>
                        <p className='text-base text-slate-800'>
                          {mappedEventData.location?.address?.city || 'Chưa có'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-slate-400' />
                      <div>
                        <label className='text-sm font-medium text-slate-500'>Sức chứa</label>
                        <p className='text-base text-slate-800'>{mappedEventData.capacity} người</p>
                      </div>
                    </div>
                  </div>

                  {/* Full Address */}
                  {mappedEventData.location?.address && (
                    <div>
                      <label className='text-sm font-medium text-slate-500'>Địa chỉ đầy đủ</label>
                      <p className='text-base text-slate-800'>
                        {[
                          mappedEventData.location.address.street,
                          mappedEventData.location.address.city,
                          mappedEventData.location.address.state,
                          mappedEventData.location.address.country
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Chưa có'}
                      </p>
                    </div>
                  )}

                  {/* Website */}
                  {mappedEventData.website && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4 text-slate-400' />
                      <div className='flex-1'>
                        <label className='text-sm font-medium text-slate-500'>Website</label>
                        <a
                          href={mappedEventData.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-blue-600 hover:underline'
                        >
                          {mappedEventData.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {mappedEventData.location?.coordinates?.latitude &&
                    mappedEventData.location?.coordinates?.longitude && (
                      <div>
                        <label className='text-sm font-medium text-slate-500 mb-2 block'>Bản đồ</label>
                        <LeafletMap
                          center={{
                            lat: mappedEventData.location.coordinates.latitude,
                            lng: mappedEventData.location.coordinates.longitude
                          }}
                          zoom={15}
                          markerPosition={{
                            lat: mappedEventData.location.coordinates.latitude,
                            lng: mappedEventData.location.coordinates.longitude
                          }}
                        />
                      </div>
                    )}

                  {/* Status */}
                  <div>
                    <label className='text-sm font-medium text-slate-500 mb-2 block'>Trạng thái</label>
                    <Badge
                      className={`${
                        eventStatus === EventTempStatusValues.Draft
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-green-100 text-green-700 border-green-300'
                      } border`}
                    >
                      {eventStatus === EventTempStatusValues.Draft ? 'Chờ duyệt' : 'Đã duyệt'}
                    </Badge>
                  </div>
                </div>
              )
            })()}

          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {(() => {
              const eventStatus = (selectedEvent as any)?.eventTempStatus ?? (selectedEvent as any)?.status
              return (
                eventStatus === EventTempStatusValues.Draft && (
                  <>
                    <Button
                      className='bg-green-600 hover:bg-green-700 text-white'
                      onClick={() => {
                        setShowDetailDialog(false)
                        setShowApproveDialog(true)
                      }}
                    >
                      <CheckCircle2 className='w-4 h-4 mr-2' />
                      Phê duyệt
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => {
                        setShowDetailDialog(false)
                        setShowRejectDialog(true)
                      }}
                    >
                      <XCircle className='w-4 h-4 mr-2' />
                      Từ chối
                    </Button>
                  </>
                )
              )
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phê duyệt sự kiện</DialogTitle>
            <DialogDescription>Gửi tin nhắn phản hồi cho người tạo sự kiện</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold text-slate-800 mb-2'>Sự kiện: {parseEventData(selectedEvent as any)?.name}</p>
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
              <p className='font-semibold text-slate-800 mb-2'>Sự kiện: {parseEventData(selectedEvent as any)?.name}</p>
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

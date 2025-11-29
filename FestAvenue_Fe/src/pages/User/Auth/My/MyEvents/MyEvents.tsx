import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventApis } from '@/apis/event.api'
import mediaApis from '@/apis/media.api'
import { EventStatusValues } from '@/types/event.types'
import type { EventSearchFilter, ReqFilterOwnerEvent } from '@/types/event.types'
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
  Edit,
  ExternalLink,
  Upload,
  FileText
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import path from '@/constants/path'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { generateNameId } from '@/utils/utils'
import InvitationsTable from './components/InvitationsTable'
import PDFViewer from '@/components/PDFViewer/PDFViewer'

const statusConfig = {
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
  },
  [EventStatusValues.PendingContract]: {
    label: 'Chờ xử lý hợp đồng',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Clock,
    description: 'Cần upload hợp đồng để staff xét duyệt'
  },
  [EventStatusValues.RejectedContract]: {
    label: 'Hợp đồng bị từ chối',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertCircle,
    description: 'Hợp đồng bị từ chối, cần upload lại'
  }
}

export default function MyEvents() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('myEvents')
  const [showContractUploadDialog, setShowContractUploadDialog] = useState(false)
  const [selectedEventForContract, setSelectedEventForContract] = useState<ReqFilterOwnerEvent | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [showViewContractDialog, setShowViewContractDialog] = useState(false)
  const [contractUrl, setContractUrl] = useState<string>('')

  const searchFilter: EventSearchFilter = {
    pagination: {
      pageIndex: 1,
      isPaging: true,
      pageSize: 20
    }
  } as any

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['myEvents'],
    queryFn: () => eventApis.getEventWithFilterPaging(searchFilter)
  })

  const events = eventsData?.result || []

  // Contract upload mutation
  const uploadContractMutation = useMutation({
    mutationFn: async ({ eventCode, file }: { eventCode: string; file: File }) => {
      // Step 1: Upload PDF to S3
      const uploadResult = await mediaApis.uploadsStorage(file)
      const contractLink = uploadResult?.data

      if (!contractLink) {
        throw new Error('Đã có lỗi xảy ra khi lưu hợp đồng, vui lòng thử lại.')
      }

      // Step 2: Update contract by event code
      await eventApis.updateContractByEventCode({
        eventCode,
        linkContract: contractLink as any
      })

      return contractLink
    },
    onSuccess: () => {
      toast.success('Hợp đồng đã được upload thành công')
      queryClient.invalidateQueries({ queryKey: ['myEvents'] })
      setShowContractUploadDialog(false)
      setContractFile(null)
      setSelectedEventForContract(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi upload hợp đồng')
    }
  })

  const handleUploadContract = () => {
    if (!contractFile || !selectedEventForContract) {
      toast.error('Vui lòng chọn file PDF')
      return
    }

    // Verify PDF file extension
    if (!contractFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Chỉ chấp nhận file PDF')
      return
    }

    uploadContractMutation.mutate({
      eventCode: selectedEventForContract.eventCode,
      file: contractFile
    })
  }

  const handleViewContract = async (eventCode: string) => {
    try {
      const result = await eventApis.getContractByEventCode(eventCode)
      if (result?.data?.linkContract) {
        setContractUrl(result.data.linkContract)
        setShowViewContractDialog(true)
      } else {
        toast.error('Chưa có hợp đồng')
      }
    } catch (error) {
      toast.error('Lỗi khi tải hợp đồng')
    }
  }

  // Filter events based on active tab
  const getFilteredEvents = () => {
    if (activeTab === 'pendingRejected') {
      return events.filter((eventWrapper: any) =>
        eventWrapper.eventVersions?.some(
          (version: ReqFilterOwnerEvent) =>
            version.eventVersionStatus === EventStatusValues.Pending ||
            version.eventVersionStatus === EventStatusValues.Reject
        )
      )
    }
    if (activeTab === 'myEvents') {
      return events.filter((eventWrapper: any) =>
        eventWrapper.eventVersions?.some(
          (version: ReqFilterOwnerEvent) =>
            version.eventVersionStatus !== EventStatusValues.Pending &&
            version.eventVersionStatus !== EventStatusValues.Reject
        )
      )
    }
    return events
  }

  const filteredEvents = getFilteredEvents()
  const myEventsCount = events.filter((eventWrapper: any) =>
    eventWrapper.eventVersions?.some(
      (version: ReqFilterOwnerEvent) =>
        version.eventVersionStatus !== EventStatusValues.Pending &&
        version.eventVersionStatus !== EventStatusValues.Reject
    )
  ).length
  const pendingRejectedCount = events.filter((eventWrapper: any) =>
    eventWrapper.eventVersions?.some(
      (version: ReqFilterOwnerEvent) =>
        version.eventVersionStatus === EventStatusValues.Pending ||
        version.eventVersionStatus === EventStatusValues.Reject
    )
  ).length

  const renderTableRow = (eventVersion: ReqFilterOwnerEvent) => {
    const status = statusConfig[eventVersion.eventVersionStatus as keyof typeof statusConfig]
    const StatusIcon = status?.icon || AlertCircle

    return (
      <TableRow key={eventVersion.id} className='hover:bg-slate-50'>
        {/* Event Image & Name */}
        <TableCell className='font-medium'>
          <div className='flex items-center gap-3'>
            <div className='w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden'>
              {eventVersion.bannerUrl ? (
                <img src={eventVersion.bannerUrl} alt={eventVersion.eventName} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
                  <Calendar className='w-6 h-6 text-slate-400' />
                </div>
              )}
            </div>
            <div className='min-w-0'>
              <p className='font-semibold text-slate-800 truncate'>{eventVersion.eventName.slice(0, 30) + '...'}</p>
              <p className='text-sm text-slate-600 truncate'>{eventVersion.shortDescription.slice(0, 30) + '...'}</p>
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
              {eventVersion.startEventLifecycleTime
                ? format(new Date(eventVersion.startEventLifecycleTime), 'dd MMM yyyy', { locale: vi })
                : 'Chưa có'}
            </span>
          </div>
        </TableCell>

        {/* Location */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <MapPin className='w-4 h-4' />
            <span className='truncate'>{eventVersion.location?.address?.city || 'Chưa có địa điểm'}</span>
          </div>
        </TableCell>

        {/* Capacity */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Users className='w-4 h-4' />
            <span>{eventVersion.capacity}</span>
          </div>
        </TableCell>

        {/* Excel Link */}
        <TableCell>
          {eventVersion.linkExcel ? (
            <a
              href={eventVersion.linkExcel}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors duration-200'
            >
              <ExternalLink className='w-3.5 h-3.5' />
              <span>Xem Excel</span>
            </a>
          ) : (
            <span className='text-sm text-slate-400 italic'>Chưa có</span>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className='flex gap-2'>
            {/* Nút Xem - luôn hiển thị */}
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                navigate(
                  `${path.user.event.root}/${generateNameId({
                    id: eventVersion.eventCode,
                    name: eventVersion.organization.name,
                    id_2: eventVersion.eventName
                  })}`
                )
              }
            >
              <Eye className='w-4 h-4' />
            </Button>

            {/* Nút Cập nhật - hiển thị cho tất cả trạng thái trừ Canceled */}
            {eventVersion.eventVersionStatus !== EventStatusValues.Canceled && (
              <Button
                size='sm'
                variant='outline'
                className='bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300'
                onClick={() =>
                  navigate(
                    `${path.user.event.update_event}/${generateNameId({
                      id: eventVersion.eventCode,
                      name: eventVersion.eventName,
                      id_2: eventVersion.organization.name
                    })}`
                  )
                }
              >
                <Edit className='w-4 h-4' />
              </Button>
            )}

            {/* Nút Chọn gói - chỉ hiển thị cho SelectPackage */}
            {eventVersion.eventVersionStatus === EventStatusValues.SelectPackage && (
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700'
                onClick={() =>
                  navigate(
                    `${path.user.payment.payment_event}?${generateNameId({
                      id: eventVersion.eventCode,
                      name: eventVersion.eventName
                    })}`
                  )
                }
              >
                Chọn gói
              </Button>
            )}

            {/* Nút Quản lí - chỉ hiển thị cho Active */}
            {eventVersion.eventVersionStatus === EventStatusValues.Active && (
              <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() =>
                  navigate(
                    `${path.user.event_owner.user_management}?${generateNameId({
                      id: eventVersion.eventCode,
                      name: eventVersion.eventName,
                      id_2: eventVersion.organization.name
                    })}`
                  )
                }
              >
                Quản lí
              </Button>
            )}

            {/* Nút Upload hợp đồng - hiển thị cho PendingContract và RejectedContract */}
            {(eventVersion.eventVersionStatus === EventStatusValues.PendingContract ||
              (eventVersion.eventVersionStatus === EventStatusValues.RejectedContract &&
                eventVersion.linkContract === null)) && (
              <Button
                size='sm'
                className='bg-purple-600 hover:bg-purple-700'
                onClick={() => {
                  setSelectedEventForContract(eventVersion)
                  setShowContractUploadDialog(true)
                }}
              >
                <Upload className='w-4 h-4 mr-1' />
                Upload HĐ
              </Button>
            )}

            {/* Nút Xem hợp đồng - hiển thị cho tất cả status trừ Pending, Reject, Canceled */}
            {eventVersion.eventVersionStatus !== EventStatusValues.Pending &&
              eventVersion.eventVersionStatus !== EventStatusValues.Reject &&
              eventVersion.eventVersionStatus !== EventStatusValues.Canceled && (
                <Button
                  size='sm'
                  variant='outline'
                  className='border-blue-300 text-blue-700 hover:bg-blue-50'
                  onClick={() => handleViewContract(eventVersion.eventCode)}
                >
                  <FileText className='w-4 h-4' />
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
        <TabsList className='grid w-full grid-cols-3 mb-6'>
          <TabsTrigger value='myEvents'>Sự kiện của tôi ({myEventsCount})</TabsTrigger>
          <TabsTrigger value='pendingRejected'>Đang xử lý duyệt & Bị từ chối ({pendingRejectedCount})</TabsTrigger>
          <TabsTrigger value='invitations'>Các sự kiện được mời tham gia</TabsTrigger>
        </TabsList>

        {/* My Events Tab */}
        <TabsContent value='myEvents'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
            </div>
          ) : filteredEvents.length === 0 ? (
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
                    <TableHead className='w-[120px]'>Link excel thống kê</TableHead>
                    <TableHead className='w-[180px]'>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents?.map((eventWrapper: any) =>
                    eventWrapper.eventVersions
                      ?.filter((version: ReqFilterOwnerEvent) =>
                        activeTab === 'myEvents'
                          ? version.eventVersionStatus !== EventStatusValues.Pending &&
                            version.eventVersionStatus !== EventStatusValues.Reject
                          : true
                      )
                      .map((eventVersion: ReqFilterOwnerEvent) => renderTableRow(eventVersion))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Pending & Rejected Events Tab */}
        <TabsContent value='pendingRejected'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className='p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-slate-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-slate-700 mb-2'>Không có sự kiện nào đang xử lý</h3>
              <p className='text-slate-500'>Các sự kiện đang chờ duyệt hoặc bị từ chối sẽ hiển thị ở đây</p>
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
                    <TableHead className='w-[120px]'>Link excel thống kê</TableHead>
                    <TableHead className='w-[180px]'>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents?.map((eventWrapper: any) =>
                    eventWrapper.eventVersions
                      ?.filter(
                        (version: ReqFilterOwnerEvent) =>
                          version.eventVersionStatus === EventStatusValues.Pending ||
                          version.eventVersionStatus === EventStatusValues.Reject
                      )
                      .map((eventVersion: ReqFilterOwnerEvent) => renderTableRow(eventVersion))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value='invitations'>
          <InvitationsTable />
        </TabsContent>
      </Tabs>

      {/* Contract Upload Dialog */}
      <Dialog open={showContractUploadDialog} onOpenChange={setShowContractUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Hợp đồng</DialogTitle>
            <DialogDescription>
              Tải lên hợp đồng đã ký (định dạng PDF). Vui lòng tải mẫu hợp đồng tại{' '}
              <a
                href='https://docs.google.com/document/d/18wg5UucbFAyQxxEoLscYSUIpKna8SBh3RJMsploQOVc/edit?tab=t.0#heading=h.3byljzd9kg5o'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                đây
              </a>
              , chỉnh sửa và xuất ra PDF trước khi upload.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold text-slate-800 mb-2'>Sự kiện: {selectedEventForContract?.eventName}</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contract-file'>Chọn file hợp đồng (PDF)</Label>
              <Input
                id='contract-file'
                type='file'
                accept='.pdf'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (!file.name.toLowerCase().endsWith('.pdf')) {
                      toast.error('Chỉ chấp nhận file PDF')
                      e.target.value = ''
                      return
                    }
                    setContractFile(file)
                  }
                }}
              />
              {contractFile && (
                <p className='text-sm text-green-600'>
                  Đã chọn: {contractFile.name} ({(contractFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowContractUploadDialog(false)
                setContractFile(null)
                setSelectedEventForContract(null)
              }}
              disabled={uploadContractMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUploadContract}
              disabled={!contractFile || uploadContractMutation.isPending}
              className='bg-purple-600 hover:bg-purple-700'
            >
              {uploadContractMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4 mr-2' />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={showViewContractDialog} onOpenChange={setShowViewContractDialog}>
        <DialogContent className='!max-w-[1440px] max-h-[95vh]'>
          <DialogHeader>
            <DialogTitle>Xem hợp đồng</DialogTitle>
          </DialogHeader>

          <div className='w-full h-[75vh]'>
            {contractUrl ? (
              <PDFViewer url={contractUrl} />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowViewContractDialog(false)}>
              Đóng
            </Button>
            {contractUrl && (
              <Button onClick={() => window.open(contractUrl, '_blank')} className='bg-blue-600 hover:bg-blue-700'>
                <ExternalLink className='w-4 h-4 mr-2' />
                Mở trong tab mới
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

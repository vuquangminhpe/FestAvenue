import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { eventApis } from '@/apis/event.api'
import type { ReqFilterOwnerEvent, bodySearchEvent } from '@/types/event.types'
import { Heart, Search, Calendar, MapPin, Users, Loader2, Eye, HeartOff } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import path from '@/constants/path'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateNameId } from '@/utils/utils'
import { toast } from 'react-hot-toast'

export default function FavoriteEvents() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const searchFilter: bodySearchEvent = {
    searchText: searchQuery,
    pagination: {
      pageIndex: 1,
      isPaging: true,
      pageSize: 20
    }
  }

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['favoriteEvents', searchQuery],
    queryFn: () => eventApis.getListEventFollowWithPaging(searchFilter),
    staleTime: 1000 * 60 * 2 // 2 minutes
  })

  const unfollowMutation = useMutation({
    mutationFn: (eventCode: string) => eventApis.followOrUnfollowEvent(eventCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteEvents'] })
      if (!data?.data?.isFollowing) {
        toast.success('Đã bỏ yêu thích sự kiện')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể bỏ yêu thích sự kiện')
    }
  })

  const events = (eventsData?.data as any)?.result || []
  const filteredEvents = events.filter((event: ReqFilterOwnerEvent) =>
    event.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUnfollow = (eventCode: string, e: React.MouseEvent) => {
    e.stopPropagation()
    unfollowMutation.mutate(eventCode)
  }

  const renderTableRow = (event: ReqFilterOwnerEvent) => {
    return (
      <TableRow key={event.id} className='hover:bg-slate-50'>
        {/* Event Image & Name */}
        <TableCell className='font-medium'>
          <div className='flex items-center gap-3'>
            <div className='w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden'>
              {event.bannerUrl ? (
                <img src={event.bannerUrl} alt={event.eventName} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
                  <Calendar className='w-6 h-6 text-slate-400' />
                </div>
              )}
            </div>
            <div className='min-w-0'>
              <p className='font-semibold text-slate-800 truncate'>{event.eventName}</p>
              <p className='text-sm text-slate-600 truncate'>{event.shortDescription}</p>
            </div>
          </div>
        </TableCell>

        {/* Start Date */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Calendar className='w-4 h-4' />
            <span>
              {event.startEventLifecycleTime
                ? format(new Date(event.startEventLifecycleTime), 'dd MMM yyyy', { locale: vi })
                : 'Chưa có'}
            </span>
          </div>
        </TableCell>

        {/* Location */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <MapPin className='w-4 h-4' />
            <span className='truncate'>{event.location?.address?.city || 'Chưa có địa điểm'}</span>
          </div>
        </TableCell>

        {/* Capacity */}
        <TableCell>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Users className='w-4 h-4' />
            <span>{event.capacity}</span>
          </div>
        </TableCell>

        {/* Organization */}
        <TableCell>
          <div className='text-sm text-slate-600 truncate'>{event.organization?.name || 'N/A'}</div>
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
                    id: event.eventCode,
                    name: event.organization.name,
                    id_2: event.eventName
                  })}`
                )
              }
            >
              <Eye className='w-4 h-4' />
            </Button>

            <Button
              size='sm'
              variant='outline'
              className='text-red-600 hover:bg-red-50 hover:text-red-700'
              onClick={(e) => handleUnfollow(event.eventCode, e)}
              disabled={unfollowMutation.isPending}
            >
              {unfollowMutation.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <HeartOff className='w-4 h-4' />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <Helmet>
        <title>Sự kiện yêu thích - FestAvenue</title>
      </Helmet>

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-slate-800 flex items-center gap-2'>
              <Heart className='w-8 h-8 text-red-500 fill-red-500' />
              Sự kiện yêu thích
            </h1>
            <p className='text-slate-600 mt-1'>Các sự kiện bạn đã lưu để theo dõi</p>
          </div>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
          <Input
            placeholder='Tìm kiếm sự kiện yêu thích...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className='p-12 text-center'>
          <Heart className='w-16 h-16 text-slate-300 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-slate-700 mb-2'>
            {searchQuery ? 'Không tìm thấy sự kiện' : 'Chưa có sự kiện yêu thích'}
          </h3>
          <p className='text-slate-500 mb-4'>
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Khám phá và lưu những sự kiện bạn quan tâm'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => navigate(path.events)}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400'
            >
              <Search className='w-4 h-4 mr-2' />
              Khám phá sự kiện
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sự kiện</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Tổ chức</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{filteredEvents.map((event: ReqFilterOwnerEvent) => renderTableRow(event))}</TableBody>
            </Table>
          </div>

          {/* Stats */}
          <div className='px-6 py-4 border-t bg-slate-50'>
            <p className='text-sm text-slate-600'>
              Tổng cộng <span className='font-semibold'>{filteredEvents.length}</span> sự kiện yêu thích
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

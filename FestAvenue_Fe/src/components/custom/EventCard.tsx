import { Heart, MapPin, Calendar, Clock } from 'lucide-react'
import { Link } from 'react-router'
import type { ReqFilterOwnerEvent } from '@/types/event.types'
import path from '@/constants/path'
import OptimizedImage from './OptimizedImage'
import { generateNameId } from '@/utils/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApis } from '@/apis/event.api'
import { toast } from 'react-hot-toast'

interface EventCardProps {
  event: ReqFilterOwnerEvent
  priority?: boolean
}

export default function EventCard({ event, priority = false }: EventCardProps) {
  const queryClient = useQueryClient()

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: (eventCode: string) => eventApis.followOrUnfollowEvent(eventCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteEvents'] })
      queryClient.invalidateQueries({ queryKey: ['aiSearchEvents'] })
      queryClient.invalidateQueries({ queryKey: ['normalSearchEvents'] })
      queryClient.invalidateQueries({ queryKey: ['top20FeaturedEvents'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể thực hiện thao tác')
    }
  })

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    followMutation.mutate(event.eventCode)
  }
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Link
      to={`${path.user.event.root}/${generateNameId({
        name: event.eventName,
        id: event.eventCode,
        id_2: event.organization.name
      })}`}
      className='group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-2'
    >
      <div className='relative'>
        <OptimizedImage
          src={event.bannerUrl}
          alt={event.eventName}
          width={600}
          height={400}
          className='h-48 w-full'
          priority={priority}
          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
        />
        <button
          onClick={handleFollow}
          disabled={followMutation.isPending}
          className='absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 disabled:opacity-50'
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              event.isFollowed ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
      </div>
      <div className='p-6'>
        <h3 className='font-bold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-cyan-600 transition-colors'>
          {event.eventName}
        </h3>
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{event.shortDescription}</p>
        <div className='space-y-2 text-sm text-gray-600'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-cyan-500' />
            <span>{formatDate(event.startTimeEventTime)}</span>
          </div>
          {event.startTimeEventTime && (
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-cyan-500' />
              <span>{formatTime(event.startTimeEventTime)}</span>
            </div>
          )}
          {event.location?.address && (
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-cyan-500' />
              <span className='line-clamp-1'>
                {event.location.address.street}, {event.location.address.city}
              </span>
            </div>
          )}
        </div>
        {event.organization && (
          <div className='mt-4 pt-4 border-t border-gray-100'>
            <span className='text-xs text-gray-500'>Tổ chức bởi</span>
            <p className='text-sm font-medium text-gray-700 line-clamp-1'>{event.organization.name}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

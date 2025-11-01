import { Eye, Edit, Trash2, Heart, MessageCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { resListPostSocialMediaResult } from '@/types/serviceSocialMedia.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SocialMediaItemProps {
  post: resListPostSocialMediaResult
  onView: (postId: string) => void
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
  canEdit?: boolean
}

export default function SocialMediaItem({ post, onView, onEdit, onDelete, canEdit = true }: SocialMediaItemProps) {
  return (
    <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 group'>
      {/* Banner Image */}
      <div className='relative h-48 overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100'>
        {post.bannerPostUrl ? (
          <img
            src={post.bannerPostUrl}
            alt={post.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image'
            }}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            <span>Không có hình ảnh</span>
          </div>
        )}
        {/* Quick View Button */}
        <Button
          size='sm'
          variant='secondary'
          className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={() => onView(post.postSocialMediaId)}
        >
          <Eye className='w-4 h-4 mr-1' />
          Xem
        </Button>
      </div>

      <CardContent className='pt-4 space-y-3'>
        {/* Author */}
        <div className='flex items-center gap-2'>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={post.avatarAthorUrl} alt={post.authorName} />
            <AvatarFallback>{post.authorName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-900 truncate'>{post.authorName}</p>
            <p className='text-xs text-gray-500'>
              {post.createAt && format(new Date(post.createAt), 'dd MMM yyyy', { locale: vi })}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className='font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]'>{post.title}</h3>

        {/* Subtitle */}
        {post.subtitle && <p className='text-sm text-gray-600 line-clamp-1'>{post.subtitle}</p>}

        {/* Description */}
        <p className='text-sm text-gray-600 line-clamp-2'>{post.description}</p>

        {/* Stats */}
        <div className='flex items-center gap-4 pt-2 border-t'>
          <div className='flex items-center gap-1 text-sm text-gray-500'>
            <Heart className='w-4 h-4 text-red-400' />
            <span className='font-medium'>{post.totalReactions || 0}</span>
          </div>
          <div className='flex items-center gap-1 text-sm text-gray-500'>
            <MessageCircle className='w-4 h-4 text-blue-400' />
            <span className='font-medium'>{post.totalComments || 0}</span>
          </div>
          <div className='flex items-center gap-1 text-sm text-gray-500 ml-auto'>
            <Calendar className='w-4 h-4' />
            <span className='text-xs'>
              {post.publishDate && format(new Date(post.publishDate), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='bg-gray-50 flex justify-between items-center gap-2 pt-3'>
        {canEdit ? (
          <>
            <Button size='sm' variant='outline' onClick={() => onView(post.postSocialMediaId)} className='flex-1'>
              <Eye className='w-4 h-4 mr-1' />
              Xem
            </Button>
            <Button
              size='sm'
              variant='default'
              onClick={() => onEdit(post.postSocialMediaId)}
              className='flex-1 bg-blue-500 hover:bg-blue-600'
            >
              <Edit className='w-4 h-4 mr-1' />
              Sửa
            </Button>
            <Button size='sm' variant='destructive' onClick={() => onDelete(post.postSocialMediaId)} className='flex-1'>
              <Trash2 className='w-4 h-4 mr-1' />
              Xóa
            </Button>
          </>
        ) : (
          <Button size='sm' variant='default' onClick={() => onView(post.postSocialMediaId)} className='w-full'>
            <Eye className='w-4 h-4 mr-1' />
            Xem chi tiết
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

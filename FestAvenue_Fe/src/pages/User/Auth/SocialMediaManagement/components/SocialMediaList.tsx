import { useState } from 'react'
import { Loader2, Search, Filter, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SocialMediaItem from './SocialMediaItem'
import { useSocialMediaList, useDeleteSocialMedia } from '../hooks/useSocialMediaQueries'
import type { bodyListPostSocialMedia } from '@/types/serviceSocialMedia.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface SocialMediaListProps {
  eventCode: string
  onView: (postId: string) => void
  onEdit: (postId: string) => void
  onCreate?: () => void
}

export default function SocialMediaList({ eventCode, onView, onEdit, onCreate }: SocialMediaListProps) {
  const [searchText, setSearchText] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

  const filters: bodyListPostSocialMedia = {
    eventCode,
    searchSocialPost: searchText,
    pagination: {
      pageIndex,
      isPaging: true,
      pageSize
    }
  }

  const { data, isLoading, error } = useSocialMediaList(filters)
  const deleteMutation = useDeleteSocialMedia()

  const handleSearch = () => {
    setPageIndex(1) // Reset về trang 1 khi search
  }

  const handleDelete = (postId: string) => {
    setDeletePostId(postId)
  }

  const confirmDelete = async () => {
    if (deletePostId) {
      await deleteMutation.mutateAsync(deletePostId)
      setDeletePostId(null)
    }
  }

  const posts = data?.data?.result || []
  const totalPages = (data?.data?.pagination as any)?.totalPages || 1

  return (
    <div className='space-y-6'>
      {/* Header & Actions */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Danh sách bài viết</h2>
          <p className='text-sm text-gray-600 mt-1'>Quản lý các bài viết Social Media của sự kiện</p>
        </div>
        {onCreate && (
          <Button onClick={onCreate} className='bg-gradient-to-r from-cyan-500 to-blue-500'>
            <Plus className='w-4 h-4 mr-2' />
            Tạo bài viết mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className='p-4'>
        <div className='flex gap-3'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Tìm kiếm bài viết...'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='pl-10'
            />
          </div>
          <Button onClick={handleSearch} variant='default'>
            <Filter className='w-4 h-4 mr-2' />
            Tìm kiếm
          </Button>
          {searchText && (
            <Button onClick={() => setSearchText('')} variant='outline'>
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center items-center py-20'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-500' />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className='p-8 text-center'>
          <p className='text-red-600'>Đã có lỗi xảy ra khi tải dữ liệu</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && posts.length === 0 && (
        <Card className='p-12 text-center'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center'>
              <Search className='w-10 h-10 text-cyan-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900'>Chưa có bài viết nào</h3>
            <p className='text-gray-600'>Bắt đầu tạo bài viết đầu tiên của bạn</p>
            {onCreate && (
              <Button onClick={onCreate} className='bg-gradient-to-r from-cyan-500 to-blue-500'>
                <Plus className='w-4 h-4 mr-2' />
                Tạo bài viết mới
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Posts Grid */}
      {!isLoading && !error && posts.length > 0 && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {posts.map((post: any) => (
              <SocialMediaItem
                key={post.postSocialMediaId}
                post={post}
                onView={onView}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>Hiển thị</span>
              <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-sm text-gray-600'>bài viết</span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
              >
                Trước
              </Button>
              <span className='text-sm text-gray-600'>
                Trang {pageIndex} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex >= totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className='bg-red-600 hover:bg-red-700'>
              {deleteMutation.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

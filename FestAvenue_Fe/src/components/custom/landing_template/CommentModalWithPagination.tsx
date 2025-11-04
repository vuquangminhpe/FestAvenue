import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { ReactionType } from './types'
import {
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Angry,
  Sparkles,
  Send,
  X,
  Pencil,
  Trash2,
  Check,
  XCircle,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useGetImageCommentsAndReactions } from '@/pages/User/Auth/SocialMediaDetail/hooks'

interface CommentModalWithPaginationProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  imageId: string
  imageUrl: string
  imageCaption?: string
  currentUserId?: string | null
  onComment?: (imageId: string, comment: string) => void
  onDeleteComment?: (commentId: string, imageId: string) => void
  onUpdateComment?: (commentId: string, imageId: string, newContent: string) => void
  onReaction?: (imageId: string, reactionType: ReactionType) => void
}

const reactionEmojis: Record<ReactionType, { icon: any; label: string; color: string; bgColor: string }> = {
  like: { icon: ThumbsUp, label: 'Thích', color: 'text-blue-600', bgColor: 'bg-blue-100 hover:bg-blue-200' },
  love: { icon: Heart, label: 'Yêu Thích', color: 'text-red-600', bgColor: 'bg-red-100 hover:bg-red-200' },
  haha: { icon: Laugh, label: 'Haha', color: 'text-yellow-600', bgColor: 'bg-yellow-100 hover:bg-yellow-200' },
  wow: { icon: Sparkles, label: 'Wow', color: 'text-purple-600', bgColor: 'bg-purple-100 hover:bg-purple-200' },
  sad: { icon: Frown, label: 'Buồn', color: 'text-gray-600', bgColor: 'bg-gray-100 hover:bg-gray-200' },
  angry: { icon: Angry, label: 'Phẫn Nộ', color: 'text-orange-600', bgColor: 'bg-orange-100 hover:bg-orange-200' }
}

export default function CommentModalWithPagination({
  isOpen,
  onClose,
  postId,
  imageId,
  imageUrl,
  imageCaption,
  currentUserId,
  onComment,
  onDeleteComment,
  onUpdateComment,
  onReaction
}: CommentModalWithPaginationProps) {
  const [newComment, setNewComment] = useState('')
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch comments and reactions with pagination
  const { data, isLoading, isFetching } = useGetImageCommentsAndReactions(
    postId,
    imageId,
    currentPage,
    pageSize,
    isOpen // Only fetch when modal is open
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() && onComment) {
      onComment(imageId, newComment.trim())
      setNewComment('')
    }
  }

  const handleReaction = (type: ReactionType) => {
    if (onReaction) {
      onReaction(imageId, type)
    }
    setShowReactionPicker(false)
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim() && onUpdateComment) {
      onUpdateComment(commentId, imageId, editContent.trim())
      setEditingCommentId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId, imageId)
    }
  }

  const handleLoadMore = () => {
    if (data?.pagination && currentPage < Math.ceil(data.pagination.total / pageSize)) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi })
    } catch {
      return 'Vừa xong'
    }
  }

  const reactions = data?.reactions || []
  const comments = data?.pagingComments || []
  const totalReactions = data?.totalReactions || 0
  const hasMoreComments = data?.pagination && currentPage < Math.ceil(data.pagination.total / pageSize)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] lg:max-w-7xl w-full h-[95vh] p-0 gap-0 overflow-hidden'>
        <div className='flex flex-col lg:flex-row h-full'>
          {/* Left Side - Image */}
          <div className='relative bg-black flex items-center justify-center lg:flex-1 h-[40vh] lg:h-full'>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 flex items-center justify-center transition-all shadow-lg hover:scale-110'
            >
              <X className='w-5 h-5' />
            </button>
            <img src={imageUrl} alt={imageCaption} className='w-full h-full object-contain' />
          </div>

          {/* Right Side - Comments */}
          <div className='flex flex-col bg-white lg:w-[500px] xl:w-[600px] h-[55vh] lg:h-full'>
            {/* Header */}
            <div className='px-6 py-5 border-b shrink-0'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Bình Luận</h2>
              {imageCaption && <p className='text-gray-600 text-base line-clamp-2'>{imageCaption}</p>}
            </div>

            {/* Reactions Bar */}
            <div className='px-6 py-4 border-b bg-gray-50 shrink-0'>
              {/* Total Reactions */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  {reactions.length > 0 && (
                    <div className='flex items-center -space-x-1'>
                      {reactions.slice(0, 3).map((reaction) => (
                        <div
                          key={reaction.userId}
                          className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center shadow-sm'
                          title={reaction.fullName}
                        >
                          <Heart className='w-4 h-4 text-white fill-current' />
                        </div>
                      ))}
                    </div>
                  )}
                  <span className='text-base font-semibold text-gray-700'>{totalReactions} cảm xúc</span>
                </div>

                {/* React Button */}
                <div className='relative'>
                  <button
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className='flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 group font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105'
                  >
                    <Heart className='w-5 h-5 group-hover:scale-110 transition-transform fill-current' />
                    <span>Thả Cảm Xúc</span>
                  </button>

                  {/* Reaction Picker */}
                  {showReactionPicker && (
                    <div className='absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex gap-1 z-50 animate-in fade-in slide-in-from-top-2'>
                      {(Object.entries(reactionEmojis) as [ReactionType, (typeof reactionEmojis)[ReactionType]][]).map(
                        ([type, { icon: Icon, label, color, bgColor }]) => (
                          <button
                            key={type}
                            onClick={() => handleReaction(type)}
                            className={`group flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg ${bgColor} transition-all duration-200`}
                            title={label}
                          >
                            <Icon className={`w-6 h-6 ${color} group-hover:scale-125 transition-transform`} />
                            <span className={`text-xs font-semibold ${color}`}>{label}</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments List - Scrollable */}
            <div className='flex-1 overflow-y-auto px-6 py-4 max-h-[550px]' style={{ overflowY: 'auto' }}>
              {isLoading && currentPage === 1 ? (
                <div className='flex items-center justify-center h-full'>
                  <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
                </div>
              ) : (comments as any)?.result?.length > 0 ? (
                <div className='space-y-4'>
                  {(comments as any)?.result?.map((comment: any) => {
                    const isOwner = currentUserId && comment.userId === currentUserId
                    const isEditing = editingCommentId === comment.commentId

                    return (
                      <div
                        key={comment.commentId}
                        className='flex gap-3 animate-in fade-in slide-in-from-bottom-2 group'
                      >
                        <Avatar className='w-10 h-10 flex-shrink-0 ring-2 ring-purple-100'>
                          <AvatarImage src={comment.avatar} />
                          <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold'>
                            {getInitials(comment.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          {isEditing ? (
                            <div className='space-y-2'>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className='min-h-[70px] max-h-[120px] resize-none rounded-xl text-sm bg-white border-2 border-purple-400'
                                autoFocus
                              />
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  onClick={() => handleSaveEdit(comment.commentId)}
                                  disabled={!editContent.trim()}
                                  className='bg-green-600 hover:bg-green-700 text-white'
                                >
                                  <Check className='w-4 h-4 mr-1' />
                                  Lưu
                                </Button>
                                <Button size='sm' variant='outline' onClick={handleCancelEdit}>
                                  <XCircle className='w-4 h-4 mr-1' />
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className='relative bg-gray-100 rounded-2xl px-4 py-3 hover:bg-gray-200 transition-colors'>
                                <p className='font-semibold text-sm text-gray-900 mb-1'>{comment.fullName}</p>
                                <p className='text-gray-800 text-sm leading-relaxed break-words pr-16'>
                                  {comment.commentText}
                                </p>
                                {isOwner && (
                                  <div className='absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleEditComment(comment.commentId, comment.commentText)}
                                          className='p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors shadow-sm'
                                        >
                                          <Pencil className='w-3.5 h-3.5' />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Chỉnh sửa</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleDeleteComment(comment.commentId)}
                                          className='p-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors shadow-sm'
                                        >
                                          <Trash2 className='w-3.5 h-3.5' />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xóa</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                )}
                              </div>
                              <p className='text-xs text-gray-500 mt-1.5 ml-4 font-medium'>
                                {formatTime(comment.commentedAt)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Load More Button */}
                  {hasMoreComments && (
                    <div className='flex justify-center pt-4'>
                      <Button onClick={handleLoadMore} disabled={isFetching} variant='outline' className='gap-2'>
                        {isFetching ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <ChevronDown className='w-4 h-4' />
                            Xem thêm bình luận
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-full text-gray-400 py-8'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
                    <Heart className='w-8 h-8 text-gray-300' />
                  </div>
                  <p className='text-lg font-bold mb-1 text-gray-500'>Chưa có bình luận</p>
                  <p className='text-sm text-gray-400'>Hãy là người đầu tiên chia sẻ suy nghĩ!</p>
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at Bottom */}
            <div className='px-6 py-4 border-t bg-gradient-to-r from-purple-50/50 to-pink-50/50 shrink-0'>
              <form onSubmit={handleSubmit} className='flex gap-3'>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Viết bình luận...'
                  className='flex-1 min-h-[70px] max-h-[120px] resize-none rounded-xl text-sm bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <Button
                  type='submit'
                  size='icon'
                  disabled={!newComment.trim()}
                  className='w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 shrink-0'
                >
                  <Send className='w-6 h-6' />
                </Button>
              </form>
              <p className='text-xs text-gray-500 mt-2 font-medium'>
                Nhấn{' '}
                <kbd className='px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono'>Enter</kbd> để
                gửi,
                <kbd className='px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono ml-1'>
                  Shift+Enter
                </kbd>{' '}
                để xuống dòng
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

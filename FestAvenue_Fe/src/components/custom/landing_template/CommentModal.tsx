import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { SocialMediaImage, ReactionType } from './types'
import { Heart, ThumbsUp, Laugh, Frown, Angry, Sparkles, Send, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  image: SocialMediaImage | null
  onComment?: (imageId: string, comment: string) => void
  onLike?: (imageId: string) => void
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

export default function CommentModal({ isOpen, onClose, image, onComment, onReaction }: CommentModalProps) {
  const [newComment, setNewComment] = useState('')
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  if (!image) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() && onComment) {
      onComment(image.id, newComment.trim())
      setNewComment('')
    }
  }

  const handleReaction = (type: ReactionType) => {
    if (onReaction) {
      onReaction(image.id, type)
    }
    setShowReactionPicker(false)
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
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  const getTotalReactions = () => {
    if (image.reactions && image.reactions.length > 0) {
      return image.reactions.reduce((sum, r) => sum + r.count, 0)
    }
    return image.likes || 0
  }

  const getTopReactions = () => {
    if (!image.reactions || image.reactions.length === 0) return []
    return [...image.reactions]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }

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
            <img
              src={image.url}
              alt={image.caption}
              className='w-full h-full object-contain'
            />
          </div>

          {/* Right Side - Comments */}
          <div className='flex flex-col bg-white lg:w-[500px] xl:w-[600px] h-[55vh] lg:h-full'>
            {/* Header */}
            <div className='px-6 py-5 border-b shrink-0'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Bình Luận</h2>
              {image.caption && (
                <p className='text-gray-600 text-base line-clamp-2'>{image.caption}</p>
              )}
            </div>

            {/* Reactions Bar */}
            <div className='px-6 py-4 border-b bg-gray-50 shrink-0'>
              {/* Total Reactions */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  {getTopReactions().length > 0 && (
                    <div className='flex items-center -space-x-1'>
                      {getTopReactions().map((reaction) => {
                        const ReactionIcon = reactionEmojis[reaction.type].icon
                        return (
                          <div
                            key={reaction.type}
                            className={`w-8 h-8 rounded-full ${reactionEmojis[reaction.type].bgColor} border-2 border-white flex items-center justify-center shadow-sm`}
                          >
                            <ReactionIcon className={`w-4 h-4 ${reactionEmojis[reaction.type].color}`} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <span className='text-base font-semibold text-gray-700'>
                    {getTotalReactions()} cảm xúc
                  </span>
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
                      {(Object.entries(reactionEmojis) as [ReactionType, typeof reactionEmojis[ReactionType]][]).map(([type, { icon: Icon, label, color, bgColor }]) => (
                        <button
                          key={type}
                          onClick={() => handleReaction(type)}
                          className={`group flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg ${bgColor} transition-all duration-200`}
                          title={label}
                        >
                          <Icon className={`w-6 h-6 ${color} group-hover:scale-125 transition-transform`} />
                          <span className={`text-xs font-semibold ${color}`}>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reaction Breakdown */}
              {image.reactions && image.reactions.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {image.reactions.map((reaction) => {
                    const ReactionIcon = reactionEmojis[reaction.type].icon
                    return (
                      <div
                        key={reaction.type}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${reactionEmojis[reaction.type].bgColor} border border-gray-200 text-sm font-semibold transition-all hover:scale-105`}
                      >
                        <ReactionIcon className={`w-4 h-4 ${reactionEmojis[reaction.type].color}`} />
                        <span className={reactionEmojis[reaction.type].color}>{reaction.count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Comments List - Scrollable */}
            <div className='flex-1 overflow-y-auto px-6 py-4'>
              {image.comments && image.comments.length > 0 ? (
                <div className='space-y-4'>
                  {image.comments.map((comment) => (
                    <div key={comment.id} className='flex gap-3 animate-in fade-in slide-in-from-bottom-2'>
                      <Avatar className='w-10 h-10 flex-shrink-0 ring-2 ring-purple-100'>
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold'>
                          {getInitials(comment.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='bg-gray-100 rounded-2xl px-4 py-3 hover:bg-gray-200 transition-colors'>
                          <p className='font-semibold text-sm text-gray-900 mb-1'>{comment.userName}</p>
                          <p className='text-gray-800 text-sm leading-relaxed break-words'>{comment.content}</p>
                        </div>
                        <p className='text-xs text-gray-500 mt-1.5 ml-4 font-medium'>
                          {formatTime(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
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
                Nhấn <kbd className='px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono'>Enter</kbd> để gửi,
                <kbd className='px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono ml-1'>Shift+Enter</kbd> để xuống dòng
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

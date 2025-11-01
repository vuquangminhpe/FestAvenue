import { useState } from 'react'
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  useSocialMediaDetail,
  useReactionImageInPost,
  useCommentImageInPost,
  useDeleteCommentInPost
} from '../hooks/useSocialMediaQueries'
import { getPostStatusLabel, getSocialPlatformLabel } from '../constants/socialMediaFormFields'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SocialMediaDetailProps {
  postId: string
  onBack: () => void
}

export default function SocialMediaDetail({ postId, onBack }: SocialMediaDetailProps) {
  const { data, isLoading } = useSocialMediaDetail(postId)
  const reactionMutation = useReactionImageInPost()
  const commentMutation = useCommentImageInPost()
  const deleteCommentMutation = useDeleteCommentInPost()

  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})

  const post = data?.data

  const handleReaction = async (imageInPostId: string) => {
    await reactionMutation.mutateAsync({
      postId,
      imageInPostId
    })
  }

  const handleComment = async (imageInPostId: string) => {
    const text = commentTexts[imageInPostId]
    if (!text?.trim()) return

    await commentMutation.mutateAsync({
      postSocialMediaId: postId,
      imageInPostId,
      commentText: text.trim()
    })

    setCommentTexts((prev) => ({ ...prev, [imageInPostId]: '' }))
  }

  const handleDeleteComment = async (imageInPostId: string, commentPostId: string) => {
    await deleteCommentMutation.mutateAsync({
      postSocialMediaId: postId,
      imageInPostId,
      commentPostId
    })
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-cyan-500' />
      </div>
    )
  }

  if (!post) {
    return (
      <Card className='p-8 text-center'>
        <p className='text-red-600'>Không tìm thấy bài viết</p>
        <Button onClick={onBack} variant='outline' className='mt-4'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Quay lại
        </Button>
      </Card>
    )
  }

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {/* Back Button */}
      <Button onClick={onBack} variant='ghost'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Quay lại
      </Button>

      {/* Main Content */}
      <Card>
        <CardHeader>
          {/* Author Info */}
          <div className='flex items-center gap-3 mb-4'>
            <Avatar className='w-12 h-12'>
              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
              <AvatarFallback>{post.authorName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className='font-semibold text-gray-900'>{post.authorName}</p>
              <p className='text-sm text-gray-500'>
                {post.publishDate && format(new Date(post.publishDate), 'dd MMMM yyyy, HH:mm', { locale: vi })}
              </p>
            </div>
            <Badge variant='outline' className='ml-auto'>
              {getPostStatusLabel(post.status)}
            </Badge>
          </div>

          {/* Banner */}
          {post.bannerUrl && (
            <div className='relative w-full h-64 rounded-lg overflow-hidden mb-4'>
              <img src={post.bannerUrl} alt={post.title} className='w-full h-full object-cover' />
            </div>
          )}

          {/* Title & Subtitle */}
          <CardTitle className='text-3xl mb-2'>{post.title}</CardTitle>
          {post.subtitle && <p className='text-lg text-gray-600'>{post.subtitle}</p>}
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Description */}
          <div>
            <h3 className='font-semibold text-lg mb-2'>Mô tả</h3>
            <p className='text-gray-700'>{post.description}</p>
          </div>

          {/* Body */}
          <div>
            <h3 className='font-semibold text-lg mb-2'>Nội dung</h3>
            <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>

          {/* Video */}
          {post.videoUrl && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>Video</h3>
              <a
                href={post.videoUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline flex items-center gap-2'
              >
                {post.videoUrl}
                <ExternalLink className='w-4 h-4' />
              </a>
            </div>
          )}

          {/* Audio */}
          {post.audioUrl && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>Audio</h3>
              <audio controls className='w-full'>
                <source src={post.audioUrl} />
              </audio>
            </div>
          )}

          {/* Social Links */}
          {post.socialLinks && post.socialLinks.length > 0 && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>Liên kết mạng xã hội</h3>
              <div className='flex flex-wrap gap-2'>
                {post.socialLinks.map((link: any, index: number) => (
                  <Badge key={index} variant='secondary' className='cursor-pointer'>
                    <a href={link.url} target='_blank' rel='noopener noreferrer' className='flex items-center gap-1'>
                      {getSocialPlatformLabel(link.platform)}
                      <ExternalLink className='w-3 h-3' />
                    </a>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Images with Reactions & Comments */}
          {post.images && post.images.length > 0 && (
            <div>
              <h3 className='font-semibold text-lg mb-4'>Hình ảnh</h3>
              <div className='space-y-6'>
                {post.images.map((image: any) => (
                  <Card key={image.imageInPostId}>
                    <CardContent className='pt-4'>
                      {/* Image */}
                      <div className='relative w-full rounded-lg overflow-hidden mb-3'>
                        <img src={image.url} alt={image.caption || 'Image'} className='w-full object-cover' />
                      </div>

                      {/* Caption */}
                      {image.caption && <p className='text-sm text-gray-600 mb-3'>{image.caption}</p>}

                      {/* Reactions */}
                      <div className='flex items-center gap-4 mb-4 pb-4 border-b'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleReaction(image.imageInPostId)}
                          disabled={reactionMutation.isPending}
                          className='flex items-center gap-2'
                        >
                          <Heart
                            className={`w-4 h-4 ${image.reactions?.length > 0 ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{image.reactions?.length || 0} reactions</span>
                        </Button>
                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                          <MessageCircle className='w-4 h-4' />
                          <span>{image.userCommentPosts?.length || 0} comments</span>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className='space-y-3 mb-4'>
                        {image.userCommentPosts?.map((comment: any) => (
                          <div key={comment.commentId} className='flex gap-3'>
                            <Avatar className='w-8 h-8'>
                              <AvatarImage src={comment.avatar} alt={comment.fullName} />
                              <AvatarFallback>{comment.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='bg-gray-100 rounded-lg px-3 py-2'>
                                <p className='font-semibold text-sm'>{comment.fullName}</p>
                                <p className='text-sm text-gray-700'>{comment.commentText}</p>
                              </div>
                              <div className='flex items-center gap-3 mt-1 text-xs text-gray-500'>
                                <span>
                                  {comment.commentedAt &&
                                    format(new Date(comment.commentedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </span>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-auto p-0 text-xs text-red-600 hover:text-red-700'
                                  onClick={() => handleDeleteComment(image.imageInPostId, comment.commentId)}
                                >
                                  <Trash2 className='w-3 h-3 mr-1' />
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className='flex gap-2'>
                        <Textarea
                          placeholder='Viết bình luận...'
                          value={commentTexts[image.imageInPostId] || ''}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({ ...prev, [image.imageInPostId]: e.target.value }))
                          }
                          rows={2}
                          className='flex-1'
                        />
                        <Button
                          size='sm'
                          onClick={() => handleComment(image.imageInPostId)}
                          disabled={!commentTexts[image.imageInPostId]?.trim() || commentMutation.isPending}
                        >
                          <Send className='w-4 h-4' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Views Count */}
          <div className='text-sm text-gray-500 pt-4 border-t'>
            <span className='font-medium'>{post.socialMediaViewsCount || 0}</span> lượt xem
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

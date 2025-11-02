import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getIdFromNameId_ver } from '@/utils/utils'
import { useUsersStore } from '@/contexts/app.context'
import {
  useGetPostDetail,
  useReactionImageInPost,
  useCommentImageInPost,
  useDeleteCommentInPost,
  useUpdateCommentInPost
} from './hooks'
import {
  Template1,
  Template2,
  Template3,
  Template4,
  Template5,
  Template6,
  type LandingTemplateProps,
} from '@/components/custom/landing_template'
import type { SocialMediaImage } from '@/components/custom/landing_template/types'

const SocialMediaDetail = () => {
  const params = useParams()
  const navigate = useNavigate()
  const postNameId = params.postId as string

  // Get current user info
  const { isProfile } = useUsersStore()
  const currentUserId = isProfile?.id

  // Extract postId and templateNumber from URL
  const { nameId: postId, templateNumber } = getIdFromNameId_ver(postNameId)

  // Fetch post detail
  const { data: post, isLoading, isError, isFetching } = useGetPostDetail(postId)

  // Mutations
  const reactionMutation = useReactionImageInPost()
  const commentMutation = useCommentImageInPost()
  const deleteCommentMutation = useDeleteCommentInPost()
  const updateCommentMutation = useUpdateCommentInPost()

  // Map API data to template props
  const templateProps: LandingTemplateProps | null = useMemo(() => {
    if (!post) return null

    // Convert images from API to template format
    const images: SocialMediaImage[] =
      post.images?.map((img) => ({
        id: img.imageInPostId,
        url: img.url,
        caption: img.caption,
        likes: img.reactions?.length || 0,
        reactions: [],
        comments:
          img.userCommentPosts?.map((comment) => ({
            id: comment.commentId,
            userId: comment.userId,
            userName: comment.fullName,
            userAvatar: comment.avatar,
            content: comment.commentText,
            createdAt: comment.commentedAt
          })) || []
      })) || []

    // Convert social links from API to template format
    const socialLinks =
      post.socialLinks?.map((link) => {
        const platformMap: Record<number, 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'> = {
          0: 'facebook',
          1: 'twitter',
          2: 'instagram',
          3: 'linkedin',
          4: 'tiktok',
          5: 'youtube'
        }
        return {
          platform: platformMap[link.platform] || 'facebook',
          url: link.url
        }
      }) || []

    return {
      bannerUrl: post.bannerUrl,
      title: post.title,
      subtitle: post.subtitle,
      description: post.description,
      authorName: post.authorName,
      authorAvatar: post.authorAvatar,
      eventDate: post.publishDate,
      content: post.body,
      images,
      relatedEvents: [], // TODO: Có thể thêm related events nếu cần
      socialLinks,
      currentUserId,
      onLike: (imageId: string) => {
        reactionMutation.mutate({
          postId: post.id,
          imageInPostId: imageId
        })
      },
      onReaction: (imageId: string) => {
        // Có thể mở rộng để hỗ trợ nhiều loại reaction
        reactionMutation.mutate({
          postId: post.id,
          imageInPostId: imageId
        })
      },
      onComment: (imageId: string, comment: string) => {
        commentMutation.mutate({
          postSocialMediaId: post.id,
          imageInPostId: imageId,
          commentText: comment
        })
      },
      onDeleteComment: (commentId: string, imageId: string) => {
        deleteCommentMutation.mutate({
          postSocialMediaId: post.id,
          imageInPostId: imageId,
          commentPostId: commentId
        })
      },
      onUpdateComment: (commentId: string, imageId: string, newContent: string) => {
        updateCommentMutation.mutate({
          postSocialMediaId: post.id,
          imageInPostId: imageId,
          commentPostId: commentId,
          newContent
        })
      },
      onShare: () => {
        // Share functionality
        if (navigator.share) {
          navigator.share({
            title: post.title,
            text: post.subtitle,
            url: window.location.href
          })
        }
      },
      onRegister: () => {
        // Navigate to event registration or ticket page
        navigate(-1) // Go back to event details
      }
    }
  }, [post, reactionMutation, commentMutation, deleteCommentMutation, updateCommentMutation, navigate, currentUserId])

  // Select template based on templateNumber
  const TemplateComponent = useMemo(() => {
    const templates = [Template1, Template2, Template3, Template4, Template5, Template6]
    const index = (templateNumber || 1) - 1
    return templates[index] || Template1
  }, [templateNumber])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Đang tải bài đăng...</p>
        </div>
      </div>
    )
  }

  if (isError || !post || !templateProps) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-white'>
        <div className='text-center'>
          <p className='text-xl text-gray-600 mb-4'>Không tìm thấy bài đăng</p>
          <button
            onClick={() => navigate(-1)}
            className='px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors'
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | FestAvenue</title>
        <meta name='description' content={post.subtitle} />
        <meta property='og:title' content={post.title} />
        <meta property='og:description' content={post.subtitle} />
        <meta property='og:image' content={post.bannerUrl} />
      </Helmet>
      <TemplateComponent {...templateProps} />
      {isFetching && (
        <div className='fixed bottom-4 right-4 bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-white rounded-full animate-bounce'></div>
            <span>Đang cập nhật...</span>
          </div>
        </div>
      )}
    </>
  )
}

export default SocialMediaDetail

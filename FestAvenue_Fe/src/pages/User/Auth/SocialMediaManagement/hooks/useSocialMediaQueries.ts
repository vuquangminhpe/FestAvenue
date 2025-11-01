import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import serviceSocialMediaApis from '@/apis/serviceSocialMedia.api'
import type {
  BodySocialPost,
  bodyCommentInPost,
  bodyDeleteCommentInPost,
  bodyUpdateCommentInImagePost,
  bodyListPostSocialMedia,
  queryReactionImagePost
} from '@/types/serviceSocialMedia.types'

/**
 * Query keys để quản lý cache
 */
export const socialMediaKeys = {
  all: ['socialMedia'] as const,
  lists: () => [...socialMediaKeys.all, 'list'] as const,
  list: (filters: bodyListPostSocialMedia) => [...socialMediaKeys.lists(), filters] as const,
  details: () => [...socialMediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...socialMediaKeys.details(), id] as const,
  top5Latest: (eventCode: string) => [...socialMediaKeys.all, 'top5Latest', eventCode] as const
}

/**
 * Hook để lấy danh sách social media posts với paging và filter
 */
export const useSocialMediaList = (filters: bodyListPostSocialMedia) => {
  return useQuery({
    queryKey: socialMediaKeys.list(filters),
    queryFn: async () => {
      const response = await serviceSocialMediaApis.getPostSocialMediaWithPagingAndFilter(filters)
      return response
    },
    enabled: !!filters.eventCode,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000 // 5 minutes
  })
}

/**
 * Hook để lấy top 5 bài viết mới nhất theo event code
 */
export const useTop5LatestPosts = (eventCode: string) => {
  return useQuery({
    queryKey: socialMediaKeys.top5Latest(eventCode),
    queryFn: async () => {
      const response = await serviceSocialMediaApis.getTop5LatestPostByEventCode(eventCode)
      return response
    },
    enabled: !!eventCode,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000
  })
}

/**
 * Hook để lấy chi tiết 1 bài post
 */
export const useSocialMediaDetail = (postId: string) => {
  return useQuery({
    queryKey: socialMediaKeys.detail(postId),
    queryFn: async () => {
      const response = await serviceSocialMediaApis.getPostSocialMediaByPostSocialMediaId(postId)
      return response
    },
    enabled: !!postId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000
  })
}

/**
 * Hook để tạo mới social media post
 */
export const useCreateSocialMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: BodySocialPost) => {
      return await serviceSocialMediaApis.createPostSocialMedia(body)
    },
    onSuccess: (_data, variables) => {
      toast.success('Tạo bài viết thành công!')
      // Invalidate all list queries for this event
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.lists()
      })
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.top5Latest(variables.eventCode)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Tạo bài viết thất bại'
      toast.error(errorMessage)
      console.error('Create social media error:', error)
    }
  })
}

/**
 * Hook để cập nhật social media post
 */
export const useUpdateSocialMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: BodySocialPost & { postSocialMediaId: string }) => {
      return await serviceSocialMediaApis.updatePostSocialMedia(body)
    },
    onSuccess: (_data, variables) => {
      toast.success('Cập nhật bài viết thành công!')
      // Invalidate specific post detail
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.detail(variables.postSocialMediaId)
      })
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.lists()
      })
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.top5Latest(variables.eventCode)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Cập nhật bài viết thất bại'
      toast.error(errorMessage)
      console.error('Update social media error:', error)
    }
  })
}

/**
 * Hook để xóa social media post
 */
export const useDeleteSocialMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      return await serviceSocialMediaApis.deletePostSocialMedia(postId)
    },
    onSuccess: () => {
      toast.success('Xóa bài viết thành công!')
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.lists()
      })
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.all
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Xóa bài viết thất bại'
      toast.error(errorMessage)
      console.error('Delete social media error:', error)
    }
  })
}

/**
 * Hook để thả tim/hủy thả tim trong hình ảnh bài đăng
 */
export const useReactionImageInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (query: queryReactionImagePost) => {
      return await serviceSocialMediaApis.reactionImageInPost(query)
    },
    onSuccess: (_data, variables) => {
      // toast.success(data?.message || 'Thành công!')
      // Invalidate detail để refresh reactions
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.detail(variables.postId)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Thao tác thất bại'
      toast.error(errorMessage)
      console.error('Reaction error:', error)
    }
  })
}

/**
 * Hook để comment vào hình ảnh bài đăng
 */
export const useCommentImageInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: bodyCommentInPost) => {
      return await serviceSocialMediaApis.commentImageInPost(body)
    },
    onSuccess: (_data, variables) => {
      toast.success('Đã thêm bình luận!')
      // Invalidate detail để refresh comments
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.detail(variables.postSocialMediaId)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Thêm bình luận thất bại'
      toast.error(errorMessage)
      console.error('Comment error:', error)
    }
  })
}

/**
 * Hook để xóa comment
 */
export const useDeleteCommentInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: bodyDeleteCommentInPost) => {
      return await serviceSocialMediaApis.deleteCommentInImagePost(body)
    },
    onSuccess: (_data, variables) => {
      toast.success('Đã xóa bình luận!')
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.detail(variables.postSocialMediaId)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Xóa bình luận thất bại'
      toast.error(errorMessage)
      console.error('Delete comment error:', error)
    }
  })
}

/**
 * Hook để cập nhật comment
 */
export const useUpdateCommentInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: bodyUpdateCommentInImagePost) => {
      return await serviceSocialMediaApis.updateCommentInImagePost(body)
    },
    onSuccess: (_data, variables) => {
      toast.success('Đã cập nhật bình luận!')
      queryClient.invalidateQueries({
        queryKey: socialMediaKeys.detail(variables.postSocialMediaId)
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Cập nhật bình luận thất bại'
      toast.error(errorMessage)
      console.error('Update comment error:', error)
    }
  })
}

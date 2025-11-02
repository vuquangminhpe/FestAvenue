import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serviceSocialMediaApis from '@/apis/serviceSocialMedia.api'
import type {
  bodyCommentInPost,
  bodyDeleteCommentInPost,
  bodyUpdateCommentInImagePost,
  queryReactionImagePost
} from '@/types/serviceSocialMedia.types'

// Query keys
export const socialMediaDetailKeys = {
  all: ['socialMediaDetail'] as const,
  detail: (postId: string) => [...socialMediaDetailKeys.all, 'detail', postId] as const
}

/**
 * Hook để lấy chi tiết bài đăng social media theo postId
 */
export const useGetPostDetail = (postId: string) => {
  return useQuery({
    queryKey: socialMediaDetailKeys.detail(postId),
    queryFn: async () => {
      const response = await serviceSocialMediaApis.getPostSocialMediaByPostSocialMediaId(postId)
      return response?.data
    },
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  })
}

/**
 * Hook để reaction (like/unlike) trong ảnh bài đăng
 */
export const useReactionImageInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: queryReactionImagePost) => {
      const response = await serviceSocialMediaApis.reactionImageInPost(data)
      return response
    },
    onSuccess: async (_, variables) => {
      // Invalidate và refetch post detail để cập nhật số lượng reactions
      await queryClient.invalidateQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postId),
        refetchType: 'active'
      })
      // Force refetch để đảm bảo data được update
      await queryClient.refetchQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postId)
      })
    }
  })
}

/**
 * Hook để comment trong ảnh bài đăng
 */
export const useCommentImageInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: bodyCommentInPost) => {
      const response = await serviceSocialMediaApis.commentImageInPost(data)
      return response
    },
    onSuccess: async (_, variables) => {
      // Invalidate và refetch post detail để cập nhật danh sách comments
      await queryClient.invalidateQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId),
        refetchType: 'active'
      })
      // Force refetch để đảm bảo data được update
      await queryClient.refetchQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId)
      })
    }
  })
}

/**
 * Hook để xóa comment trong ảnh bài đăng
 */
export const useDeleteCommentInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: bodyDeleteCommentInPost) => {
      const response = await serviceSocialMediaApis.deleteCommentInImagePost(data)
      return response
    },
    onSuccess: async (_, variables) => {
      // Invalidate và refetch post detail để cập nhật danh sách comments
      await queryClient.invalidateQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId),
        refetchType: 'active'
      })
      // Force refetch để đảm bảo data được update
      await queryClient.refetchQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId)
      })
    }
  })
}

/**
 * Hook để update comment trong ảnh bài đăng
 */
export const useUpdateCommentInPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: bodyUpdateCommentInImagePost) => {
      const response = await serviceSocialMediaApis.updateCommentInImagePost(data)
      return response
    },
    onSuccess: async (_, variables) => {
      // Invalidate và refetch post detail để cập nhật comment
      await queryClient.invalidateQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId),
        refetchType: 'active'
      })
      // Force refetch để đảm bảo data được update
      await queryClient.refetchQueries({
        queryKey: socialMediaDetailKeys.detail(variables.postSocialMediaId)
      })
    }
  })
}

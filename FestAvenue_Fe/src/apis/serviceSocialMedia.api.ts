import type { APIResponse } from '@/types/API.types'
import type {
  queryReactionImagePost,
  BodySocialPost,
  SocialPostRes,
  top5latestRes,
  bodyCommentInPost,
  bodyDeleteCommentInPost,
  bodyUpdateCommentInImagePost,
  bodyListPostSocialMedia,
  resListPostSocialMedia,
  getReactionAndCommentInPostSocialMediaDetails,
  resReactionAndCommentInPostSocialMediaDetails
} from '@/types/serviceSocialMedia.types'
import http from '@/utils/http'

const serviceSocialMediaApis = {
  createPostSocialMedia: async (body: BodySocialPost) => {
    const data = await http.post<APIResponse<SocialPostRes>>('/post-social-media/create-post-social-media', body)
    return data?.data
  },
  updatePostSocialMedia: async (body: BodySocialPost & { postSocialMediaId: string }) => {
    const data = await http.put<APIResponse<SocialPostRes>>('/post-social-media/update-post-social-media', body)
    return data?.data
  },
  getTop5LatestPostByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<top5latestRes[]>>(
      `/post-social-media/get-top5-latest-post-by-event-code?eventCode=${eventCode}`
    )
    return data?.data
  },
  getPostSocialMediaByPostSocialMediaId: async (postId: string) => {
    const data = await http.get<APIResponse<SocialPostRes>>(
      `/post-social-media/get-post-social-media-by-id?postId=${postId}`
    )
    return data?.data
  },
  deletePostSocialMedia: async (postId: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(
      `/post-social-media/delete-post-social-media?postId=${postId}`
    )
    return data?.data
  },
  // Tìm/Hủy thả tim trong bài đăng
  reactionImageInPost: async (query: queryReactionImagePost) => {
    const data = await http.post<APIResponse<{ message: string }>>(
      `/post-social-media/reaction-image-in-post`,
      undefined,
      {
        params: query
      }
    )
    return data?.data
  },
  // user comment trong hình ảnh bài đăng
  commentImageInPost: async (body: bodyCommentInPost) => {
    const data = await http.post<APIResponse<{ message: string }>>('/post-social-media/comment-image-in-post', body)
    return data?.data
  },
  deleteCommentInImagePost: async (body: bodyDeleteCommentInPost) => {
    const data = await http.delete<APIResponse<{ message: string }>>(
      '/post-social-media/delete-comment-in-image-post',
      { data: body }
    )
    return data?.data
  },
  updateCommentInImagePost: async (body: bodyUpdateCommentInImagePost) => {
    const data = await http.put<APIResponse<{ message: string }>>(
      '/post-social-media/update-comment-in-image-post',
      body
    )
    return data?.data
  },
  getPostSocialMediaWithPagingAndFilter: async (body: bodyListPostSocialMedia) => {
    const data = await http.post<APIResponse<resListPostSocialMedia>>(
      '/post-social-media/get-post-social-media-with-paging-and-filter',
      body
    )
    return data?.data
  },
  getCommentAndReactionInPostSocialMediaDetailsWithPaging: async (
    body: getReactionAndCommentInPostSocialMediaDetails
  ) => {
    const data = await http.post<APIResponse<resReactionAndCommentInPostSocialMediaDetails>>(
      '/post-social-media/get-reaction-and-comment-in-post-social-media-detail-with-paging',
      body
    )
    return data?.data
  }
}
export default serviceSocialMediaApis

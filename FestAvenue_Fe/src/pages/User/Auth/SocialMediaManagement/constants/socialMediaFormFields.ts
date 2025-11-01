/**
 * Configuration cho các field trong Social Media Post Form
 */

export interface FormFieldConfig {
  name: string
  label: string
  placeholder?: string
  type: 'text' | 'textarea' | 'url' | 'datetime' | 'select' | 'array' | 'editor'
  required: boolean
  description?: string
  options?: Array<{ label: string; value: number | string }>
}

/**
 * Social Media Post Status
 */
export const PostStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
  ARCHIVED: 2
} as const

export type PostStatusType = (typeof PostStatus)[keyof typeof PostStatus]

export const POST_STATUS_OPTIONS = [
  { label: 'Bản nháp', value: PostStatus.DRAFT },
  { label: 'Đã xuất bản', value: PostStatus.PUBLISHED },
  { label: 'Đã lưu trữ', value: PostStatus.ARCHIVED }
]

/**
 * Social Media Platforms
 */
export const SocialPlatform = {
  FACEBOOK: 0,
  INSTAGRAM: 1,
  TWITTER: 2,
  YOUTUBE: 3,
  TIKTOK: 4,
  LINKEDIN: 5,
  PINTEREST: 6,
  TELEGRAM: 7,
  DISCORD: 8,
  ZALO: 9,
  OTHER: 10
} as const

export type SocialPlatformType = (typeof SocialPlatform)[keyof typeof SocialPlatform]

export const SOCIAL_PLATFORM_OPTIONS = [
  { label: 'Facebook', value: SocialPlatform.FACEBOOK },
  { label: 'Instagram', value: SocialPlatform.INSTAGRAM },
  { label: 'Twitter/X', value: SocialPlatform.TWITTER },
  { label: 'YouTube', value: SocialPlatform.YOUTUBE },
  { label: 'TikTok', value: SocialPlatform.TIKTOK },
  { label: 'LinkedIn', value: SocialPlatform.LINKEDIN },
  { label: 'Pinterest', value: SocialPlatform.PINTEREST },
  { label: 'Telegram', value: SocialPlatform.TELEGRAM },
  { label: 'Discord', value: SocialPlatform.DISCORD },
  { label: 'Zalo', value: SocialPlatform.ZALO },
  { label: 'Khác', value: SocialPlatform.OTHER }
]

/**
 * Main form fields configuration
 */
export const SOCIAL_MEDIA_FORM_FIELDS: FormFieldConfig[] = [
  {
    name: 'title',
    label: 'Tiêu đề',
    placeholder: 'Nhập tiêu đề bài viết',
    type: 'text',
    required: true,
    description: 'Tiêu đề chính của bài viết (3-200 ký tự)'
  },
  {
    name: 'subtitle',
    label: 'Phụ đề',
    placeholder: 'Nhập phụ đề (tùy chọn)',
    type: 'text',
    required: false,
    description: 'Phụ đề bổ sung (tối đa 300 ký tự)'
  },
  {
    name: 'description',
    label: 'Mô tả ngắn',
    placeholder: 'Nhập mô tả ngắn gọn về bài viết',
    type: 'textarea',
    required: true,
    description: 'Mô tả ngắn gọn để hiển thị trong danh sách (10-500 ký tự)'
  },
  {
    name: 'bannerUrl',
    label: 'URL Banner',
    placeholder: 'https://example.com/banner.jpg',
    type: 'url',
    required: true,
    description: 'Hình ảnh banner chính của bài viết'
  },
  {
    name: 'body',
    label: 'Nội dung',
    placeholder: 'Nhập nội dung chi tiết bài viết...',
    type: 'editor',
    required: true,
    description: 'Nội dung chi tiết của bài viết (tối thiểu 20 ký tự)'
  },
  {
    name: 'statusPostSocialMedia',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: POST_STATUS_OPTIONS,
    description: 'Trạng thái xuất bản của bài viết'
  },
  {
    name: 'publishDate',
    label: 'Ngày xuất bản',
    type: 'datetime',
    required: true,
    description: 'Ngày và giờ bài viết sẽ được xuất bản'
  },
  {
    name: 'expiryDate',
    label: 'Ngày hết hạn',
    type: 'datetime',
    required: true,
    description: 'Ngày và giờ bài viết sẽ hết hiệu lực'
  },
  {
    name: 'videoUrl',
    label: 'URL Video',
    placeholder: 'https://youtube.com/watch?v=...',
    type: 'url',
    required: false,
    description: 'Link video đính kèm (tùy chọn)'
  },
  {
    name: 'audioUrl',
    label: 'URL Audio',
    placeholder: 'https://example.com/audio.mp3',
    type: 'url',
    required: false,
    description: 'Link audio đính kèm (tùy chọn)'
  },
  {
    name: 'imageInPosts',
    label: 'Hình ảnh trong bài viết',
    type: 'array',
    required: false,
    description: 'Danh sách hình ảnh kèm caption'
  },
  {
    name: 'socialLinks',
    label: 'Liên kết mạng xã hội',
    type: 'array',
    required: false,
    description: 'Các liên kết đến mạng xã hội liên quan'
  }
]

/**
 * Default values cho form
 */
export const SOCIAL_MEDIA_DEFAULT_VALUES: {
  title: string
  subtitle: string
  description: string
  bannerUrl: string
  body: string
  statusPostSocialMedia: number
  imageInPosts: Array<{ url: string; caption: string }>
  videoUrl: string
  audioUrl: string
  publishDate: string
  expiryDate: string
  socialLinks: Array<{ platform: number; url: string }>
} = {
  title: '',
  subtitle: '',
  description: '',
  bannerUrl: '',
  body: '',
  statusPostSocialMedia: PostStatus.DRAFT,
  imageInPosts: [],
  videoUrl: '',
  audioUrl: '',
  publishDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  socialLinks: []
}

/**
 * Helper function để get platform label
 */
export const getSocialPlatformLabel = (platform: number): string => {
  const option = SOCIAL_PLATFORM_OPTIONS.find((opt) => opt.value === platform)
  return option?.label || 'Unknown'
}

/**
 * Helper function để get status label
 */
export const getPostStatusLabel = (status: number): string => {
  const option = POST_STATUS_OPTIONS.find((opt) => opt.value === status)
  return option?.label || 'Unknown'
}

/**
 * Helper function để get status color
 */
export const getPostStatusColor = (status: number): string => {
  switch (status) {
    case PostStatus.DRAFT:
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case PostStatus.PUBLISHED:
      return 'bg-green-100 text-green-800 border-green-300'
    case PostStatus.ARCHIVED:
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

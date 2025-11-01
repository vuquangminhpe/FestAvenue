import { z } from 'zod'

/**
 * Validation schema cho Social Media Post Form
 * Sử dụng Zod để validate dữ liệu trước khi submit
 */
export const socialMediaPostSchema = z
  .object({
    title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề không được quá 200 ký tự'),

    subtitle: z.string().max(300, 'Phụ đề không được quá 300 ký tự'),

    description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').max(500, 'Mô tả không được quá 500 ký tự'),

    bannerUrl: z.string().url('URL banner không hợp lệ').min(1, 'Banner là bắt buộc'),

    body: z.string().min(20, 'Nội dung phải có ít nhất 20 ký tự').max(50000, 'Nội dung không được quá 50000 ký tự'),

    statusPostSocialMedia: z.number().int().min(0, 'Trạng thái không hợp lệ').max(2, 'Trạng thái không hợp lệ'),

    imageInPosts: z.array(
      z.object({
        url: z.string().url('URL hình ảnh không hợp lệ'),
        caption: z.string().max(500, 'Caption không được quá 500 ký tự')
      })
    ),

    videoUrl: z.string(),

    audioUrl: z.string(),

    publishDate: z.string().datetime('Ngày xuất bản không hợp lệ'),

    expiryDate: z.string().datetime('Ngày hết hạn không hợp lệ'),

    socialLinks: z.array(
      z.object({
        platform: z.number().int().min(0).max(10),
        url: z.string().url('URL social link không hợp lệ')
      })
    )
  })
  .refine((data) => new Date(data.expiryDate) > new Date(data.publishDate), {
    message: 'Ngày hết hạn phải sau ngày xuất bản',
    path: ['expiryDate']
  })

/**
 * Type inference từ schema
 */
export type SocialMediaPostFormData = z.infer<typeof socialMediaPostSchema>

/**
 * Validation schema cho comment
 */
export const commentSchema = z.object({
  postSocialMediaId: z.string().uuid('Post ID không hợp lệ'),
  imageInPostId: z.string().uuid('Image ID không hợp lệ'),
  commentText: z.string().min(1, 'Comment không được để trống').max(1000, 'Comment không được quá 1000 ký tự')
})

export type CommentFormData = z.infer<typeof commentSchema>

/**
 * Validation schema cho filter/search
 */
export const socialMediaFilterSchema = z.object({
  eventCode: z.string().min(1, 'Event code là bắt buộc'),
  searchSocialPost: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  pagination: z.object({
    orderBy: z.string().optional(),
    pageIndex: z.number().int().min(1).default(1),
    isPaging: z.boolean().default(true),
    pageSize: z.number().int().min(1).max(100).default(10)
  })
})

export type SocialMediaFilterFormData = z.infer<typeof socialMediaFilterSchema>

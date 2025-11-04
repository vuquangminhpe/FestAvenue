import { z } from 'zod'

// ============================================
// CUSTOM VALIDATORS
// ============================================

// // Validate URL with proper format
// const urlValidator = (fieldName: string, required: boolean = true) => {
//   if (required) {
//     return z
//       .string()
//       .min(1, `${fieldName} là bắt buộc`)
//       .refine(
//         (url) => {
//           try {
//             const parsed = new URL(url)
//             return ['http:', 'https:'].includes(parsed.protocol)
//           } catch {
//             return false
//           }
//         },
//         { message: `${fieldName} phải là URL hợp lệ (bắt đầu với http:// hoặc https://)` }
//       )
//   } else {
//     return z
//       .string()
//       .refine(
//         (url) => {
//           if (!url || url.length === 0) return true
//           try {
//             const parsed = new URL(url)
//             return ['http:', 'https:'].includes(parsed.protocol)
//           } catch {
//             return false
//           }
//         },
//         { message: `${fieldName} phải là URL hợp lệ (bắt đầu với http:// hoặc https://)` }
//       )
//       .optional()
//       .or(z.literal(''))
//   }
// }

// Validate meaningful text content
const meaningfulTextValidator = (minLength: number, maxLength: number, fieldName: string, minWords: number = 2) => {
  return z
    .string()
    .min(minLength, `${fieldName} phải có ít nhất ${minLength} ký tự`)
    .max(maxLength, `${fieldName} không được quá ${maxLength} ký tự`)
    .refine((text) => text.trim().length >= minLength, {
      message: `${fieldName} không được chỉ chứa khoảng trắng`
    })
    .refine(
      (text) => {
        // Must start with a letter
        const firstChar = text.trim()[0]
        return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
      },
      {
        message: `${fieldName} phải bắt đầu bằng chữ cái, không được bắt đầu bằng số hoặc ký tự đặc biệt`
      }
    )
    .refine(
      (text) => {
        const words = text.trim().split(/\s+/)
        return words.length >= minWords
      },
      {
        message: `${fieldName} phải có ít nhất ${minWords} từ`
      }
    )
    .refine(
      (text) => {
        // Must contain meaningful content (at least 40% letters)
        const letters =
          text.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
        const totalChars = text.replace(/\s/g, '').length
        return letters.length / totalChars >= 0.4
      },
      {
        message: `${fieldName} phải chứa nội dung có ý nghĩa, không được chỉ là số hoặc ký tự đặc biệt`
      }
    )
    .refine(
      (text) => {
        // Check for content diversity
        const trimmed = text.trim().replace(/\s/g, '')
        const uniqueChars = new Set(trimmed.toLowerCase())
        return uniqueChars.size >= Math.min(5, minLength / 2)
      },
      {
        message: `${fieldName} phải có nội dung đa dạng, không được lặp lại ký tự`
      }
    )
}

// ============================================
// SOCIAL MEDIA TEMPLATE VALIDATION SCHEMA
// ============================================

export const socialMediaImageSchema = z.object({
  id: z.string(),
  url: z
    .string()
    .min(1, 'URL hình ảnh là bắt buộc')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      },
      { message: 'URL hình ảnh phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
    ),
  caption: z.string().max(200, 'Mô tả hình ảnh không được quá 200 ký tự').optional().or(z.literal('')),
  likes: z.number().optional(),
  reactions: z.array(z.any()).optional(),
  comments: z.array(z.any()).optional()
})

export const socialLinkSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'youtube'], {
    message: 'Vui lòng chọn nền tảng mạng xã hội hợp lệ'
  }),
  url: z
    .string()
    .min(1, 'URL mạng xã hội là bắt buộc')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      },
      { message: 'URL mạng xã hội phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
    )
})

export const templateEditorSchema = z
  .object({
    // Basic Information
    title: meaningfulTextValidator(5, 200, 'Tiêu đề', 2),

    subtitle: z.string().max(300, 'Phụ đề không được quá 300 ký tự').optional().or(z.literal('')),

    description: meaningfulTextValidator(20, 2000, 'Mô tả', 5),

    // Media
    bannerUrl: z
      .string()
      .min(1, 'URL Banner là bắt buộc')
      .refine(
        (url) => {
          try {
            const parsed = new URL(url)
            return ['http:', 'https:'].includes(parsed.protocol)
          } catch {
            return false
          }
        },
        { message: 'URL Banner phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
      ),

    // Author Info
    authorName: meaningfulTextValidator(3, 100, 'Tên tác giả', 1),

    authorAvatar: z
      .string()
      .refine(
        (url) => {
          if (!url || url.length === 0) return true
          try {
            const parsed = new URL(url)
            return ['http:', 'https:'].includes(parsed.protocol)
          } catch {
            return false
          }
        },
        { message: 'Avatar tác giả phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
      )
      .optional()
      .or(z.literal('')),

    // Event Details
    eventDate: z
      .string()
      .min(1, 'Ngày sự kiện là bắt buộc')
      .refine(
        (date) => {
          // Accept various date formats
          return date.trim().length >= 3
        },
        { message: 'Ngày sự kiện phải có định dạng hợp lệ' }
      )
      .optional()
      .or(z.literal('')),

    eventLocation: z
      .string()
      .min(5, 'Địa điểm phải có ít nhất 5 ký tự')
      .max(500, 'Địa điểm không được quá 500 ký tự')
      .refine(
        (location) => {
          if (!location) return true
          const words = location.trim().split(/\s+/)
          return words.length >= 2
        },
        { message: 'Địa điểm phải có ít nhất 2 từ' }
      )
      .optional()
      .or(z.literal('')),

    // Content
    content: meaningfulTextValidator(30, 10000, 'Nội dung', 10),

    // Collections
    images: z.array(socialMediaImageSchema).min(1, 'Cần có ít nhất 1 hình ảnh').max(20, 'Tối đa 20 hình ảnh'),

    socialLinks: z.array(socialLinkSchema).max(10, 'Tối đa 10 liên kết mạng xã hội')
  })
  .refine(
    (data) => {
      // Ensure all images have valid URLs
      return data.images.every((img) => img.url && img.url.trim().length > 0)
    },
    {
      message: 'Tất cả hình ảnh phải có URL hợp lệ',
      path: ['images']
    }
  )
  .refine(
    (data) => {
      // Check for duplicate social platforms
      if (data.socialLinks && data.socialLinks.length > 0) {
        const platforms = data.socialLinks.map((link) => link.platform)
        const uniquePlatforms = new Set(platforms)
        return platforms.length === uniquePlatforms.size
      }
      return true
    },
    {
      message: 'Không được có nền tảng mạng xã hội trùng lặp',
      path: ['socialLinks']
    }
  )

export type TemplateEditorFormData = z.infer<typeof templateEditorSchema>

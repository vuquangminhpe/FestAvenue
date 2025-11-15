import { z } from 'zod'

// ============================================
// CUSTOM VALIDATORS
// ============================================

// Validate Vietnamese phone number
const vietnamesePhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
const phoneValidator = z.string().refine(
  (phone) => {
    if (!phone) return true // Optional
    return vietnamesePhoneRegex.test(phone.replace(/\s/g, ''))
  },
  { message: 'Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx' }
)

// Validate URL with proper format
const isValidHttpUrl = (url?: string) => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const urlValidator = (fieldName: string) =>
  z
    .union([
      z.string().refine((url) => (url ? isValidHttpUrl(url) : true), {
        message: `${fieldName} phải là URL hợp lệ (bắt đầu với http:// hoặc https://)`
      }),
      z.literal(''),
      z.undefined()
    ])
    .optional()

const requiredUrlValidator = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} là bắt buộc`)
    .refine((url) => isValidHttpUrl(url), {
      message: `${fieldName} phải là URL hợp lệ (bắt đầu với http:// hoặc https://)`
    })

// Validate event name - MUST START WITH LETTER & CONTAIN MEANINGFUL CONTENT
const eventNameValidator = z
  .string()
  .min(3, 'Tên sự kiện phải có ít nhất 3 ký tự')
  .max(200, 'Tên sự kiện không được quá 200 ký tự')
  .refine((name) => name.trim().length >= 3, {
    message: 'Tên sự kiện không được chỉ chứa khoảng trắng'
  })
  .refine(
    (name) => {
      // Must start with a letter (Vietnamese or English)
      const firstChar = name.trim()[0]
      return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
    },
    {
      message: 'Tên sự kiện phải bắt đầu bằng chữ cái, không được bắt đầu bằng số hoặc ký tự đặc biệt'
    }
  )
  .refine(
    (name) => {
      // Must contain at least one letter (not just numbers)
      return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(name)
    },
    {
      message: 'Tên sự kiện phải chứa ít nhất một chữ cái, không được chỉ toàn số'
    }
  )
  .refine(
    (name) => {
      // Check if name has meaningful words (not just repeating characters)
      const trimmed = name.trim()
      const uniqueChars = new Set(trimmed.replace(/\s/g, '').toLowerCase())
      return uniqueChars.size >= 3 // At least 3 different characters
    },
    {
      message: 'Tên sự kiện phải có nội dung có ý nghĩa, không được lặp lại ký tự (ví dụ: "aaa", "111")'
    }
  )
  .refine(
    (name) => {
      // Must have at least 2 words for meaningful event name
      const words = name.trim().split(/\s+/)
      return words.length >= 2
    },
    {
      message: 'Tên sự kiện phải có ít nhất 2 từ (ví dụ: "Lễ hội âm nhạc", "Hội thảo công nghệ")'
    }
  )
  .refine(
    (name) => {
      // No excessive special characters
      return !/[<>{}[\]\\\/]{2,}/g.test(name)
    },
    {
      message: 'Tên sự kiện không được chứa nhiều ký tự đặc biệt liên tiếp'
    }
  )
  .refine(
    (name) => {
      // Check ratio of letters to total characters (at least 50%)
      const letters = name.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
      const totalChars = name.replace(/\s/g, '').length
      return letters.length / totalChars >= 0.5
    },
    {
      message: 'Tên sự kiện phải chứa nhiều chữ cái hơn (ít nhất 50% là chữ cái)'
    }
  )

// Validate capacity
const capacityValidator = z
  .number({ message: 'Sức chứa phải là số' })
  .int('Sức chứa phải là số nguyên')
  .min(1, 'Sức chứa tối thiểu là 1 người')
  .max(1000, 'Sức chứa tối đa là 1,000 người')
  .refine((val) => val > 0, { message: 'Sức chứa phải lớn hơn 0' })

// Validate coordinates
const latitudeValidator = z
  .number({ message: 'Vĩ độ phải là số' })
  .min(-90, 'Vĩ độ phải từ -90 đến 90')
  .max(90, 'Vĩ độ phải từ -90 đến 90')

const longitudeValidator = z
  .number({ message: 'Kinh độ phải là số' })
  .min(-180, 'Kinh độ phải từ -180 đến 180')
  .max(180, 'Kinh độ phải từ -180 đến 180')

// ============================================
// MAIN EVENT SCHEMA WITH ADVANCED VALIDATION
// ============================================

// Base event object schema (shared between create and update)
const baseEventObjectSchema = z.object({
  // ========== Basic Information ==========
  name: eventNameValidator,

  shortDescription: z
    .string()
    .min(10, 'Mô tả ngắn phải có ít nhất 10 ký tự')
    .max(300, 'Mô tả ngắn không được quá 300 ký tự')
    .refine((desc) => desc.trim().length >= 10, {
      message: 'Mô tả ngắn không được chỉ chứa khoảng trắng'
    })
    .refine((desc) => {
      const words = desc.trim().split(/\s+/)
      return words.length >= 3
    }, 'Mô tả ngắn phải có ít nhất 3 từ')
    .refine(
      (desc) => {
        // Must start with a letter
        const firstChar = desc.trim()[0]
        return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
      },
      {
        message: 'Mô tả phải bắt đầu bằng chữ cái, không được bắt đầu bằng số'
      }
    )
    .refine(
      (desc) => {
        // Check for meaningful content (not just numbers)
        const letters =
          desc.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
        const totalChars = desc.replace(/\s/g, '').length
        return letters.length / totalChars >= 0.4 // At least 40% letters
      },
      {
        message: 'Mô tả phải chứa nội dung có ý nghĩa, không được chỉ là số hoặc ký tự đặc biệt'
      }
    )
    .refine(
      (desc) => {
        // Check for repeating patterns (like "111111" or "aaaaaa")
        const trimmed = desc.trim().replace(/\s/g, '')
        const uniqueChars = new Set(trimmed.toLowerCase())
        return uniqueChars.size >= 5 // At least 5 different characters
      },
      {
        message: 'Mô tả phải có nội dung đa dạng, không được lặp lại ký tự (ví dụ: "111111", "aaaaaa")'
      }
    ),

  description: z
    .string()
    .min(50, 'Mô tả chi tiết phải có ít nhất 50 ký tự')
    .max(10000, 'Mô tả chi tiết không được quá 10,000 ký tự')
    .refine((desc) => desc.trim().length >= 50, {
      message: 'Mô tả chi tiết không được chỉ chứa khoảng trắng'
    })
    .refine((desc) => {
      const words = desc.trim().split(/\s+/)
      return words.length >= 10
    }, 'Mô tả chi tiết phải có ít nhất 10 từ')
    .refine(
      (desc) => {
        // Must start with a letter
        const firstChar = desc.trim()[0]
        return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
      },
      {
        message: 'Mô tả chi tiết phải bắt đầu bằng chữ cái, không được bắt đầu bằng số'
      }
    )
    .refine(
      (desc) => {
        // Check for meaningful content (at least 40% letters)
        const letters =
          desc.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
        const totalChars = desc.replace(/\s/g, '').length
        return letters.length / totalChars >= 0.4
      },
      {
        message: 'Mô tả phải chứa nội dung có ý nghĩa, không được chỉ là số hoặc ký tự đặc biệt'
      }
    )
    .refine(
      (desc) => {
        // Check for content diversity
        const trimmed = desc.trim().replace(/\s/g, '')
        const uniqueChars = new Set(trimmed.toLowerCase())
        return uniqueChars.size >= 10 // At least 10 different characters for long description
      },
      {
        message: 'Mô tả chi tiết phải có nội dung đa dạng và có ý nghĩa, không được lặp lại ký tự'
      }
    )
    .refine(
      (desc) => {
        // Check if contains at least some sentences (has punctuation)
        const hasPunctuation = /[.!?,;:]/.test(desc)
        return hasPunctuation || desc.length < 100 // Short descriptions might not need punctuation
      },
      {
        message: 'Mô tả chi tiết nên có dấu câu (. ! ? , ;) để dễ đọc hơn'
      }
    ),

  categoryId: z.string().min(1, 'Vui lòng chọn danh mục sự kiện'),

  // ========== Event Type & Visibility ==========

  visibility: z.number().min(0, 'Vui lòng chọn chế độ hiển thị').max(2, 'Chế độ hiển thị không hợp lệ'),

  capacity: capacityValidator,

  // ========== New Time Fields - Event Lifecycle Covers All ==========
  startEventLifecycleTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu vòng đời sự kiện'),
  endEventLifecycleTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc vòng đời sự kiện'),
  startTicketSaleTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu bán vé'),
  endTicketSaleTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc bán vé'),
  startTimeEventTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu sự kiện'),
  endTimeEventTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc sự kiện'),

  // ========== Media - AI Detection Required ==========
  logoUrl: z
    .string()
    .min(1, 'Logo sự kiện là bắt buộc')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      },
      { message: 'Logo phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
    ),

  bannerUrl: z
    .string()
    .min(1, 'Banner sự kiện là bắt buộc')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      },
      { message: 'Banner phải là URL hợp lệ (bắt đầu với http:// hoặc https://)' }
    ),

  trailerUrl: urlValidator('Video trailer'),

  // ========== Contact & Website ==========
  website: requiredUrlValidator('Website'),

  publicContactEmail: z
    .string()
    .min(1, 'Email liên hệ công khai là bắt buộc')
    .refine((email) => email.trim().length > 0, {
      message: 'Email liên hệ công khai không được chỉ chứa khoảng trắng'
    })
    .email('Email không hợp lệ')
    .refine(
      (email) => {
        // Check for common typos
        const domain = email.split('@')[1]
        return domain && domain.includes('.')
      },
      { message: 'Email phải có tên miền hợp lệ (ví dụ: @gmail.com)' }
    ),

  publicContactPhone: phoneValidator.refine((phone) => phone?.trim().length > 0, {
    message: 'Số điện thoại liên hệ là bắt buộc'
  }),

  // ========== Location ==========
  location: z.object({
    venueId: z.string().optional(),
    address: z.object({
      street: z
        .string()
        .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
        .max(500, 'Địa chỉ không được quá 500 ký tự')
        .refine((street) => street.trim().length >= 5, {
          message: 'Địa chỉ không được chỉ chứa khoảng trắng'
        })
        .refine((street) => {
          const words = street.trim().split(/\s+/)
          return words.length >= 2
        }, 'Địa chỉ phải có ít nhất 2 từ (ví dụ: Số nhà, Tên đường)'),

      city: z
        .string()
        .min(1, 'Vui lòng chọn tỉnh/thành phố')
        .refine((city) => city !== '', { message: 'Vui lòng chọn tỉnh/thành phố từ danh sách' }),

      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(1, 'Vui lòng chọn quốc gia').default('Việt Nam')
    }),
    coordinates: z.object({
      latitude: latitudeValidator,
      longitude: longitudeValidator
    })
  }),

  // ========== Hashtags ==========
  hashtags: z
    .array(
      z
        .string()
        .min(1, 'Hashtag không được để trống')
        .max(50, 'Hashtag không được quá 50 ký tự')
        .refine(
          (tag) => /^[a-zA-Z0-9_àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]+$/.test(tag),
          {
            message: 'Hashtag chỉ được chứa chữ cái, số và dấu gạch dưới'
          }
        )
    )
    .optional(),

  // ========== Organization - Required for creating event ==========
  organization: z.object({
    name: z
      .string()
      .min(3, 'Tên tổ chức phải có ít nhất 3 ký tự')
      .max(200, 'Tên tổ chức không được quá 200 ký tự')
      .refine((name) => name.trim().length >= 3, {
        message: 'Tên tổ chức không được chỉ chứa khoảng trắng'
      })
      .refine(
        (name) => {
          // Must start with a letter
          const firstChar = name.trim()[0]
          return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
        },
        {
          message: 'Tên tổ chức phải bắt đầu bằng chữ cái'
        }
      )
      .refine(
        (name) => {
          // Check for meaningful content
          const letters =
            name.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
          const totalChars = name.replace(/\s/g, '').length
          return letters.length / totalChars >= 0.5
        },
        {
          message: 'Tên tổ chức phải chứa nội dung có ý nghĩa, không được chỉ là số'
        }
      )
      .refine(
        (name) => {
          // Check for diversity
          const uniqueChars = new Set(name.trim().replace(/\s/g, '').toLowerCase())
          return uniqueChars.size >= 3
        },
        {
          message: 'Tên tổ chức phải có nội dung đa dạng, không được lặp lại ký tự'
        }
      ),

    description: z
      .string()
      .min(10, 'Mô tả tổ chức phải có ít nhất 10 ký tự')
      .max(2000, 'Mô tả tổ chức không được quá 2000 ký tự')
      .refine((desc) => desc.trim().length >= 10, {
        message: 'Mô tả tổ chức không được chỉ chứa khoảng trắng'
      })
      .refine(
        (desc) => {
          const words = desc.trim().split(/\s+/)
          return words.length >= 3
        },
        {
          message: 'Mô tả tổ chức phải có ít nhất 3 từ'
        }
      )
      .refine(
        (desc) => {
          // Must start with a letter
          const firstChar = desc.trim()[0]
          return /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)
        },
        {
          message: 'Mô tả tổ chức phải bắt đầu bằng chữ cái'
        }
      )
      .refine(
        (desc) => {
          // Check for meaningful content
          const letters =
            desc.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
          const totalChars = desc.replace(/\s/g, '').length
          return letters.length / totalChars >= 0.4
        },
        {
          message: 'Mô tả tổ chức phải chứa nội dung có ý nghĩa, không được chỉ là số'
        }
      )
      .refine(
        (desc) => {
          // Check for diversity
          const uniqueChars = new Set(desc.trim().replace(/\s/g, '').toLowerCase())
          return uniqueChars.size >= 5
        },
        {
          message: 'Mô tả tổ chức phải có nội dung đa dạng, không được lặp lại ký tự'
        }
      ),

    logo: urlValidator('Logo tổ chức').refine((url) => url !== '' && url !== undefined, {
      message: 'Logo tổ chức là bắt buộc'
    }),

    website: urlValidator('Website tổ chức'),

    contact: z.object({
      email: z
        .string()
        .email('Email tổ chức không hợp lệ')
        .refine(
          (email) => {
            const domain = email.split('@')[1]
            return domain && domain.includes('.')
          },
          { message: 'Email phải có tên miền hợp lệ' }
        ),

      phone: phoneValidator.refine((phone) => phone && phone.length > 0, {
        message: 'Số điện thoại tổ chức là bắt buộc'
      }),

      fax: phoneValidator.optional().or(z.literal(''))
    })
  })
})

// ============================================
// SHARED VALIDATION REFINEMENTS HELPER
// ============================================

// Helper function to apply common refinements to a schema
function applyCommonRefinements<T extends typeof baseEventObjectSchema>(schema: T) {
  return (
    schema
      // 1. EventLifecycleTime validation - end must be after start
      .refine(
        (data) => {
          const start = new Date(data.startEventLifecycleTime)
          const end = new Date(data.endEventLifecycleTime)
          return end >= start
        },
        {
          message: 'Thời gian kết thúc vòng đời phải sau hoặc bằng thời gian bắt đầu',
          path: ['endEventLifecycleTime']
        }
      )
      .refine(
        (data) => {
          const start = new Date(data.startEventLifecycleTime)
          const end = new Date(data.endEventLifecycleTime)
          const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          return durationDays <= 365
        },
        {
          message: 'Vòng đời sự kiện không thể kéo dài quá 365 ngày (1 năm)',
          path: ['endEventLifecycleTime']
        }
      )

      // 2. TicketSaleTime validation - must be within EventLifecycleTime
      .refine(
        (data) => {
          const saleStart = new Date(data.startTicketSaleTime)
          const saleEnd = new Date(data.endTicketSaleTime)
          return saleEnd >= saleStart
        },
        {
          message: 'Thời gian kết thúc bán vé phải sau hoặc bằng thời gian bắt đầu bán vé',
          path: ['endTicketSaleTime']
        }
      )
      .refine(
        (data) => {
          const lifecycleStart = new Date(data.startEventLifecycleTime)
          const saleStart = new Date(data.startTicketSaleTime)
          return saleStart >= lifecycleStart
        },
        {
          message: 'Thời gian bắt đầu bán vé phải nằm trong vòng đời sự kiện',
          path: ['startTicketSaleTime']
        }
      )
      .refine(
        (data) => {
          const lifecycleEnd = new Date(data.endEventLifecycleTime)
          const saleEnd = new Date(data.endTicketSaleTime)
          return saleEnd <= lifecycleEnd
        },
        {
          message: 'Thời gian kết thúc bán vé phải nằm trong vòng đời sự kiện',
          path: ['endTicketSaleTime']
        }
      )
      .refine(
        (data) => {
          const saleStart = new Date(data.startTicketSaleTime)
          const saleEnd = new Date(data.endTicketSaleTime)
          const durationDays = (saleEnd.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24)
          return durationDays <= 180
        },
        {
          message: 'Thời gian bán vé không thể kéo dài quá 180 ngày (6 tháng)',
          path: ['endTicketSaleTime']
        }
      )

      // 3. EventTime validation - must be after TicketSaleTime starts
      .refine(
        (data) => {
          const eventStart = new Date(data.startTimeEventTime)
          const eventEnd = new Date(data.endTimeEventTime)
          return eventEnd >= eventStart
        },
        {
          message: 'Thời gian kết thúc sự kiện phải sau hoặc bằng thời gian bắt đầu',
          path: ['endTimeEventTime']
        }
      )
      .refine(
        (data) => {
          const saleStart = new Date(data.startTicketSaleTime)
          const eventStart = new Date(data.startTimeEventTime)
          return eventStart >= saleStart
        },
        {
          message: 'Sự kiện phải diễn ra sau hoặc cùng lúc với thời điểm bắt đầu bán vé',
          path: ['startTimeEventTime']
        }
      )
      .refine(
        (data) => {
          const lifecycleEnd = new Date(data.endEventLifecycleTime)
          const eventEnd = new Date(data.endTimeEventTime)
          return eventEnd <= lifecycleEnd
        },
        {
          message: 'Thời gian kết thúc sự kiện phải nằm trong vòng đời sự kiện',
          path: ['endTimeEventTime']
        }
      )
      .refine(
        (data) => {
          const eventStart = new Date(data.startTimeEventTime)
          const eventEnd = new Date(data.endTimeEventTime)
          const durationDays = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24)
          return durationDays <= 30
        },
        {
          message: 'Sự kiện không thể kéo dài quá 30 ngày',
          path: ['endTimeEventTime']
        }
      )

      // 4. Location coordinates validation
      .refine(
        (data) => {
          const { latitude, longitude } = data.location.coordinates
          // Check if coordinates are in Vietnam (approximate bounds)
          const isInVietnam = latitude >= 8.0 && latitude <= 24.0 && longitude >= 102.0 && longitude <= 110.0
          return isInVietnam
        },
        {
          message: 'Tọa độ phải nằm trong lãnh thổ Việt Nam',
          path: ['location', 'coordinates']
        }
      )
  )
}

// ============================================
// CREATE EVENT SCHEMA - WITH PAST TIME CHECK
// ============================================

export const createEventSchema = applyCommonRefinements(
  baseEventObjectSchema.refine(
    (data) => {
      const now = new Date()
      const start = new Date(data.startEventLifecycleTime)
      return start >= now
    },
    {
      message: 'Thời gian bắt đầu vòng đời sự kiện không thể là thời điểm trong quá khứ',
      path: ['startEventLifecycleTime']
    }
  )
)

// ============================================
// UPDATE EVENT SCHEMA - WITHOUT PAST TIME CHECK
// ============================================

export const updateEventSchema = applyCommonRefinements(baseEventObjectSchema)

// ============================================
// TYPE EXPORTS
// ============================================

// For backwards compatibility, keep eventSchema as createEventSchema
export const eventSchema = createEventSchema

export type EventFormData = z.infer<typeof createEventSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>
export type UpdateEventFormData = z.infer<typeof updateEventSchema>

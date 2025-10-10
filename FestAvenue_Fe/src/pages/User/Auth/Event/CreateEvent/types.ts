import { z } from 'zod'

export const eventSchema = z.object({
  // Basic Information
  name: z.string().min(3, 'Tên sự kiện phải có ít nhất 3 ký tự').max(200, 'Tên sự kiện không được quá 200 ký tự'),
  shortDescription: z
    .string()
    .min(10, 'Mô tả ngắn phải có ít nhất 10 ký tự')
    .max(300, 'Mô tả ngắn không được quá 300 ký tự'),
  description: z.string().min(50, 'Mô tả chi tiết phải có ít nhất 50 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục sự kiện'),

  // Event Type & Visibility
  eventType: z.number().min(0, 'Vui lòng chọn loại sự kiện'),
  visibility: z.number().min(0, 'Vui lòng chọn chế độ hiển thị'),
  capacity: z.number().min(1, 'Sức chứa phải lớn hơn 0').max(1000000, 'Sức chứa không hợp lệ'),

  // Dates
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  registrationStartDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu đăng ký'),
  registrationEndDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc đăng ký'),

  // Media - AI Detection Required
  logoUrl: z.string().url('Logo phải là URL hợp lệ').optional().or(z.literal('')),
  bannerUrl: z.string().url('Banner phải là URL hợp lệ').optional().or(z.literal('')),
  trailerUrl: z.string().url('Trailer phải là URL hợp lệ').optional().or(z.literal('')),

  // Contact & Website
  website: z.string().url('Website phải là URL hợp lệ').optional().or(z.literal('')),
  publicContactEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  publicContactPhone: z.string().optional().or(z.literal('')),

  // Location
  location: z.object({
    venueId: z.string().optional(),
    address: z.object({
      street: z.string().min(1, 'Vui lòng nhập địa chỉ'),
      city: z.string().min(1, 'Vui lòng nhập thành phố'),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(1, 'Vui lòng nhập quốc gia')
    }),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    })
  }),

  // Hashtags
  hashtags: z.array(z.string()).optional(),

  // Organization - Required for creating event
  organization: z.object({
    name: z.string().min(3, 'Tên tổ chức phải có ít nhất 3 ký tự'),
    description: z.string().min(10, 'Mô tả tổ chức phải có ít nhất 10 ký tự'),
    logo: z.string().url('Logo tổ chức phải là URL hợp lệ'),
    website: z.string().url('Website tổ chức phải là URL hợp lệ').optional().or(z.literal('')),
    contact: z.object({
      email: z.string().email('Email không hợp lệ'),
      phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
      fax: z.string().optional().or(z.literal(''))
    })
  })
})

export type EventFormData = z.infer<typeof eventSchema>

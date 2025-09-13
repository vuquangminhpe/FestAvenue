import { z } from 'zod'

export const organizationSchema = z.object({
  name: z.string().min(2, 'Tên tổ chức phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  industry: z.string().min(1, 'Vui lòng chọn ngành nghề'),
  size: z.string().min(1, 'Vui lòng chọn quy mô công ty'),
  website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  logo: z.string().optional(),

  // Address
  street: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Thành phố là bắt buộc'),
  state: z.string().min(1, 'Tỉnh/Bang là bắt buộc'),
  postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
  country: z.string().min(1, 'Quốc gia là bắt buộc'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),

  // Contact
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  fax: z.string().optional(),

  // Social Media
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),

  // Subscription
  plan: z.string().min(1, 'Vui lòng chọn gói dịch vụ'),

  // Organization Settings - Branding
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  customDomain: z.string().optional(),

  // Organization Settings - Security
  ssoEnabled: z.boolean().optional(),
  minPasswordLength: z.number().min(6).optional(),
  requireSpecialChar: z.boolean().optional(),
  requireNumber: z.boolean().optional(),
  requireUppercase: z.boolean().optional(),
  passwordExpirationDays: z.number().min(0).optional()
})

export type FormData = z.infer<typeof organizationSchema>

export interface ChatConfig {
  groupChatId: string
  requestType: 'request_admin' | 'request_user' | 'dispute'
}

export interface MapCenter {
  lat: number
  lng: number
}
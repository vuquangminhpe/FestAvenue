import { Building, MapPin, Globe, Settings, Check } from 'lucide-react'
import type { FormData } from '../types'

export const industries = [
  'Công nghệ thông tin',
  'Giáo dục',
  'Y tế',
  'Tài chính',
  'Bán lẻ',
  'Sản xuất',
  'Dịch vụ',
  'Du lịch',
  'Bất động sản',
  'Khác'
]

export const companySizes = ['10', '50', '200', '500', '1000']

export const steps = [
  {
    title: 'Thông tin cơ bản',
    description: 'Tên và mô tả tổ chức',
    icon: Building
  },
  {
    title: 'Địa chỉ & Liên hệ',
    description: 'Thông tin liên hệ và địa điểm',
    icon: MapPin
  },
  {
    title: 'Mạng xã hội',
    description: 'Website và các kênh truyền thông',
    icon: Globe
  },
  {
    title: 'Thương hiệu',
    description: 'Màu sắc và tên miền',
    icon: Settings
  },
  {
    title: 'Bảo mật',
    description: 'Chính sách bảo mật',
    icon: Settings
  },
  {
    title: 'Hoàn tất',
    description: 'Chọn gói dịch vụ và xác nhận',
    icon: Check
  }
]

export const getFieldsForStep = (step: number): (keyof FormData)[] => {
  switch (step) {
    case 1:
      return ['name', 'description', 'industry', 'size']
    case 2:
      return ['street', 'city', 'state', 'postalCode', 'country', 'email', 'phone']
    case 3:
      return ['website']
    case 4:
      return []
    case 5:
      return []
    case 6:
      return ['plan']
    default:
      return []
  }
}

export const defaultFormValues: Partial<FormData> = {
  name: '',
  description: '',
  industry: '',
  size: '1',
  website: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Việt Nam',
  email: '',
  phone: '',
  fax: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  plan: '',
  primaryColor: '#06b6d4',
  secondaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  customDomain: '',
  ssoEnabled: false,
  minPasswordLength: 8,
  requireSpecialChar: false,
  requireNumber: false,
  requireUppercase: false,
  passwordExpirationDays: 90
}
import type { EventFormData } from './types'

export const steps = [
  {
    id: 1,
    title: 'Thông tin cơ bản',
    description: 'Tên, mô tả và danh mục sự kiện'
  },
  {
    id: 2,
    title: 'Chi tiết sự kiện',
    description: 'Loại sự kiện, sức chứa và thời gian'
  },
  {
    id: 3,
    title: 'Hình ảnh & Video',
    description: 'Logo, banner và video giới thiệu (AI kiểm tra)'
  },
  {
    id: 4,
    title: 'Địa điểm',
    description: 'Vị trí tổ chức sự kiện'
  },
  {
    id: 5,
    title: 'Thông tin liên hệ',
    description: 'Website, email và số điện thoại'
  },
  {
    id: 6,
    title: 'Thông tin tổ chức',
    description: 'Chi tiết về đơn vị tổ chức'
  },
  {
    id: 7,
    title: 'Hashtags',
    description: 'Thêm hashtags cho sự kiện'
  },
  {
    id: 8,
    title: 'Xác nhận & Gửi',
    description: 'Xem lại và gửi duyệt sự kiện'
  }
]

export const defaultFormValues: EventFormData = {
  name: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  eventType: 0,
  visibility: 0,
  capacity: 100,
  startDate: '',
  endDate: '',
  registrationStartDate: '',
  registrationEndDate: '',
  logoUrl: '',
  bannerUrl: '',
  trailerUrl: '',
  website: '',
  publicContactEmail: '',
  publicContactPhone: '',
  location: {
    venueId: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Việt Nam'
    },
    coordinates: {
      latitude: 10.8231,
      longitude: 106.6297
    }
  },
  hashtags: undefined,
  organization: {
    name: '',
    description: '',
    logo: '',
    website: '',
    contact: {
      email: '',
      phone: '',
      fax: ''
    }
  }
}

export const getFieldsForStep = (step: number): (keyof EventFormData)[] => {
  switch (step) {
    case 1:
      return ['name', 'shortDescription', 'description', 'categoryId']
    case 2:
      return [
        'eventType',
        'visibility',
        'capacity',
        'startDate',
        'endDate',
        'registrationStartDate',
        'registrationEndDate'
      ]
    case 3:
      return [] // Media validation handled separately with AI
    case 4:
      return ['location']
    case 5:
      return ['publicContactEmail', 'publicContactPhone']
    case 6:
      return ['organization'] // Organization info validation
    case 7:
      return [] // Hashtags are optional
    case 8:
      return [] // Final review step
    default:
      return []
  }
}

export const eventTypeOptions = [
  { value: 0, label: 'Hội nghị' },
  { value: 1, label: 'Hội thảo' },
  { value: 2, label: 'Buổi hòa nhạc' },
  { value: 3, label: 'Triển lãm' },
  { value: 4, label: 'Thể thao' },
  { value: 5, label: 'Lễ hội' },
  { value: 6, label: 'Khác' }
]

export const visibilityOptions = [
  { value: 0, label: 'Công khai', description: 'Mọi người đều có thể xem' },
  { value: 1, label: 'Riêng tư', description: 'Chỉ những người được mời mới xem được' }
]

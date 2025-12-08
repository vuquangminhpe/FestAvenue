export interface bodyCreateCategory {
  name: string
  description: string
  imageUrl: string
  isActive: boolean
}

export interface bodyUpdateCategory {
  id: string
  name: string
  description: string
  imageUrl: string
  isActive: boolean
}
export interface resAdminStatistics {
  general: {
    totalUsers: number
    totalEvents: number
    totalTicketsSold: number
    totalRevenue: number
  }
}

export interface resAdminGetAllUser {
  isStaff: boolean
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string | null
  avatar: string
  roles: string[]
  status: number
  lastLogin: string // ISO Date string
  twoFactorEnabled: boolean
  preferences: Preferences
  createdBy: string | null
  userFollows: UserFollow[]
  id: string
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
}

export interface Preferences {
  language: string
  timezone: string
  notifications: Notifications
}

export interface Notifications {
  email: boolean
  sms: boolean
  push: boolean
}

export interface UserFollow {
  eventCode: string
  followedAt: string // ISO Date string
}
export interface bodyGetAllUserFilter {
  status: number[]

  pagination: {
    pageIndex: number
    isPaging: boolean
    pageSize: number // mặc định 20
  }
}

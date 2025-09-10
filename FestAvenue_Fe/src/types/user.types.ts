export interface responseUser {
  name: string
}

export interface bodyLoginType {
  email: string
  password: string
}
export interface loginResponse {
  accessToken: string
}

export interface bodyRegisterType {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface registerResponse {
  messages: string
}
export interface updateBodyProfile {
  profileImage?: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}
export interface updatePasswordBody {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
export interface bodyResetPassword {
  token: string
  newPassword: string
}
export interface userRes {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  roles: [string]
  avatar: string
  status: number
  lastLogin: string
  twoFactorEnabled: boolean
  organizationIds: string[]
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  createdBy: string
}
export interface bodyUpdateAvatar {
  avatar: string
}
export interface OrganizationAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: string
  longitude?: string
}

export interface OrganizationContact {
  email: string
  phone: string
  fax?: string
}

export interface OrganizationSocialMedia {
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
}

export interface OrganizationSubscription {
  plan: string
  startDate: Date
  endDate: Date
  status: SubDescriptionStatus
}

export interface OrganizationBranding {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  customDomain?: string
}

export interface OrganizationPasswordPolicy {
  minLength?: number
  requireSpecialChar?: boolean
  requireNumber?: boolean
  requireUppercase?: boolean
  expirationDays?: number
}

export interface OrganizationSecurity {
  ssoEnabled?: boolean
  passwordPolicy?: OrganizationPasswordPolicy
}

export interface OrganizationSettings {
  branding?: OrganizationBranding
  security?: OrganizationSecurity
}

export interface CreateOrganizationBody {
  name: string
  description?: string
  industry?: string
  size?: number
  website?: string
  logo?: string
  address?: OrganizationAddress
  contact: OrganizationContact
  socialMedia?: OrganizationSocialMedia
  subDescription: OrganizationSubscription
  settings?: OrganizationSettings
}
export interface OrganizationType {
  id: string
  name: string
  description?: string
  industry?: string
  size?: number
  website?: string
  logo?: string
  address?: OrganizationAddress
  contact: OrganizationContact
  socialMedia?: OrganizationSocialMedia
  subDescription: OrganizationSubscription
  settings?: OrganizationSettings
}
export interface OrganizationResponse {
  id: string
  name: string
  description?: string
  industry?: string
  size?: string
  website?: string
  logo?: string
  address?: OrganizationAddress
  contact: OrganizationContact
  socialMedia?: OrganizationSocialMedia
  subscription: OrganizationSubscription
  settings?: OrganizationSettings
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive' | 'pending'
}

export interface CreateOrganizationResponse {
  organization: OrganizationResponse
  message: string
}
export interface Message {
  id?: string
  groupId: string
  userId: string
  message: string
  senderName: string
  avatar?: string
  sentAt: Date
  isCurrentUser?: boolean
}

export interface ChatSystemProps {
  groupChatId: string
  organizationName: string
  isVisible: boolean
  onClose: () => void
  requestType: 'request_admin' | 'request_user' | 'dispute'
}

export const SubDescriptionStatus = {
  Active: 1,
  Inactive: 0,
  Paymented: 2
} as const

export type SubDescriptionStatus = (typeof SubDescriptionStatus)[keyof typeof SubDescriptionStatus]

export interface bodyCheckExits {
  name: string
  latitude: string
  longitude: string
}
export interface GroupChatResponse {
  groupChatId: string
  groupChatName: string
  organizationId: string
  staffId: string
  avatarGroupUrl: string
  chatMessage: {
    chatMessageId: string
    content: string
    senderId: string
    senderName: string
    avatarUrl: string
    sentAt: string
  }
}
export interface bodyGetChatMessagesWithPagging {
  groupChatId: string
  pageSize: number
  page: number
}

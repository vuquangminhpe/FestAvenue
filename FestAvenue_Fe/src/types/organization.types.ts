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
  status: 'active' | 'inactive' | 'suspended' | 'trial'
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
  size?: string
  website?: string
  logo?: string
  address?: OrganizationAddress
  contact: OrganizationContact
  socialMedia?: OrganizationSocialMedia
  subscription: OrganizationSubscription
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
export interface MemberInput {
  userId: string
  isRequest: boolean
}

export const GroupChatStatus = {
  Normal: 0,
  CombatPending: 1,
  CombatRejected: 2,
  CombatAccepted: 3
} as const

export type GroupChatStatus = (typeof GroupChatStatus)[keyof typeof GroupChatStatus]

export interface bodyCreatedGroupChatOrganization {
  organizationId: string
  groupChatName: string
  members: MemberInput[]
  avatar: string
  statusId: GroupChatStatus
}

export interface Organization {
  name: string
  description: string
  logo: string
  website: string
  industry: string
  size: number
  address: Address
  contact: Contact
  socialMedia: SocialMedia
  subDescription: SubDescription
  settings: Settings
  createdBy: string
  packageId: string | null
  id: string
  createdAt: string // ISO date
  updatedAt: string | null
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude: string
  longitude: string
}

export interface Contact {
  email: string
  phone: string
  fax: string
}

export interface SocialMedia {
  facebook: string
  twitter: string
  linkedIn: string
  instagram: string
}

export interface SubDescription {
  plan: string
  startDate: string // ISO date
  endDate: string // ISO date
  status: number
}

export interface Settings {
  branding: Branding
  security: Security
}

export interface Branding {
  colors: Colors
  customDomain: string
}

export interface Colors {
  primary: string
  secondary: string
  accent: string
}

export interface Security {
  ssoEnabled: boolean
  passwordPolicy: PasswordPolicy
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecialCharacter: boolean
  expirationDays: number
}

export interface OrganizationResponse {
  organization: Organization
  isOwner: boolean
}

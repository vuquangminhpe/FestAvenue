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

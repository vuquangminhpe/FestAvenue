import type { EventStatus, EventType, EventVisibility } from '@/constants/enum'

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface Coordinates {
  latitude: number
  longitude: number
}

interface Location {
  venueId: string
  address: Address
  coordinates: Coordinates
}

interface TicketingSettings {
  taxIncluded: boolean
  taxPercentage: number
  invoiceEnabled: boolean
  cancellationPolicy: string
}

interface CustomQuestion {
  question: string
  type: string
  options: string[]
  required: boolean
}

interface RegistrationSettings {
  approvalRequired: boolean
  waitlistEnabled: boolean
  customQuestions: CustomQuestion[]
}

interface NotificationSettings {
  confirmationEmail: boolean
  reminderEmail: boolean
  reminderDays: number[]
  followUpEmail: boolean
}

interface Settings {
  ticketing: TicketingSettings
  registration: RegistrationSettings
  notifications: NotificationSettings
}

interface Metrics {
  views: number
  registrations: number
  attendance: number
  revenue: number
}

export interface Event {
  id: string
  name: string
  description: string
  shortDescription: string
  eventType: EventType
  categoryId: string
  status: EventStatus
  visibility: EventVisibility
  capacity: number
  startDate: string
  endDate: string
  registrationStartDate: string
  registrationEndDate: string
  logoUrl: string
  bannerUrl: string
  website: string
  publicContactEmail: string
  publicContactPhone: string
  location: Location
  ticketTypes: string[]
  sponsors: string[]
  speakers: string[]
  exhibitors: string[]
  hashtags: string[]
  settings: Settings
  metrics: Metrics
  organizationId: string
  moduleIds: string[]
}

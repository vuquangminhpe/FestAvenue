import type { EventStatus, EventVisibility } from '@/constants/enum'

interface Address {
  street: string
  city: string
  state?: string
  postalCode?: string
  country: string
}

interface Coordinates {
  latitude: number
  longitude: number
}

interface Location {
  venueId?: string
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
  moduleIds: []
}

export interface createEvent {
  name: string
  description: string
  shortDescription: string
  categoryId: string
  status: number
  visibility: number
  capacity: number
  // New time fields - Event Lifecycle covers all
  startEventLifecycleTime: string
  endEventLifecycleTime: string
  startTicketSaleTime: string
  endTicketSaleTime: string
  startTimeEventTime: string
  endTimeEventTime: string
  logoUrl: string
  bannerUrl: string
  trailerUrl?: string
  website?: string
  publicContactEmail?: string
  publicContactPhone?: string
  location: Location
  hashtags?: string[]
  organization: Organization
}
export interface EventType {
  name: string
  description: string
  shortDescription: string
  categoryId: string
  status: number
  visibility: number
  capacity: number
  // New time fields - Event Lifecycle covers all
  startEventLifecycleTime: string
  endEventLifecycleTime: string
  startTicketSaleTime: string
  endTicketSaleTime: string
  startTimeEventTime: string
  endTimeEventTime: string
  logoUrl: string
  bannerUrl: string
  trailerUrl?: string
  website?: string
  publicContactEmail?: string
  publicContactPhone?: string
  location: Location
  hashtags?: string[]
  organization: Organization
}
interface OrganizationContact {
  email: string
  phone: string
  fax: string
}

interface Organization {
  name: string
  description: string
  logo: string
  website: string
  contact: OrganizationContact
}
interface Pagination {
  orderBy?: string
  pageIndex: number
  isPaging: boolean
  pageSize: number
}

export interface EventSearchFilter {
  search: string
  categoryId?: string
  statuses: EventStatusValue[]
  pagination: Pagination
}
export interface EventSearchStaffFilter {
  search?: string
  categoryId?: string
  eventStatuses?: EventStatusValue[]
  pagination: Pagination
}
export const EventStatusValues = {
  Pending: 1,
  SelectPackage: 2,
  Active: 3,
  Reject: 4,
  Canceled: 5
} as const

export type EventStatusValue = (typeof EventStatusValues)[keyof typeof EventStatusValues]

export const EventTempStatusValues = {
  /**
   * Khi mới tạo sự kiện và gửi duyệt nhưng chưa chọn gói sự kiện
   */
  Draft: 1,

  /**
   * Gửi duyệt và được accept nhưng chưa chọn gói sự kiện
   */
  ContinueSetup: 2,

  /**
   * Đã chọn xong gói sự kiện
   */
  Active: 3,

  /**
   * Thay đổi thông tin sự kiện và gửi duyệt lại
   */
  Pending: 4,

  /**
   * Sự kiện đã hủy
   */
  Canceled: 5
} as const

export type EventTempStatusValue = (typeof EventTempStatusValues)[keyof typeof EventTempStatusValues]
export interface bodyApproveEventForStaff {
  eventVersionId: string
  message: string
}
export interface EventTemp {
  eventId: string
  eventName: string
  categoryId: string
  eventData: createEvent
  messageResponse: string
  eventTempStatus: number
  createdBy: string
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  total: number
  totalPage: number
}

export interface EventTempList {
  result: EventTemp[]
  pagination: PaginationInfo
}
export interface EventFilterList {
  result: {
    currentVersionNumber: number
    eventCode: number
    eventVersions: ReqFilterOwnerEvent[]
  }[]
  pagination: PaginationInfo
}
export interface EventTempResponse {
  data: EventTempList
  statusCode: number
  message: string
}
export interface EventLocation {
  [key: string]: any
}

export interface EventOrganization {
  name: string
  [key: string]: any
}

export interface ReqFilterOwnerEvent {
  id: string
  eventCode: string
  eventName: string
  shortDescription: string
  description: string
  bannerUrl: string
  logoUrl: string
  trailerUrl: string
  categoryId: string
  capacity: number
  visibility: number
  eventVersionStatus: number
  versionNumber: number
  createBy: string
  createdAt: string // ISO date string
  updatedAt: string | null

  // New time fields - Event Lifecycle covers all
  startEventLifecycleTime?: string // ISO date string
  endEventLifecycleTime?: string // ISO date string
  startTicketSaleTime?: string // ISO date string
  endTicketSaleTime?: string // ISO date string
  startTimeEventTime?: string // ISO date string
  endTimeEventTime?: string // ISO date string

  publicContactEmail: string
  publicContactPhone: string
  website: string

  hashtags: string[]
  organization: EventOrganization
  location: EventLocation

  messageResponse: string | null
  isFollowed?: boolean
}
export type ResEventByEventCode = ReqFilterOwnerEvent
export interface EventLocation {
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface EventOrganization {
  name: string
  description: string
  logo: string
  website: string
  contact: {
    email: string
    phone: string
    fax: string
  }
}

export interface EventVersion {
  eventCode: string
  versionNumber: number
  eventName: string
  description: string
  shortDescription: string
  categoryId: string
  eventVersionStatus: number
  visibility: number
  capacity: number
  startDate: string
  endDate: string
  registrationStartDate: string
  registrationEndDate: string
  logoUrl: string
  bannerUrl: string
  trailerUrl: string
  website: string
  publicContactEmail: string
  publicContactPhone: string
  location: EventLocation
  hashtags: string[]
  organization: EventOrganization
  createBy: string
  messageResponse: string | null
  id: string
  createdAt: string
  updatedAt: string | null
}
export interface EventVersionResForStaff {
  result: EventVersion[]
  pagination: Pagination
}
export interface bodySearchWithAI {
  SearchText?: string
  SearchImage?: File
}
export interface bodySearchEvent {
  searchText?: string
  categoryId?: string
  fromEventDate?: string
  toEventDate?: string
  fromCapacity?: number
  toCapacity?: number
  fromSaleTicket?: string
  toSaleTicket?: string
  searchMailEvent?: string
  searchPhoneEvent?: string
  hashtags?: string[]
  searchOrganization?: string
  pagination: {
    pageIndex?: number
    isPaging: true
    pageSize: number
  }
}
export interface WithdrawalRequest {
  withdrawalRequestId: string
  eventCode: string
  eventName: string
  userId: string
  fullName: string
  avatarUrl: string
  email: string
  phoneNumber: string
  organization: Organization
  bankAccountNumber: string
  bankName: string
  noteByAdmin: string
  linkExcel: string
  imageUrlReject: string
  totalTicketSold: number
  totalAmountForTicket: number
  reasonReject: string
  status: number // 0: Pending, 1: Accepted, 2: Rejected
  timeCreated: string // ISO datetime (e.g. 2025-11-11T13:10:16.502Z)
  timeResponse: string // ISO datetime
}
export interface WithdrawalRequestItem {
  id: string
  createdAt: string // ISO datetime (e.g. 2025-11-11T13:18:30.770Z)
  updatedAt: string // ISO datetime
  eventCode: string
  eventName: string
  userId: string
  fullName: string
  avatarUrl: string
  email: string
  phoneNumber: string
  organization: {
    name: string
    description: string
    logo: string
    website: string
    contact: {
      email: string
      phone: string
    }
  }
  bankAccountNumber: string
  bankName: string
  noteByAdmin: string
  linkExcel: string
  imageUrlReject: string
  totalTicketSold: number
  totalAmountForTicket: number
  reasonReject: string
  status: number
}
export interface bodyCreateWithDrawal {
  eventCode: string
  email: string
  phoneNumber: string
  bankAccountNumber: string
  bankName: string
}
export interface bodyGetListReqDrawalByAdmin {
  searchText?: string
  fromDateStartRequest?: string
  toDateStartRequest?: string
  fromDateResolveRequest?: string
  toDateResolveRequest?: string
  withdrawalRequestStatuses?: number[]
  pagination: Pagination
}
export interface getListWithDrawByAdminRes {
  result: WithdrawalRequest[]
  pagination: Pagination
}
export interface bodyAcceptRequestWithDrawal {
  withdrawalRequestId: string
  linkExcel: string
  noteByAdmin: string
}
export interface bodyRejectRequestWithDrawal {
  withdrawalRequestId: string
  reason: string
  envidenceRejectImageUrl: string
  noteByAdmin: string
}

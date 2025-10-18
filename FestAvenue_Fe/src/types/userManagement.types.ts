export interface EventUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: 'None' | 'Ticket manager' | 'Task manager' | 'Social manager' | 'Schedule manager'
  joinDate: string
  status: 'active' | 'inactive'
  avatar?: string
  permissions: string[]
}

export interface RoleOption {
  value: string
  label: string
}

export interface PermissionOption {
  value: string
  label: string
}

export interface bodySendInvitation {
  eventCode: string
  servicePackageIds: string[]
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}
export interface getInvitationsEvent {
  eventCode: string
  invitationStatuses: InvitationStatus
  searchMail: string
  paginationParam: {
    orderBy?: string
    pageIndex: number
    isPaging: boolean
    pageSize: number
  }
}
export const InvitationStatus = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Canceled: 3
} as const

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]
export interface bodyGetInvitationsReceived {
  paginationParam: paramPagination
}
type paramPagination = {
  orderBy?: string
  pageIndex: number
  isPaging: boolean
  pageSize: number
}
export interface bodyGetUserInEvent {
  eventCode: string
  searchFullName: string
  servicePackageIds: string[]
  paginationParam: paramPagination
}
export interface bodyUpdatePackagesForUser {
  eventCode: string
  userId: string
  addServicePackageIds: string[]
  removeServicePackageIds: string[]
}

export interface InvitationListResponse {
  result: InvitationResult[]
}

export interface InvitationResult {
  invitationId: string
  event: EventDetail
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl: string
  invitationStatus: InvitationStatus
}

export interface EventDetail {
  id: string
  createdAt: string
  updatedAt: string
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
  organization: Organization
  createBy: string
  messageResponse: string
}

export interface EventLocation {
  address: Address
  coordinates: Coordinates
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Organization {
  name: string
  description: string
  logo: string
  website: string
  contact: OrganizationContact
}

export interface OrganizationContact {
  email: string
  phone: string
  fax: string
}

export interface Pagination {
  total: number
  totalPage: number
}
export interface UserServicePackageListResponse {
  result: UserServicePackageResult[]
}

export interface UserServicePackageResult {
  userId: string
  fullName: string
  email: string
  avatarUrl: string
  servicePackages: ServicePackage[]
}

export interface ServicePackage {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  description: string
  icon: string
  price: number
  isActive: boolean
}
export interface ResGetPermissionService {
  id: string
  createdAt: string
  updatedAt: string
  eventCode: string
  userId: string
  servicePackageIds: string[]
}

export interface PackageDetail {
  packageId: string
  packageName: string
  description: string
  totalPrice: number
  isActive: boolean
  priority: number
  servicePackages: ServicePackage[]
}

export interface ServicePackage {
  id: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  name: string
  description: string
  icon: string
  price: number
  isActive: boolean
}

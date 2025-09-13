import type { SubDescriptionStatus } from '@/constants/enum'

export interface bodyCreatePaymentWithOrganization {
  organizationId: string
  packageId: string
}
export interface createPaymentWithOrganizationRes {
  code: string
  paymentId: string
  expirationTime: string
}
export interface getPaymentStatusByOrganizationRes {
  userId: string
  eventId?: string
  organizationId?: string
  ticketId?: string
  amount: number
  status: SubDescriptionStatus
  ticketType?: string
  transactionDate: string
  transactionId?: string
  discount: number
  refundAmount: number
  refundDate?: string
  refundReason?: string
  packageId?: string
}

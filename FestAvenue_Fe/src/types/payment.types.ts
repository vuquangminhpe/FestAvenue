export interface bodyCreateAndUpdatePackageEvent {
  eventCode: string
  packageId: string
}
export const PaymentStatus = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Refunded: 3,
  Cancelled: 4
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

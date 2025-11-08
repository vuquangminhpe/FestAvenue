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

export interface CreatePaymentRes {
  code: string
  paymentId: string
  expirationTime: string
  id: string
  createdAt: string
  updatedAt: string
}

export interface TransactionItem {
  user: TransactionUser
  event: TransactionEvent
  ticket: TransactionTicket
  package: TransactionPackage
  amount: number
  status: number
  transactionDate: string
  transactionId: string
  refundAmount: number
  refundDate: string
  refundReason: string
  isUpgrade: boolean
}

export interface TransactionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export interface TransactionEvent {
  eventCode: string
  eventName: string
  description: string
}

export interface TransactionTicket {
  id: string
  name: string
  description: string
  price: number
}

export interface TransactionPackage {
  id: string
  name: string
  totalPrice: number
}
export interface bodyCreatePaymentSeat {
  eventCode: string
  seatIndexes: string[]
}
export interface resCreatePaymentSeat {
  code: string
  paymentId: string
  expirationTime: string
  id: string
  createdAt: string
  updatedAt: boolean
}

// Socket event for ScanSeat
export interface ScanSeatEvent {
  eventCode: string
  seatIndex: string
  email: string
}

export interface ScanSeatResult {
  StatusCode: number
  Message: string
}

export interface SeatScannedBroadcast {
  EventCode: string
  SeatIndex: string
  Email: string
  Status: string
}

// Ticket for seat with lock info
export interface TicketForSeat {
  seatIndex: string
  email?: string
  isPayment?: number
  expirationTime?: string
  paymentInitiatedTime?: string // Thời điểm bắt đầu payment
  ticketId?: string
  price?: number
  isLocked: boolean
}

// UnlockSeat event for SignalR
export interface UnlockSeatEvent {
  eventCode: string
  seatIndex: string
  email?: string // undefined để loại bỏ
}

export interface UnlockSeatResult {
  StatusCode: number
  Message: string
}

export interface bodyCreateSeatingChart {
  eventCode: string
  seatingChartStructure: string
  ticketsForSeats: ticketsForSeatType[]
}
export interface ticketsForSeatType {
  ticketId: string
  seatIndex: string
  email?: string
}
export interface bodyCheckInSeat {
  eventCode: string
  seatIndex: string
  email: string
}
export interface resCheckInSeat {
  ticketId: string
  seatPrice: number
  seatIndex: string
  email: string
  isSeatLock: boolean
  paymentTime: string
  paymentInitiatedTime: string
  status: number
  isPayment: true
  firstName: string
  lastName: string
  phone: string
}

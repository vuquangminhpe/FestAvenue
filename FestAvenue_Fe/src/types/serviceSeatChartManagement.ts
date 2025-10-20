export interface bodyCreateSeatingChart {
  eventCode: string
  seatingChartStructure: string
  ticketsForSeats: ticketsForSeatType[]
}
export interface ticketsForSeatType {
  ticketId: string
  seatIndex: number
  isSeatLock: boolean
  email: string // Email làm khóa chính để identify user cho ghế
  isVerified: boolean
}

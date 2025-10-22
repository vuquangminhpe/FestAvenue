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

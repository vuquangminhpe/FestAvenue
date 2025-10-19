export interface bodyCreateTicketInEvent {
  name: string
  description: string
  price: number
  quantity: number
  isFree: boolean
  isPublic: boolean
  eventCode: string
  benefits: string[]
  startSaleDate: string
  endSaleDate: string
}
export interface bodyUpdateTicketInEvent {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  isFree: boolean
  isPublic: boolean
  benefits: string[]
  startSaleDate: string
  endSaleDate: string
}
export interface Ticket {
  name: string
  description: string
  price: number
  isFree: boolean
  quantity: number
  eventCode: string
  benefits: string[]
  isPublic: boolean
  startSaleDate: string // ISO date string
  endSaleDate: string // ISO date string
  id: string
  createdAt: string // ISO date string
  updatedAt: string | null
}

export interface TicketResponse {
  result: Ticket[]
}
export interface TicketPagination {
  orderBy: string
  pageIndex: number
  isPaging: boolean
  pageSize: number
}

export interface TicketSearchRequest {
  search: string
  createdFromDate: string // ISO date string
  createdToDate: string // ISO date string
  eventCode: string
  isPublic: boolean
  minPrice: number
  maxPrice: number
  pagination: TicketPagination
}

// Import types from API
import type { Ticket as APITicket } from '@/types/serviceTicketManagement.types'

// Re-export API Ticket type
export type Ticket = APITicket

export interface TicketFormData {
  name: string
  description: string
  price: number | string
  quantity: number | string
  benefits: string[]
  isFree: boolean
  isPublic: boolean
  startSaleDate: string
  endSaleDate: string
}

export interface TicketFilters {
  priceFrom: string
  priceTo: string
  isPublic: boolean | null
  sortBy: 'price' | 'name' | 'quantity' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

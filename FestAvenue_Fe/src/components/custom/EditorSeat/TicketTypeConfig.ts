import type { TicketType } from '@/types/seat.types'

export const TICKET_TYPES: TicketType[] = [
  {
    id: 'vip',
    name: 'vip',
    displayName: 'VIP',
    price: 150,
    color: '#FFD700'
  },
  {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    price: 100,
    color: '#C0C0C0'
  },
  {
    id: 'standard',
    name: 'standard',
    displayName: 'Standard',
    price: 50,
    color: '#22c55e'
  },
  {
    id: 'economy',
    name: 'economy',
    displayName: 'Economy',
    price: 25,
    color: '#60a5fa'
  }
]

export function getTicketTypeInfo(ticketTypeId: string): TicketType | undefined {
  return TICKET_TYPES.find((t) => t.id === ticketTypeId)
}

export function getTicketTypePrice(ticketTypeId: string): number {
  return getTicketTypeInfo(ticketTypeId)?.price || 0
}

export function getTicketTypeColor(ticketTypeId: string): string {
  return getTicketTypeInfo(ticketTypeId)?.color || '#22c55e'
}

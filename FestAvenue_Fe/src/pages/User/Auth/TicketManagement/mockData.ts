import type { Ticket } from './types'

export const mockTickets: Ticket[] = [
  {
    id: '68d13d4d217bb5e23ac9cc91',
    name: 'VIP Ticket',
    description: 'Vé VIP bao gồm chỗ ngồi đẹp và quà lưu niệm',
    price: 1500000,
    quantity: 70,
    seatInfo: 'Khu A',
    benefits: 'Chỗ ngồi hạng A, quà lưu niệm, lối vào riêng',
    isActive: true,
    isPublic: true,
    isSoldOut: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '68d14e9c217bb5e22ac9cc92',
    name: 'Standard Ticket',
    description: 'Vé tiêu chuẩn với chỗ ngồi thường',
    price: 800000,
    quantity: 50,
    seatInfo: 'Khu B',
    benefits: 'Chỗ ngồi khu vực thường, tham gia đầy đủ chương trình',
    isActive: true,
    isPublic: true,
    isSoldOut: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '68d14fbc217bb5e22ac9cc93',
    name: 'Early Bird Ticket',
    description: 'Vé ưu đãi mua sớm với giá rẻ hơn',
    price: 600000,
    quantity: 30,
    seatInfo: 'Khu C',
    benefits: 'Chỗ ngồi khu vực thường, tham gia đầy đủ chương trình',
    isActive: true,
    isPublic: false,
    isSoldOut: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

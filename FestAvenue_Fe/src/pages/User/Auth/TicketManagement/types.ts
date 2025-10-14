export interface Ticket {
  id: string
  name: string // Tên vé
  description: string // Mô tả chi tiết
  price: number // Giá vé
  quantity: number // Số lượng
  seatInfo: string // Thông tin ghế ngồi
  benefits: string // Quyền lợi vé
  isActive: boolean // Công khai
  isPublic?: boolean // Hiển thị các vé đã public
  isSoldOut?: boolean // Hiển thị các vé đã bán hết
  createdAt: string
  updatedAt: string
}

export interface TicketFormData {
  name: string
  description: string
  price: number | string
  quantity: number | string
  seatInfo: string
  benefits: string
  isActive: boolean
}

export interface TicketFilters {
  priceFrom: string
  priceTo: string
  isPublic: boolean
  isSoldOut: boolean
  sortBy: 'price' | 'name' | 'quantity' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

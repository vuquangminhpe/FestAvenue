export interface bodyCreateCategory {
  name: string
  description: string
  imageUrl: string
  isActive: boolean
}

export interface bodyUpdateCategory {
  id: string
  name: string
  description: string
  imageUrl: string
  isActive: boolean
}
export interface resAdminStatistics {
  general: {
    totalUsers: number
    totalEvents: number
    totalTicketsSold: number
    totalRevenue: number
  }
}

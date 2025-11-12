export interface ResponseEventDashBoardGeneral {
  eventSummary?: EventSummary
  participantAnalysis?: ParticipantAnalysis[]
  ticketSalesAnalysis?: TicketSalesAnalysis[]
  viewAnalysis?: ViewAnalysis[]
}

export interface EventSummary {
  totalParticipants: number
  totalRevenue: number
  totalViews: number
  totalSearches: number
  checkInRate: number
  profit: number
  popularTicketType: string
  totalSocialPosts: number
}

export interface ParticipantAnalysis {
  date: string
  totalTicket: number
}

export interface TicketSalesAnalysis {
  ticketType: string
  sold: number
  revenue: number
}

export interface ViewAnalysis {
  date: string
  views: number
}
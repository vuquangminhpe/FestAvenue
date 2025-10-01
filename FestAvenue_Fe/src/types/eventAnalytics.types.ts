export interface ParticipantAnalysis {
  date: string
  total: number
  checkedIn: number
  notCheckedIn: number
}

export interface TicketSalesAnalysis {
  ticketType: string
  sold: number
  revenue: number
  color: string
}

export interface RevenueAnalysis {
  date: string
  revenue: number
  expenses?: number
  profit?: number
}

export interface CheckInAnalysis {
  ticketType: string
  total: number
  checkedIn: number
  notCheckedIn: number
  checkInRate: number
}

export interface ViewAnalysis {
  date: string
  views: number
  uniqueViews: number
}

export interface SocialMediaPost {
  postId: string
  title: string
  content: string
  bannerUrl?: string
  postedDate: string
  views: number
  likes: number
  shares: number
  comments: number
  clicks: number
  clickRate: number
  color: string
}

export interface KeywordSearchAnalysis {
  keyword: string
  searchCount: number
  clickCount: number
  conversionRate: number
  avgPosition: number
  color: string
}

export interface EventSummary {
  eventId: string
  eventName: string
  eventDate: string
  totalParticipants: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  totalViews: number
  totalSearches: number
  totalSocialPosts: number
  totalSocialEngagement: number
  checkInRate: number
  popularTicketType: string
  peakSalesDate: string
}

export interface EventAnalytics {
  summary: EventSummary
  participants: ParticipantAnalysis[]
  ticketSales: TicketSalesAnalysis[]
  revenue: RevenueAnalysis[]
  checkIn: CheckInAnalysis[]
  eventViews: ViewAnalysis[]
  socialMediaPosts: SocialMediaPost[]
  keywordSearch: KeywordSearchAnalysis[]
}

export interface AnalyticsFilter {
  dateRange: {
    from: Date
    to: Date
  } | null
  eventId?: string
  compareMode: boolean
}

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | 'all' | 'custom'

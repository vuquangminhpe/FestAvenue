import type { StaffPerformance } from './eventAnalytics.types'

export interface EventSummary {
  totalParticipants: number
  totalRevenue: number
  totalViews: number
  checkInRate: number
  popularTicketType: string
  totalSocialPosts: number
}

export interface ParticipantAnalysisItem {
  date: string // ISO date string
  totalTicket: number
}

export interface TicketSalesAnalysisItem {
  ticketType: string
  sold: number
  revenue: number
}

export interface ViewAnalysisItem {
  date: string // "YYYY-MM-DD"
  views: number
}

export interface RevenueAnalysisItem {
  date: string
  revenue: number
}

export interface DashboardAnalytics {
  eventSummary: EventSummary
  participantAnalysis: ParticipantAnalysisItem[]
  ticketSalesAnalysis: TicketSalesAnalysisItem[]
  viewAnalysis: ViewAnalysisItem[]
  revenueAnalysis: RevenueAnalysisItem[]
}
export interface StaffStatistics {
  taskSummary: TaskSummary
  taskStatusAnalysis: TaskStatusAnalysisItem[]
  staffPerformance: StaffPerformance[]
}

export interface TaskSummary {
  totalStaff: number
  inProgressTasks: number
  completedTasks: number
  lateTasks: number
  avgTaskCompletionRate: number
}

export interface TaskStatusAnalysisItem {
  date: string // YYYY-MM-DD
  inProgress: number
  completed: number
  late: number
}
export interface SocialMediaPostStatistics {
  postId: string
  title: string
  content: string
  bannerUrl: string
  postedDate: string // YYYY-MM-DD
  views: number
  likes: number
  comments: number
  viewCount: number
  viewRate: number
  color: string // Hex color
}

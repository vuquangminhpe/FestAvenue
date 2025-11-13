export interface bodyGetMessagesFilterPaging {
  groupChatId: string
  page: number
  pageSize: number
  keyword?: string
  fromDate?: string
  toDate?: string
  isUrl?: boolean
}
export interface Member {
  userId: string
  email: string
  fullName: string
  avatar?: string | null
  isAdmin?: boolean
}

export interface EventGroup {
  name: string
  avatar: string | null
  members: Member[]
  eventCode: string
  id: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}
export interface ChatMessage {
  message: string
  senderId: string
  senderName: string
  avatar: string | null
  groupChatId: string
  isUrl: boolean
  deliveredTo: string
  id: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export interface ChatMessageResponse {
  chatMessages: ChatMessage[]
  currentPage: number
  totalPages: number
  pageSize: number
}

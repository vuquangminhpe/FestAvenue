// Legacy types
export interface bodyGetMessagesFilterPaging {
  groupChatId: string
  page: number
  pageSize: number
  keyword?: string
  fromDate?: string
  toDate?: string
  isUrl?: boolean
}

// New types matching SignalR ChatMessageHub
export interface CreateChatMessageInput {
  groupChatId: string
  message?: string
  isUrl?: boolean
}

export interface GetChatMessagesInput {
  groupChatId: string
  page?: number
  pageSize?: number
  keyword?: string
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

// SignalR event types
export interface NewMessageReceived {
  id: string
  groupChatId: string
  senderId: string
  senderName: string
  message: string
  avatar?: string
  sentAt: string
  isUrl: boolean
}

export interface MessageSentResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface MessageUpdated {
  messageId: string
  groupChatId: string
  newMessage: string
  updatedAt: string
}

export interface MessageDeleted {
  messageId: string
  groupChatId: string
}

export interface MessagesMarkedAsRead {
  groupChatId: string
  userId: string
  markedAt: string
}

export interface MessageReadByUser {
  messageId: string
  userId: string
  userName: string
  readAt: string
}

export interface MessageError {
  error: string
  details?: string
}

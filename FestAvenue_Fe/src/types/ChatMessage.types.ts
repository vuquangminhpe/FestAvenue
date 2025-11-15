export interface bodyGetMessagesFilterPaging {
  groupChatId: string
  page: number
  pageSize: number
  keyword?: string
  fromDate?: string
  toDate?: string
  isUrl?: boolean
}

// SignalR ChatMessageHub input types (matching C# hub exactly)
export interface CreateChatMessageInput {
  GroupChatId: string
  Message?: string
  IsUrl?: boolean
}

export interface GetChatMessagesInput {
  GroupChatId: string
  Page: number
  PageSize: number
  Keyword?: string
  IsUrl?: boolean
}

export interface UpdateChatMessageInput {
  MessageId: string
  NewContent: string
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
  createdAt: string
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
  newContent: string
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
export interface resChatMessage {
  message: string
  senderId: string
  senderName: string
  avatar: string
  groupChatId: string
  isUrl: boolean
  deliveredTo: string[] //userId của người đó
  id: string
  createdAt: string
  updatedAt: string
}
export interface resChatPaging {
  chatMessages: resChatMessage[]
  currentPage: number
  totalPages: number
  pageSize: number
}

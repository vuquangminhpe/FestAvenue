export interface ChatMessage {
  message: string
  senderId: string
  senderName: string
  avatar: string
  groupChatId: string
  id: string
  createdAt: string
  createAtNumbers: number
  updatedAt: string | null
  updateAtNumbers: number | null
}

export interface ChatMessagesResponse {
  chatMessages: ChatMessage[]
  currentPage: number
  totalPages: number
  pageSize: number
}

export interface SignalRMessage {
  id?: string
  groupChatId: string
  senderId: string
  senderName: string
  avatar?: string
  message: string
  sentAt: Date
  isCurrentUser?: boolean
}

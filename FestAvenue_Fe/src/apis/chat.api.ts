import type { APIResponse } from '@/types/API.types'
import type {
  bodyGetMessagesFilterPaging,
  ChatMessageResponse,
  EventGroup,
  CreateChatMessageInput,
  GetChatMessagesInput
} from '@/types/ChatMessage.types'
import type {
  bodyAddMemberInGroup,
  bodyCreateEventCode,
  bodyRemoveMemberInGroup,
  bodyUpdateGroupChat
} from '@/types/GroupChat.types'
import http from '@/utils/http'

const ChatApis = {
  // Legacy API - deprecated
  getMessagesFilterPaging: async (body: bodyGetMessagesFilterPaging) => {
    const data = await http.post<APIResponse<ChatMessageResponse>>('/chat/messages/get-message-filter-paging', body)
    return data?.data
  },

  // New APIs matching SignalR ChatMessageHub
  // Get messages with pagination and filters
  getChatMessages: async (body: GetChatMessagesInput) => {
    const data = await http.post<APIResponse<ChatMessageResponse>>('/chat-messages/get', body)
    return data?.data
  },

  // Send message (alternative to SignalR)
  sendMessage: async (body: CreateChatMessageInput) => {
    const data = await http.post<APIResponse<{ message: string; messageId: string }>>('/chat-messages/send', body)
    return data?.data
  },

  // Update message
  updateMessage: async (messageId: string, newContent: string) => {
    const data = await http.put<APIResponse<{ message: string }>>(`/chat-messages/${messageId}`, {
      message: newContent
    })
    return data?.data
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(`/chat-messages/${messageId}`)
    return data?.data
  },

  // Mark messages as read
  markMessagesAsRead: async (groupChatId: string) => {
    const data = await http.post<APIResponse<{ message: string }>>('/chat-messages/mark-read', {
      groupChatId
    })
    return data?.data
  }
}

const GroupChat = {
  createGroupChat: async (body: bodyCreateEventCode) => {
    const data = await http.post<APIResponse<{ message: string; groupChatId: string }>>('/group-chat/create', body)
    return data?.data
  },
  addMemberInGroup: async (body: bodyAddMemberInGroup) => {
    const data = await http.post<APIResponse<{ message: string }>>('/group-chat/add-members', body)
    return data?.data
  },
  removeMemberInGroup: async (body: bodyRemoveMemberInGroup) => {
    const data = await http.post<APIResponse<{ message: string }>>('/group-chat/remove-members', body)
    return data?.data
  },
  getDetailInfoByGroupChatId: async (groupChatId: string) => {
    const data = await http.get<APIResponse<EventGroup>>(`/group-chat/${groupChatId}`)
    return data?.data
  },
  deleteGroupChatByGroupChatId: async (groupChatId: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(`/group-chat/${groupChatId}`)
    return data?.data
  },
  // Lấy danh sách group chat mà user đang là thành viên
  getGroupChatByUserId: async (userId: string) => {
    const data = await http.get<APIResponse<EventGroup[]>>(`/group-chat/user/${userId}`)
    return data?.data
  },
  // Cập nhật thông tin group
  updateGroupChat: async (body: bodyUpdateGroupChat) => {
    const data = await http.put<APIResponse<{ message: string }>>('/group-chat/update', body)
    return data?.data
  }
}

export default { ChatApis, GroupChat }

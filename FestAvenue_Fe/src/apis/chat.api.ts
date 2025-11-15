import type { APIResponse } from '@/types/API.types'
import type { bodyGetMessagesFilterPaging, EventGroup, resChatPaging } from '@/types/ChatMessage.types'
import type {
  bodyAddMemberInGroup,
  bodyCreateEventCode,
  bodyRemoveMemberInGroup,
  bodyUpdateGroupChat
} from '@/types/GroupChat.types'
import http from '@/utils/http'

const ChatMessage = {
  getMessagesWithPagging: async (body: bodyGetMessagesFilterPaging) => {
    const data = await http.post<APIResponse<resChatPaging>>('/chat/messages/get-message-filter-paging', body)
    return data?.data?.data
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
    return data?.data?.data
  },
  // Cập nhật thông tin group
  updateGroupChat: async (body: bodyUpdateGroupChat) => {
    const data = await http.put<APIResponse<{ message: string }>>('/group-chat/update', body)
    return data?.data
  }
}

export default { ChatMessage, GroupChat }

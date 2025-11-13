export interface bodyCreateEventCode {
  name: string
  informationInvites: string[]
  eventCode: string
}
export interface bodyAddMemberInGroup {
  groupChatId: string
  informationNewMembers: MemberAddGroup[]
}
export interface MemberAddGroup {
  email: string
  name: string
  phone: string
}
export interface bodyRemoveMemberInGroup {
  groupChatId: string
  memberIds: string[]
}
export interface bodyUpdateGroupChat {
  groupChatId: string
  name?: string
  avatar?: string
}

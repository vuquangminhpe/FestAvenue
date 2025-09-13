import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import { useUsersStore } from '@/contexts/app.context'
import type { OrganizationType } from '@/types/user.types'
import type { ChatConfig } from '../types'

export const useChat = () => {
  const [showChatSystem, setShowChatSystem] = useState(false)
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null)
  
  const userProfile = useUsersStore((state) => state.isProfile)
  
  const createdGroupChatOrganizationMutation = useMutation({
    mutationFn: userApi.createdGroupChatOrganization
  })

  const handleConflictResolution = (
    type: 'request_admin' | 'request_user' | 'dispute',
    existingOrganization: OrganizationType
  ) => {
    const groupChatName = `${type}_${existingOrganization?.name}_${Date.now()}`

    const groupChatData = {
      organizationId: existingOrganization?.id || '',
      groupChatName,
      userIds: [userProfile?.id || '', existingOrganization?.id || ''],
      avatar: existingOrganization?.logo || ''
    }

    createdGroupChatOrganizationMutation.mutate(groupChatData, {
      onSuccess: (response) => {
        const groupChatId = response.data as any

        setChatConfig({
          groupChatId,
          requestType: type
        })
        setShowChatSystem(true)
        toast.success('Tạo group chat thành công!')
      },
      onError: (error: any) => {
        toast.error(error?.data?.message || 'Không thể tạo group chat')
      }
    })
  }

  const closeChatSystem = () => {
    setShowChatSystem(false)
    setChatConfig(null)
  }

  return {
    showChatSystem,
    chatConfig,
    handleConflictResolution,
    closeChatSystem,
    createdGroupChatOrganizationMutation
  }
}